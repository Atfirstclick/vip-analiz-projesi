import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/server'

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Admin kontrolü
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID gerekli' }, { status: 400 })
    }

    // Kendini silmeyi engelle
    if (userId === user.id) {
      return NextResponse.json({ 
        error: 'Kendi hesabınızı silemezsiniz' 
      }, { status: 400 })
    }

    // Profile silme (auth.users cascade ile silinecek)
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('Profile delete error:', profileError)
      return NextResponse.json({ 
        error: 'Kullanıcı silinemedi' 
      }, { status: 500 })
    }

    // NOT: auth.users silme için Service Role Key gerekli
    // Şimdilik sadece profile siliyoruz
    // Production'da Supabase Service Role ile auth.users da silinmeli

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('User deletion error:', error)
    return NextResponse.json(
      { error: 'Kullanıcı silinemedi', details: error.message },
      { status: 500 }
    )
  }
}