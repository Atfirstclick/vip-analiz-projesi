import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Kullanıcı kontrolü - sadece admin yapabilir
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Yetkilendirme gerekli' },
        { status: 401 }
      )
    }

    // Admin kontrolü
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, slug, description, icon, is_active, display_order } = body

    // Zorunlu alan kontrolü
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Ders adı ve slug zorunludur' },
        { status: 400 }
      )
    }

    // Slug benzersizlik kontrolü
    const { data: existingSubject } = await supabase
      .from('subjects')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingSubject) {
      return NextResponse.json(
        { error: 'Bu slug zaten kullanılıyor' },
        { status: 400 }
      )
    }

    // Ders oluştur
    const { data: newSubject, error: insertError } = await supabase
      .from('subjects')
      .insert({
        name,
        slug,
        description: description || null,
        icon: icon || null,
        is_active: is_active ?? true,
        display_order: display_order ?? 0
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Ders eklenirken hata oluştu' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      subject: newSubject 
    })

  } catch (error: any) {
    console.error('Create subject error:', error)
    return NextResponse.json(
      { error: error.message || 'Sunucu hatası' },
      { status: 500 }
    )
  }
}