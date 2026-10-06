import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResetPasswordForm from "./ResetForm";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <>
      <Header />
      <main style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 1rem", background: "#0D0C0A" }}>
        <div style={{ width: "100%", maxWidth: 460, background: "#14110d", border: "1px solid #2a2520", borderRadius: 16, padding: "2.5rem" }}>
          <h1 style={{ color: "#F5E6D3", textAlign: "center", marginTop: 0 }}>Новый пароль</h1>
          <ResetPasswordForm token={token || ""} />
        </div>
      </main>
      <Footer />
    </>
  );
}
