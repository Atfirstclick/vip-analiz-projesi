// app/login/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;

  const signIn = async (formData: FormData) => {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return redirect("/login?message=login-hatali");
    return redirect("/");
  };

  const signUp = async (formData: FormData) => {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error(">>> SUPABASE SIGNUP ERROR:", error.message);
      return redirect("/login?message=kayit-hatali");
    }
    return redirect("/login?message=kayit-basarili");
  };

  return (
    <div>
      <h1>Giriş Yap veya Kayıt Ol</h1>

      {params?.message === "kayit-basarili" && (
        <p style={{ color: "green" }}>Kayıt başarılı! Şimdi giriş yapabilirsiniz.</p>
      )}
      {params?.message === "kayit-hatali" && (
        <p style={{ color: "red" }}>Kayıt başarısız oldu. Terminali kontrol edin.</p>
      )}
      {params?.message === "login-hatali" && (
        <p style={{ color: "red" }}>Giriş bilgileri hatalı.</p>
      )}

      <form>
        <label htmlFor="email">Email:</label>
        <input id="email" name="email" type="email" required />

        <label htmlFor="password">Şifre:</label>
        <input id="password" name="password" type="password" required />

        <button formAction={signIn}>Giriş Yap</button>
        <button formAction={signUp}>Kayıt Ol</button>
      </form>
    </div>
  );
}
