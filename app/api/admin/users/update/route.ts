import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser, createClient as createServerClient } from '@/lib/supabase/server'

export async function PUT(request: NextRequest) {
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

    const body = await request.json()
    const { userId, email, password, full_name, phone, role } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID gerekli' }, { status: 400 })
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

    // Auth user güncelle (email ve/veya şifre)
    const updateData: any = {
      email,
      user_metadata: {
        full_name,
        phone: phone || null,
      }
    }

    // Şifre varsa güncelle
    if (password && password.length >= 6) {
      updateData.password = password
    }

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      updateData
    )

    if (authError) {
      console.error('Auth update error:', authError)
      
      let errorMessage = authError.message
      if (authError.message.includes('email')) {
        errorMessage = 'Bu email adresi başka bir kullanıcı tarafından kullanılıyor!'
      }
      
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    // Profile güncelle
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        email,
        full_name,
        phone: phone || null,
        role
      })
      .eq('id', userId)

    if (profileError) {
      console.error('Profile update error:', profileError)
      return NextResponse.json({ 
        error: 'Profil güncellenemedi' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Kullanıcı başarıyla güncellendi'
    })

  } catch (error: any) {
    console.error('User update error:', error)
    return NextResponse.json(
      { error: 'Kullanıcı güncellenemedi', details: error.message },
      { status: 500 }
    )
  }
}