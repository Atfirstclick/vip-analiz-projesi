import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const subjectId = searchParams.get('subjectId')

    if (!subjectId) {
      return NextResponse.json(
        { error: 'Ders ID gerekli' },
        { status: 400 }
      )
    }

    // Bu derse bağlı öğretmen var mı kontrol et
    const { data: teacherSubjects } = await supabase
      .from('teacher_subjects')
      .select('id')
      .eq('subject_id', subjectId)
      .limit(1)

    if (teacherSubjects && teacherSubjects.length > 0) {
      return NextResponse.json(
        { error: 'Bu ders öğretmenlere atanmış, silinemez. Önce öğretmen atamalarını kaldırın.' },
        { status: 400 }
      )
    }

    // Ders sil
    const { error: deleteError } = await supabase
      .from('subjects')
      .delete()
      .eq('id', subjectId)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: 'Ders silinirken hata oluştu' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Ders başarıyla silindi' 
    })

  } catch (error: any) {
    console.error('Delete subject error:', error)
    return NextResponse.json(
      { error: error.message || 'Sunucu hatası' },
      { status: 500 }
    )
  }
}