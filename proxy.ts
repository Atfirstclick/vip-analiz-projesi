// middleware.ts (Tavsiye edilen dosya adı budur)

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Korumalı rotaların listesi
const protectedRoutes = ['/profil', '/etut-randevu', '/ders-videolari'];

export async function middleware(request: NextRequest) {
  // Bu, gelen isteğe dayalı olarak bir yanıt oluşturur
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Supabase istemcisini, cookie'leri yönetebileceği bir context ile oluştururuz.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Eğer bir cookie set edilirse, isteği ve cevabı klonlayıp
          // yeni cookie'yi her ikisine de ekleriz.
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          // Eğer bir cookie silinirse, aynı klonlama işlemini yaparız.
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Kullanıcı oturumunu yenilemek ve bilgisini almak kritik öneme sahiptir.
  const { data: { user } } = await supabase.auth.getUser()

  // KORUMA MANTIĞI (Bu kısım aynı kalıyor)
  const { pathname } = request.nextUrl
  if (protectedRoutes.includes(pathname) && !user) {
      const url = new URL('/login', request.url)
      url.searchParams.set('message', 'Bu sayfayı görmek için giriş yapmalısınız.')
      return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
