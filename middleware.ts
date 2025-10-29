// middleware.ts

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// KORUMALI ROTALARIN LİSTESİ
// Bu listeye eklediğiniz her sayfa, sadece giriş yapmış kullanıcılar tarafından erişilebilir olacak.
const protectedRoutes = ['/profil', '/etut-randevu', '/ders-videolari'];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Kullanıcı oturumunu yeniler ve kullanıcı bilgisini alır.
  const { data: { user } } = await supabase.auth.getUser();

  // YENİ VE AKILLI KORUMA MANTIĞI
  const { pathname } = request.nextUrl;

  // 1. Kullanıcı korumalı bir rotaya mı gitmeye çalışıyor?
  if (protectedRoutes.includes(pathname)) {
    // 2. Eğer korumalı rotaya gitmeye çalışıyorsa, giriş yapmış mı?
    if (!user) {
      // 3. Giriş yapmamışsa, onu login sayfasına yönlendir.
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('message', 'Bu sayfayı görmek için giriş yapmalısınız.');
      return NextResponse.redirect(url);
    }
  }
  // BİTİŞ

  return response
}

// Bu config'i eski haline, yani tüm rotaları kapsayacak şekilde geri alıyoruz.
// Çünkü hangi rotanın korunacağına artık yukarıdaki kod listesi karar veriyor.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
