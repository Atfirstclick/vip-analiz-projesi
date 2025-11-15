import React from 'react'
import Link from 'next/link'
import { ArrowRight, Users, Award } from 'lucide-react'
import Button from '@/components/ui/Button'
import Container from '@/components/ui/Container'

const HeroSection = () => {
  return (
<section className="relative min-h-screen flex items-center overflow-hidden bg-linear-to-br from-vip-gold via-vip-gold-light to-vip-gold pt-32 md:pt-40">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-vip-navy rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <Container className="relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Sol taraf - Metin içeriği */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full mb-6 shadow-lg">
              <Award className="w-5 h-5 text-vip-navy" />
              <span className="text-sm font-semibold text-vip-navy">
                Bireysel İlginin Gücü
              </span>
            </div>

            {/* Ana Başlık */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-vip-navy mb-6 leading-tight">
              EN FAZLA{' '}
              <span className="inline-block bg-vip-navy text-vip-gold px-4 py-2 rounded-lg">
                3 KİŞİLİK
              </span>{' '}
              VIP SINIFLARDA
              <br />
              <span className="text-vip-navy-dark">
                KALİTELİ EĞİTİM
              </span>
            </h1>

            {/* Alt Başlık */}
            <p className="text-lg md:text-xl text-vip-navy mb-8 max-w-2xl mx-auto lg:mx-0 font-medium">
              Kalabalık sınıflara son! Her öğrenciye özel ilgi ile başarıya ulaşın. 
              Özel ders kalitesini grup dinamiği ile birleştiren yenilikçi yaklaşım.
            </p>

            {/* CTA Butonları */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/kayit">
                <Button variant="primary" size="lg" className="group">
                  Hemen Başla
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#ozellikler">
                <Button variant="outline" size="lg">
                  Daha Fazla Bilgi
                </Button>
              </Link>
            </div>

            {/* İstatistikler */}
            <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t-2 border-vip-navy/20">
              <div className="text-center lg:text-left">
                <div className="text-3xl md:text-4xl font-bold text-vip-navy">
                  500+
                </div>
                <div className="text-sm text-vip-navy-dark font-medium mt-1">
                  Başarılı Öğrenci
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl md:text-4xl font-bold text-vip-navy">
                  50+
                </div>
                <div className="text-sm text-vip-navy-dark font-medium mt-1">
                  Uzman Öğretmen
                </div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl md:text-4xl font-bold text-vip-navy">
                  %98
                </div>
                <div className="text-sm text-vip-navy-dark font-medium mt-1">
                  Memnuniyet Oranı
                </div>
              </div>
            </div>
          </div>

          {/* Sağ taraf - Görsel/İllustration alanı */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative">
              <div className="w-full max-w-lg">
                <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
                  <div className="flex items-center justify-center mb-6">
                    <Users className="w-24 h-24 text-vip-navy" />
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-vip-navy mb-3">
                      VIP Sınıf Deneyimi
                    </h3>
                    <p className="text-vip-navy-dark">
                      Maksimum 3 öğrenci ile her birine özel ilgi
                    </p>
                  </div>

                  <div className="mt-6 space-y-3">
                    {[
                      'Bireysel Öğretim',
                      'Esnek Saatler',
                      'Uzman Eğitmenler'
                    ].map((feature, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-3 bg-vip-gold/10 rounded-lg p-3"
                      >
                        <div className="w-2 h-2 bg-vip-navy rounded-full"></div>
                        <span className="text-vip-navy font-medium">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="absolute -top-6 -right-6 w-32 h-32 bg-vip-navy rounded-full opacity-20 blur-2xl"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white rounded-full opacity-30 blur-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Wave SVG */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg 
          viewBox="0 0 1440 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <path 
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" 
            fill="white"
          />
        </svg>
      </div>
    </section>
  )
}

export default HeroSection