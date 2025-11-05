import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser, createClient as createServerClient } from '@/lib/supabase/server'

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createServerClient()

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

    // Service Role ile admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Auth.users'tan sil (bu profiles'ı da cascade ile siler)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Auth delete error:', authError)
      return NextResponse.json({ 
        error: 'Kullanıcı silinemedi: ' + authError.message 
      }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('User deletion error:', error)
    return NextResponse.json(
      { error: 'Kullanıcı silinemedi', details: error.message },
      { status: 500 }
    )
  }
}