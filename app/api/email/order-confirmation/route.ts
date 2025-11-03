import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getOrderConfirmationEmail } from '@/lib/email-templates'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      customerEmail,
      customerName,
      orderNumber,
      orderDate,
      items,
      totalAmount
    } = body

    // Email içeriğini hazırla
    const emailContent = getOrderConfirmationEmail({
      customerName,
      orderNumber,
      orderDate,
      items,
      totalAmount
    })

    // Email gönder
    const { data, error } = await resend.emails.send({
      from: 'VipAnaliz <onboarding@resend.dev>', // Resend test domain
      to: customerEmail,
      subject: emailContent.subject,
      html: emailContent.html
    })

    if (error) {
      console.error('Email send error:', error)
      return NextResponse.json({ error: 'Email could not be sent' }, { status: 500 })
    }

    console.log('Email sent successfully:', data)

    return NextResponse.json({ success: true, emailId: data?.id })

  } catch (error: any) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { error: 'Email sending failed', details: error.message },
      { status: 500 }
    )
  }
}