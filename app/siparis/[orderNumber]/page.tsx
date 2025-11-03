import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function SiparisPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>
  searchParams: Promise<{ status?: string }>
}) {
  const user = await getCurrentUser()
  const { orderNumber } = await params
  const { status } = await searchParams

  if (!user) {
    redirect('/login')
  }

  const supabase = await createClient()

  // Siparişi bul
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('order_number', orderNumber)
    .eq('user_id', user.id)
    .single()

  console.log('Order query:', { orderNumber, order, orderError })

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-8xl">❌</span>
          <h2 className="text-3xl font-bold text-gray-900 mt-6 mb-4">
            Sipariş Bulunamadı
          </h2>
          <p className="text-gray-600 mb-4">Sipariş No: {orderNumber}</p>
          {orderError && (
            <p className="text-sm text-red-600 mb-4">Hata: {orderError.message}</p>
          )}
          <Link
            href="/urunler"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Alışverişe Devam Et
          </Link>
        </div>
      </div>
    )
  }

  const isSuccess = status === 'success' || order.status === 'paid'

  function formatPrice(price: number) {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price)
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Başarı/Hata Bildirimi */}
        <div className={`rounded-2xl shadow-lg overflow-hidden mb-8 ${
          isSuccess ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
        }`}>
          <div className="p-12 text-center">
            <span className="text-8xl">
              {isSuccess ? '✅' : '❌'}
            </span>
            <h1 className={`text-4xl font-bold mt-6 mb-3 ${
              isSuccess ? 'text-green-900' : 'text-red-900'
            }`}>
              {isSuccess ? 'Siparişiniz Alındı!' : 'Ödeme Başarısız'}
            </h1>
            <p className={`text-lg ${
              isSuccess ? 'text-green-700' : 'text-red-700'
            }`}>
              {isSuccess 
                ? 'Ödemeniz başarıyla tamamlandı. En kısa sürede sizinle iletişime geçeceğiz.' 
                : 'Ödeme işlemi tamamlanamadı. Lütfen tekrar deneyin.'}
            </p>
          </div>
        </div>

        {/* Sipariş Detayları */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sipariş Detayları</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-sm text-gray-600 mb-1">Sipariş Numarası</p>
              <p className="text-lg font-mono font-bold text-gray-900">{order.order_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Sipariş Tarihi</p>
              <p className="text-lg font-semibold text-gray-900">{formatDate(order.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Durum</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                order.status === 'paid' 
                  ? 'bg-green-100 text-green-800'
                  : order.status === 'failed'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {order.status === 'paid' && '✓ Ödendi'}
                {order.status === 'failed' && '✗ Başarısız'}
                {order.status === 'pending' && '⏳ Beklemede'}
                {order.status === 'cancelled' && '🚫 İptal'}
                {order.status === 'refunded' && '↩️ İade'}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Ödeme Yöntemi</p>
              <p className="text-lg font-semibold text-gray-900">
                {order.payment_method === 'credit_card' && '💳 Kredi Kartı'}
                {order.payment_method === 'bank_transfer' && '🏦 Havale/EFT'}
              </p>
            </div>
          </div>

          {/* Sipariş Kalemleri */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Satın Alınan Ürünler</h3>
            <div className="space-y-4">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex justify-between items-start bg-gray-50 p-4 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {item.product_name}
                    </h4>
                    <p className="text-sm text-gray-600">{item.variant_name}</p>
                    <div className="flex gap-3 text-xs text-gray-500 mt-1">
                      {item.grade && <span>📚 {item.grade}. Sınıf</span>}
                      {item.subject && <span>📖 {item.subject}</span>}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-gray-900">{formatPrice(item.subtotal)}</p>
                    <p className="text-sm text-gray-500">{formatPrice(item.unit_price)} x {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-6 mt-6 border-t">
              <span className="text-xl font-bold text-gray-900">Toplam</span>
              <span className="text-3xl font-bold text-blue-600">{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="flex gap-4">
          <Link
            href="/urunler"
            className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-center hover:bg-blue-700 transition-colors"
          >
            Alışverişe Devam Et
          </Link>
          <Link
            href="/profil"
            className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-lg font-semibold text-center hover:bg-gray-200 transition-colors"
          >
            Profilim
          </Link>
        </div>

        {/* Bilgilendirme */}
        {isSuccess && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">📧 Sırada Ne Var?</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>✓ Sipariş onay e-postası gönderildi</li>
              <li>✓ Eğitim danışmanımız en kısa sürede sizinle iletişime geçecek</li>
              <li>✓ Randevu tarihiniz belirlenecek ve bilgilendirileceksiniz</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}