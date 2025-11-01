// proxy.ts
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Korumalı rotalar
const protectedRoutes = ['/profil', '/etut-randevu', '/ders-videolari']

export async function proxy(request: Request) {
  let response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const raw = request.headers.get('cookie') ?? ''
          const hit = raw
            .split(';')
            .map((c) => c.trim())
            .find((c) => c.startsWith(name + '='))
          return hit ? decodeURIComponent(hit.split('=').slice(1).join('=')) : undefined
        },
        set(name: string, value: string, options) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = new URL(request.url)

  if (protectedRoutes.includes(pathname) && !user) {
    const url = new URL(request.url)
    url.pathname = '/login'
    url.searchParams.set('message', 'Bu sayfayı görmek için giriş yapmalısınız.')
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}