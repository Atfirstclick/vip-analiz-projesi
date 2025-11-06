import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()

    // Kullanıcı kontrolü
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
    const { 
      subjectId, 
      name, 
      slug, 
      description, 
      icon, 
      is_active, 
      display_order,
      teacherIds = [] 
    } = body

    // Zorunlu alan kontrolü
    if (!subjectId || !name || !slug) {
      return NextResponse.json(
        { error: 'Ders ID, adı ve slug zorunludur' },
        { status: 400 }
      )
    }

    // Slug benzersizlik kontrolü (kendi ID'si hariç)
    const { data: existingSubject } = await supabase
      .from('subjects')
      .select('id')
      .eq('slug', slug)
      .neq('id', subjectId)
      .single()

    if (existingSubject) {
      return NextResponse.json(
        { error: 'Bu slug başka bir ders tarafından kullanılıyor' },
        { status: 400 }
      )
    }

    // Ders güncelle
    const { data: updatedSubject, error: updateError } = await supabase
      .from('subjects')
      .update({
        name,
        slug,
        description: description || null,
        icon: icon || null,
        is_active: is_active ?? true,
        display_order: display_order ?? 0
      })
      .eq('id', subjectId)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Ders güncellenirken hata oluştu' },
        { status: 500 }
      )
    }

    // Öğretmen atamalarını güncelle
    // 1. Önce mevcut tüm atamaları sil
    const { error: deleteError } = await supabase
      .from('teacher_subjects')
      .delete()
      .eq('subject_id', subjectId)

    if (deleteError) {
      console.error('Delete teacher assignments error:', deleteError)
    }

    // 2. Yeni atamaları ekle
    if (teacherIds.length > 0) {
      const assignments = teacherIds.map((teacherId: string) => ({
        teacher_id: teacherId,
        subject_id: subjectId
      }))

      const { error: insertError } = await supabase
        .from('teacher_subjects')
        .insert(assignments)

      if (insertError) {
        console.error('Insert teacher assignments error:', insertError)
        return NextResponse.json(
          { error: 'Öğretmen atamaları güncellenirken hata oluştu' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ 
      success: true, 
      subject: updatedSubject,
      teachersAssigned: teacherIds.length
    })

  } catch (error: any) {
    console.error('Update subject error:', error)
    return NextResponse.json(
      { error: error.message || 'Sunucu hatası' },
      { status: 500 }
    )
  }
}