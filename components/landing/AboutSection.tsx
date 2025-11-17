'use client'

import React, { useRef } from 'react'
import { motion, useInView, Variants } from 'framer-motion'
import Container from '@/components/ui/Container'

const features = [
  {
    icon: '🎯',
    title: 'Bireysel Yaklaşım',
    description: 'Her öğrenciye özel program'
  },
  {
    icon: '📊',
    title: 'Takip Sistemi',
    description: 'Düzenli ilerleme raporları'
  },
  {
    icon: '👨‍🏫',
    title: 'Uzman Kadro',
    description: 'Alanında deneyimli öğretmenler'
  }
]

export default function AboutSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const leftVariants: Variants = {
    hidden: { opacity: 0, x: -50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8 }
    }
  }

  const rightVariants: Variants = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.8 }
    }
  }

  return (
    <section id="hakkimizda" ref={ref} className="py-20 bg-white relative scroll-mt-32">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Sol Taraf - İçerik */}
          <motion.div
            variants={leftVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {/* Üst Badge */}
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-vip-gold/20 text-vip-navy rounded-full text-sm font-semibold">
                ✨ Hakkımızda
              </span>
            </div>

            {/* Başlık */}
            <h2 className="text-5xl md:text-6xl font-bold text-vip-navy mb-6">
              Eğitimde Yeni Bir Dönem
            </h2>

            {/* Açıklama */}
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              2018'den beri öğrencilerimizin başarısı için çalışıyoruz. 
              Maksimum 3 kişilik VIP sınıflarımızla her öğrenciye özel ilgi 
              göstererek hedeflerine ulaşmalarını sağlıyoruz.
            </p>

            {/* Özellikler */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: 0.3 + (index * 0.1) }}
                  className="flex items-start gap-4 p-4 rounded-lg hover:bg-vip-gold/5 transition-colors"
                >
                  <div className="text-5xl shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-vip-navy mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-lg text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Sağ Taraf - Görsel */}
          <motion.div
            variants={rightVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="relative"
          >
            {/* Dekoratif arka plan elementleri */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-vip-gold/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-vip-navy/10 rounded-full blur-3xl"></div>
            
            {/* SVG İllustration */}
            <div className="relative z-10">
              <img 
                src="/images/about-us.svg" 
                alt="Hakkımızda" 
                className="w-full h-auto drop-shadow-xl"
              />
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}