'use client'

import React from 'react'
import { FaWhatsapp, FaInstagram, FaMapMarkerAlt, FaPhone } from 'react-icons/fa'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer id="iletisim" className="bg-vip-navy text-white scroll-mt-32">
      {/* Ana İçerik */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Sol Taraf - İletişim Bilgileri */}
            <div>
              {/* Logo & Başlık */}
              <div className="mb-8">
                <h3 className="text-3xl font-bold text-vip-gold mb-2">
                  VipAnaliz
                </h3>
                <p className="text-gray-300">
                  Özel Öğretim Kursu
                </p>
              </div>

              {/* Adres */}
              <div className="mb-6 flex items-start gap-4">
                <FaMapMarkerAlt className="text-vip-gold text-2xl shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-lg mb-2">Adres</h4>
                  <p className="text-gray-300 leading-relaxed">
                    Yıldırım Beyazıt, Kış Sk. No:10A<br />
                    43020 Kütahya Merkez/Kütahya
                  </p>
                </div>
              </div>

              {/* Telefonlar */}
              <div className="mb-6 flex items-start gap-4">
                <FaPhone className="text-vip-gold text-2xl shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-lg mb-2">Telefon</h4>
                  <a 
                    href="tel:+905073312211" 
                    className="block text-gray-300 hover:text-vip-gold transition-colors mb-1"
                  >
                    +90 507 331 22 11
                  </a>
                  <a 
                    href="tel:+905312140978" 
                    className="block text-gray-300 hover:text-vip-gold transition-colors"
                  >
                    +90 531 214 09 78
                  </a>
                </div>
              </div>

              {/* Sosyal Medya */}
              <div className="mb-6">
                <h4 className="font-semibold text-lg mb-4">Bizi Takip Edin</h4>
                <div className="flex gap-4">
                  {/* WhatsApp */}
                  <a
                    href="https://wa.me/905073312211"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-vip-gold text-vip-navy flex items-center justify-center hover:bg-vip-gold-light transition-all hover:scale-110"
                    aria-label="WhatsApp"
                  >
                    <FaWhatsapp className="text-2xl" />
                  </a>

                  {/* Instagram */}
                  <a
                    href="https://www.instagram.com/vipanaliz.online/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-vip-gold text-vip-navy flex items-center justify-center hover:bg-vip-gold-light transition-all hover:scale-110"
                    aria-label="Instagram"
                  >
                    <FaInstagram className="text-2xl" />
                  </a>
                </div>
              </div>

              {/* Çalışma Saatleri - Opsiyonel */}
              <div className="text-gray-400 text-sm">
                <p>Salı - Pazar: 09:00 - 21:00</p>
                <p>Pazartesi: Kapalı</p>
              </div>
            </div>

            {/* Sağ Taraf - Google Maps */}
            <div>
              <div className="rounded-2xl overflow-hidden shadow-2xl h-full min-h-[400px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d192.6242017875642!2d29.990274654009795!3d39.42441325383677!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14c9486c1c781f1b%3A0x52078bb203747f6d!2zWcSxbGTEsXLEsW0gQmV5YXrEsXQsIEvEscWfIFNrLiBObzoxMCwgNDMwMjAgS8O8dGFoeWEgTWVya2V6L0vDvHRhaHlh!5e0!3m2!1sen!2str!4v1763636583671!5m2!1sen!2str"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '400px' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="VipAnaliz Konum"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alt Kısım - Copyright */}
      <div className="border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-sm">
            <p>
              © {currentYear} VipAnaliz Özel Öğretim Kursu. Tüm hakları saklıdır.
            </p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-vip-gold transition-colors">
                Gizlilik Politikası
              </a>
              <a href="#" className="hover:text-vip-gold transition-colors">
                Kullanım Koşulları
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}