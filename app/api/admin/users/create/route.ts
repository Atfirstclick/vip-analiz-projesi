import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser, createClient as createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Admin kontrolü
    const supabase = await createServerClient()
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const body = await request.json()
    const { email, password, full_name, phone, role } = body

    // Validasyon
    if (!email || !password || !full_name) {
      return NextResponse.json({ 
        error: 'Email, şifre ve ad soyad zorunludur' 
      }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ 
        error: 'Şifre en az 6 karakter olmalıdır' 
      }, { status: 400 })
    }

    // Service Role ile admin client oluştur (admin session'ı etkilemez!)
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

    // Kullanıcı oluştur (admin session'ı korunur!)
    const { data: newUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Email doğrulaması gerekmesin
      user_metadata: {
        full_name,
        phone: phone || null,
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      
      // Türkçe hata mesajı
      let errorMessage = authError.message
      if (authError.code === 'email_exists') {
        errorMessage = 'Bu email adresi zaten kayıtlı!'
      }
      
      return NextResponse.json({ 
        error: errorMessage 
      }, { status: 400 })
    }
    // Profile güncellemesi
    if (newUser.user) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          role: role || 'student',
          full_name,
          phone: phone || null,
          email
        })
        .eq('id', newUser.user.id)

      if (profileError) {
        console.error('Profile update error:', profileError)
      }
    }

    return NextResponse.json({ 
      success: true,
      user: {
        id: newUser.user?.id,
        email: newUser.user?.email,
        full_name
      }
    })

  } catch (error: any) {
    console.error('User creation error:', error)
    return NextResponse.json(
      { error: 'Kullanıcı oluşturulamadı', details: error.message },
      { status: 500 }
    )
  }
}