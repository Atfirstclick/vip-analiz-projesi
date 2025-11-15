import React from 'react'
import Navbar from '@/components/landing/Navbar'
import HeroSection from '@/components/landing/HeroSection'

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      
      {/* Diğer section'lar buraya eklenecek */}
      {/* <FeaturesSection /> */}
      {/* <HowItWorksSection /> */}
      {/* <CTASection /> */}
      {/* <Footer /> */}
    </main>
  )
}