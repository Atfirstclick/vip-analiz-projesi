'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import Button from '@/components/ui/Button'
import Container from '@/components/ui/Container'

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-gray-100 shadow-sm">
      <Container>
        <div className="flex items-center justify-between py-5">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0">
              <Image
                src="/images/logo.svg"
                alt="VipAnaliz"
                width={80}
                height={80}
                priority
                className="object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-vip-navy group-hover:text-vip-gold transition-colors">
                VipAnaliz Özel Öğretim Kursu
              </h1>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/giris">
              <Button variant="outline" size="sm">
                Giriş Yap
              </Button>
            </Link>
            <Link href="/kayit">
              <Button variant="primary" size="sm">
                Kayıt Ol
              </Button>
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-vip-navy hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 pb-4 border-t border-gray-100 pt-3">
          <a href="#hakkimizda" className="text-vip-navy hover:text-vip-gold font-medium transition-colors duration-200 text-sm lg:text-base">
            Hakkımızda
          </a>
          <Link href="/urunler" className="text-vip-navy hover:text-vip-gold font-medium transition-colors duration-200 text-sm lg:text-base">
            Online Alışveriş
          </Link>
          <a href="#nasil-calisir" className="text-vip-navy hover:text-vip-gold font-medium transition-colors duration-200 text-sm lg:text-base">
            Nasıl Çalışır?
          </a>
          <a href="#iletisim" className="text-vip-navy hover:text-vip-gold font-medium transition-colors duration-200 text-sm lg:text-base">
            İletişim
          </a>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <a href="#hakkimizda" className="text-vip-navy hover:text-vip-gold font-medium transition-colors px-4 py-2" onClick={() => setIsMobileMenuOpen(false)}>
                Hakkımızda
              </a>
              <Link href="/urunler" className="text-vip-navy hover:text-vip-gold font-medium transition-colors px-4 py-2" onClick={() => setIsMobileMenuOpen(false)}>
                Online Alışveriş
              </Link>
              <a href="#nasil-calisir" className="text-vip-navy hover:text-vip-gold font-medium transition-colors px-4 py-2" onClick={() => setIsMobileMenuOpen(false)}>
                Nasıl Çalışır?
              </a>
              <a href="#iletisim" className="text-vip-navy hover:text-vip-gold font-medium transition-colors px-4 py-2" onClick={() => setIsMobileMenuOpen(false)}>
                İletişim
              </a>
              <div className="flex flex-col space-y-2 px-4 pt-4 border-t border-gray-200">
                <Link href="/giris">
                  <Button variant="outline" size="md" fullWidth onClick={() => setIsMobileMenuOpen(false)}>
                    Giriş Yap
                  </Button>
                </Link>
                <Link href="/kayit">
                  <Button variant="primary" size="md" fullWidth onClick={() => setIsMobileMenuOpen(false)}>
                    Kayıt Ol
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </Container>
    </nav>
  )
}

export default Navbar