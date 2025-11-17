'use client'

import React, { useRef } from 'react'
import { motion, useInView, Variants } from 'framer-motion'
import Container from '@/components/ui/Container'

const steps = [
  {
    number: '1',
    image: '/images/kayit-ol-illustration.svg',
    title: 'Kayıt Ol',
    description: 'Hızlı ve kolay kayıt süreciyle hesabını oluştur, uygun ders paketini seç'
  },
  {
    number: '2',
    image: '/images/choose-program-illustration.svg',
    title: 'Program Belirle',
    description: 'Uzman danışmanlarımız sana özel bir eğitim programı hazırlar'
  },
  {
    number: '3',
    image: '/images/start-lesson-illustration.svg',
    title: 'Derslere Başla',
    description: 'Maksimum 3 kişilik VIP sınıflarında kaliteli eğitim almaya başla'
  },
  {
    number: '4',
    image: '/images/hedefine-ulas-illustration.svg',
    title: 'Hedefine Ulaş',
    description: 'Düzenli takip ve destek ile hedeflerine emin adımlarla ilerle'
  }
]

export default function HowItWorksSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.6
      }
    })
  }

  return (
    <section 
      id="nasil-calisir" 
      ref={ref} 
      className="relative bg-linear-to-br from-vip-gold via-vip-gold-light to-vip-gold pt-32 pb-20 scroll-mt-32"
    >
      {/* Wave Divider - Beyaz → Altın (ÜSTTE) - Daha sakin dalga */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
        <svg 
          className="relative block w-full h-32" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1440 320" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,128C672,107,768,85,864,96C960,107,1056,149,1152,154.7C1248,160,1344,128,1392,112L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" 
            fill="#ffffff"
          />
        </svg>
      </div>

      <Container>
        {/* Başlık */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
          >
            <span className="px-4 py-2 bg-vip-navy/10 text-vip-navy rounded-full text-sm font-semibold inline-block mb-4">
              💡 Nasıl Çalışır?
            </span>
            <h2 className="text-5xl md:text-6xl font-bold text-vip-navy mb-4">
              Başarıya 4 Adımda Ulaş
            </h2>
            <p className="text-xl text-vip-navy/80 max-w-2xl mx-auto">
              Kayıttan hedefe ulaşmaya kadar her adımda yanındayız
            </p>
          </motion.div>
        </div>

        {/* Timeline - Desktop */}
        <div className="hidden lg:block relative">
          {/* Bağlantı Çizgisi */}
          <div className="absolute top-24 left-0 right-0 h-1 bg-vip-navy/20">
            <motion.div
              initial={{ width: 0 }}
              animate={isInView ? { width: "100%" } : { width: 0 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="h-full bg-vip-navy"
            />
          </div>

          {/* Adımlar */}
          <div className="grid grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                className="relative"
              >
                {/* Numara Çemberi */}
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-vip-navy flex items-center justify-center text-4xl font-bold text-vip-gold shadow-xl relative z-10">
                    {step.number}
                  </div>
                </div>

                {/* Kart */}
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow">
                  <div className="mb-4 flex justify-center">
                    <img 
                      src={step.image} 
                      alt={step.title}
                      className="w-32 h-32 object-contain"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-vip-navy mb-3 text-center">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Timeline - Mobile/Tablet */}
        <div className="lg:hidden space-y-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="relative"
            >
              <div className="flex gap-6">
                {/* Sol: Numara */}
                <div className="shrink-0">
                  <div className="w-16 h-16 rounded-full bg-vip-navy flex items-center justify-center text-2xl font-bold text-vip-gold shadow-lg">
                    {step.number}
                  </div>
                </div>

                {/* Sağ: Kart */}
                <div className="flex-1 bg-white rounded-2xl p-6 shadow-lg">
                  <div className="mb-3 flex justify-center">
                    <img 
                      src={step.image} 
                      alt={step.title}
                      className="w-24 h-24 object-contain"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-vip-navy mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Bağlantı Çizgisi (son adım hariç) */}
              {index < steps.length - 1 && (
                <div className="ml-8 h-8 w-1 bg-vip-navy/20 my-2" />
              )}
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}