import crypto from 'crypto'

interface PaymentData {
  orderId: string
  amount: number
  userEmail: string
  userName: string
  userPhone: string
  userAddress: string
  basketItems: Array<{
    name: string
    price: number
    quantity: number
  }>
}

export function isPayTRMockMode(): boolean {
  return process.env.PAYTR_MERCHANT_ID === '123456' || 
         process.env.NODE_ENV === 'development'
}

export function generatePayTRToken(data: PaymentData): string {
  // Mock mode ise dummy token döndür
  if (isPayTRMockMode()) {
    return `MOCK_TOKEN_${data.orderId}_${Date.now()}`
  }

  // Gerçek PayTR token oluşturma
  const merchantId = process.env.PAYTR_MERCHANT_ID!
  const merchantKey = process.env.PAYTR_MERCHANT_KEY!
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT!

  const basketStr = data.basketItems
    .map(item => `["${item.name}","${(item.price * 100).toFixed(0)}",${item.quantity}]`)
    .join(',')
  const basket = `[${basketStr}]`

  const hashStr = 
    merchantId +
    data.userEmail +
    data.orderId +
    (data.amount * 100).toFixed(0) +
    basket +
    'no_installment' +
    '1' +
    'TL' +
    '1' +
    merchantSalt

  const token = crypto
    .createHmac('sha256', merchantKey)
    .update(hashStr)
    .digest('base64')

  return token
}

export function verifyPayTRCallback(hash: string, merchantOid: string, status: string, totalAmount: string): boolean {
  if (isPayTRMockMode()) {
    return true
  }

  const merchantKey = process.env.PAYTR_MERCHANT_KEY!
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT!

  const hashStr = merchantOid + merchantSalt + status + totalAmount
  const expectedHash = crypto
    .createHmac('sha256', merchantKey)
    .update(hashStr)
    .digest('base64')

  return hash === expectedHash
}