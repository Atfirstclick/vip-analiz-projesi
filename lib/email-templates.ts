export function getOrderConfirmationEmail(data: {
  customerName: string
  orderNumber: string
  orderDate: string
  items: Array<{
    productName: string
    variantName: string
    quantity: number
    price: number
  }>
  totalAmount: number
}) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <strong>${item.productName}</strong><br>
        <span style="color: #6b7280; font-size: 14px;">${item.variantName}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        ${formatPrice(item.price * item.quantity)}
      </td>
    </tr>
  `).join('')

  return {
    subject: `✅ Siparişiniz Alındı - ${data.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Siparişiniz Alındı!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">VipAnaliz Eğitim Platformu</p>
          </div>

          <!-- Greeting -->
          <div style="margin-bottom: 30px;">
            <p style="font-size: 16px; margin: 0 0 10px 0;">Merhaba <strong>${data.customerName}</strong>,</p>
            <p style="font-size: 16px; margin: 0; color: #6b7280;">
              Siparişiniz başarıyla alındı! Ödemeniz tamamlandı ve en kısa sürede sizinle iletişime geçeceğiz.
            </p>
          </div>

          <!-- Order Details Box -->
          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
            <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #111827;">Sipariş Detayları</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Sipariş Numarası:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; font-family: 'Courier New', monospace;">${data.orderNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Sipariş Tarihi:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold;">${formatDate(data.orderDate)}</td>
              </tr>
            </table>
          </div>

          <!-- Order Items -->
          <div style="margin-bottom: 30px;">
            <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #111827;">Satın Alınan Ürünler</h2>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
              <thead>
                <tr style="background: #f9fafb;">
                  <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Ürün</th>
                  <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Adet</th>
                  <th style="padding: 12px; text-align: right; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Fiyat</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr>
                  <td colspan="2" style="padding: 16px 12px; text-align: right; font-weight: bold; font-size: 18px;">TOPLAM:</td>
                  <td style="padding: 16px 12px; text-align: right; font-weight: bold; font-size: 18px; color: #2563eb;">${formatPrice(data.totalAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Next Steps -->
          <div style="background: #dbeafe; border-left: 4px solid #2563eb; padding: 20px; border-radius: 5px; margin-bottom: 30px;">
            <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #1e40af;">📋 Sırada Ne Var?</h3>
            <ul style="margin: 0; padding-left: 20px; color: #1e3a8a;">
              <li style="margin-bottom: 8px;">Eğitim danışmanımız en kısa sürede sizinle iletişime geçecek</li>
              <li style="margin-bottom: 8px;">Randevu tarihiniz belirlenecek</li>
              <li style="margin-bottom: 8px;">Ders programınız oluşturulacak</li>
              <li>Etüt seanslarınız başlayacak</li>
            </ul>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/siparis/${data.orderNumber}" 
               style="display: inline-block; background: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Siparişimi Görüntüle
            </a>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">Herhangi bir sorunuz mu var?</p>
            <p style="margin: 0 0 15px 0;">
              <a href="mailto:destek@vipanaliz.com" style="color: #2563eb; text-decoration: none;">destek@vipanaliz.com</a>
            </p>
            <p style="margin: 0; opacity: 0.7;">© 2025 VipAnaliz Eğitim Platformu. Tüm hakları saklıdır.</p>
          </div>

        </body>
      </html>
    `
  }
}