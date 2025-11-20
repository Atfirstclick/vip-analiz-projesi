import React from 'react'
import Navbar from '@/components/landing/Navbar'
import HeroSection from '@/components/landing/HeroSection'
import AboutSection from '@/components/landing/AboutSection'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <HowItWorksSection />
      <Footer />

      {/* Diğer section'lar buraya eklenecek */}
      {/* <FeaturesSection /> */}
      {/* <HowItWorksSection /> */}
      {/* <CTASection /> */}
      {/* <Footer /> */}
    </main>
  )
}