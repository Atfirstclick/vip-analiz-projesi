import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SinifListesi from './SinifListesi'

export default async function SiniflarPage() {
  const supabase = await createClient()

  // Auth kontrolü
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/giris')

  // Admin kontrolü
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  // Sınıfları çek
  const { data: classes } = await supabase
    .from('classes')
    .select('id, name, grade, season, max_students, is_active, created_at')
    .order('season', { ascending: false })
    .order('grade', { ascending: true })
    .order('name', { ascending: true })

  // Her sınıf için sayıları çek
  const classesWithCounts = await Promise.all(
    (classes || []).map(async (cls) => {
      const { count: studentCount } = await supabase
        .from('class_students')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', cls.id)
        .eq('is_active', true)

      const { count: scheduleCount } = await supabase
        .from('class_schedule')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', cls.id)

      const { data: schedules } = await supabase
        .from('class_schedule')
        .select('start_time, end_time')
        .eq('class_id', cls.id)

      let totalHours = 0
      schedules?.forEach(s => {
        const start = new Date(`2000-01-01T${s.start_time}`)
        const end = new Date(`2000-01-01T${s.end_time}`)
        totalHours += (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      })

      return {
        ...cls,
        studentCount: studentCount || 0,
        scheduleCount: scheduleCount || 0,
        totalHours: Math.round(totalHours * 10) / 10
      }
    })
  )

  return <SinifListesi classes={classesWithCounts} />
}