import React from 'react'
import Navbar from '@/components/landing/Navbar'
import HeroSection from '@/components/landing/HeroSection'
import AboutSection from '@/components/landing/AboutSection'
import HowItWorksSection from '@/components/landing/HowItWorksSection'

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <HowItWorksSection />

      {/* Diğer section'lar buraya eklenecek */}
      {/* <FeaturesSection /> */}
      {/* <HowItWorksSection /> */}
      {/* <CTASection /> */}
      {/* <Footer /> */}
    </main>
  )
}