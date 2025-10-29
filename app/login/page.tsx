// app/login/page.tsx

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  const signIn = async (formData: FormData) => {
    "use server"; // Bu fonksiyonun sunucuda çalışacağını belirtir (Server Action)

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return redirect("/login?message=Giriş bilgileri hatalı. Lütfen tekrar deneyin.");
    }

    return redirect("/"); // Giriş başarılıysa anasayfaya yönlendir
  };

  const signUp = async (formData: FormData) => {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return redirect("/login?message=Kullanıcı oluşturulamadı. Bu e-posta zaten kullanımda olabilir.");
    }

    // Supabase ayarlarında "Confirm Email" kapalı olduğu için
    // kullanıcı doğrudan giriş yapabilir. Başarılı kayıt sonrası giriş sayfasına
    // bir mesajla yönlendirelim.
    return redirect("/login?message=Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
  };

  return (
    <div>
      <h1>Giriş Yap veya Kayıt Ol</h1>
      
      <form>
        <label htmlFor="email">Email:</label>
          
        <input id="email" name="email" type="email" required />
   
        <label htmlFor="password">Şifre:</label>
          
        <input id="password" name="password" type="password" required />
          
  
        <button formAction={signIn}>Giriş Yap</button>
          

        <button formAction={signUp}>Kayıt Ol</button>

        {searchParams?.message && (
          <p style={{ color: 'blue', marginTop: '16px' }}>
            {searchParams.message}
          </p>
        )}
      </form>
    </div>
  );
}
