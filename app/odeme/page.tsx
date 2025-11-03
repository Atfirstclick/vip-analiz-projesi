import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase/server'
import PaymentPage from './PaymentPage'

export default async function OdemePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; orderNumber?: string }>
}) {
  const user = await getCurrentUser()
  const params = await searchParams

  if (!user) {
    redirect('/login')
  }

  if (!params.token || !params.orderNumber) {
    redirect('/sepet')
  }

  return <PaymentPage token={params.token} orderNumber={params.orderNumber} />
}