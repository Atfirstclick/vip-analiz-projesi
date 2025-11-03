'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PaymentPage({ token, orderNumber }: { token: string; orderNumber: string }) {
  const router = useRouter()
  const [processing, setProcessing] = useState(false)
  const [mockPaymentMethod, setMockPaymentMethod] = useState('credit_card')

  // Mock mode kontrolü
  const isMockMode = token.startsWith('MOCK_TOKEN')

  async function handleMockPayment(success: boolean) {
    setProcessing(true)

    try {
      // Callback simüle et
      const response = await fetch('/api/payment/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant_oid: orderNumber,
          status: success ? 'success' : 'failed',
          payment_type: mockPaymentMethod,
          total_amount: '10000', // Mock değer
          hash: 'mock_hash',
          failed_reason_msg: success ? '' : 'Kullanıcı ödemeyi iptal etti'
        })
      })

      const result = await response.json()

      if (result.success) {
        // Başarı sayfasına yönlendir
        router.push(`/siparis/${orderNumber}?status=success`)
      } else {
        router.push(`/siparis/${orderNumber}?status=failed`)
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Ödeme işlemi sırasında bir hata oluştu')
    } finally {
      setProcessing(false)
    }
  }

  if (!isMockMode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <div className="text-center mb-6">
            <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
              <span className="text-4xl">💳</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">PayTR Ödeme Ekranı</h1>
            <p className="text-gray-600">PayTR iframe burada yüklenecek</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Bilgi:</strong> Gerçek PayTR hesabı entegre edildiğinde bu alan PayTR iframe'i olacak.
            </p>
          </div>

          {/* Gerçek PayTR iframe buraya gelecek */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <p className="text-gray-500">PayTR iFrame Alanı</p>
            <p className="text-xs text-gray-400 mt-2">Token: {token}</p>
          </div>
        </div>
      </div>
    )
  }

  // Mock Mode UI
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
            <span className="text-4xl">💳</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Demo Ödeme Ekranı</h1>
          <p className="text-gray-600">Test amaçlı ödeme simülasyonu</p>
        </div>

        {/* Mock Mode Uyarısı */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <p className="text-sm text-blue-900 font-semibold mb-1">Test Modu Aktif</p>
              <p className="text-xs text-blue-800">
                Bu bir demo ödeme ekranıdır. Gerçek PayTR hesabı bağlandığında bu ekran PayTR iframe'i ile değiştirilecektir.
              </p>
            </div>
          </div>
        </div>

        {/* Sipariş Bilgileri */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Bilgileri</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Sipariş No:</span>
              <span className="font-mono font-semibold text-gray-900">{orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Token:</span>
              <span className="font-mono text-xs text-gray-500">{token.slice(0, 30)}...</span>
            </div>
          </div>
        </div>

        {/* Mock Ödeme Yöntemi Seçimi */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Ödeme Yöntemi (Demo)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMockPaymentMethod('credit_card')}
              className={`p-4 border-2 rounded-lg transition-all ${
                mockPaymentMethod === 'credit_card'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">💳</div>
              <div className="text-sm font-medium text-gray-900">Kredi Kartı</div>
            </button>
            <button
              onClick={() => setMockPaymentMethod('bank_transfer')}
              className={`p-4 border-2 rounded-lg transition-all ${
                mockPaymentMethod === 'bank_transfer'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">🏦</div>
              <div className="text-sm font-medium text-gray-900">Havale/EFT</div>
            </button>
          </div>
        </div>

        {/* Mock Kart Bilgileri */}
        {mockPaymentMethod === 'credit_card' && (
          <div className="mb-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kart Numarası (Demo)
              </label>
              <input
                type="text"
                value="4242 4242 4242 4242"
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Son Kullanma Tarihi
                </label>
                <input
                  type="text"
                  value="12/25"
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  value="123"
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>
          </div>
        )}

        {/* Test Butonları */}
        <div className="space-y-3">
          <button
            onClick={() => handleMockPayment(true)}
            disabled={processing}
            className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {processing ? 'İşleniyor...' : '✓ Başarılı Ödeme Simüle Et'}
          </button>

          <button
            onClick={() => handleMockPayment(false)}
            disabled={processing}
            className="w-full bg-red-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {processing ? 'İşleniyor...' : '✗ Başarısız Ödeme Simüle Et'}
          </button>

          <button
            onClick={() => router.push('/sepet')}
            disabled={processing}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            ← Sepete Dön
          </button>
        </div>

        {/* Bilgilendirme */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Bu test ekranıdır. Gerçek para transferi yapılmamaktadır.
          </p>
        </div>
      </div>
    </div>
  )
}