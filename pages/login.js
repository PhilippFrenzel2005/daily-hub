import { signIn } from "next-auth/react"

export default function Login() {
  return (
    <div style={{
      minHeight: "100vh", background: "#0e0e0f", display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif", padding: "24px"
    }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>◈</div>
        <h1 style={{ color: "#f0eff4", fontSize: "28px", fontWeight: 300, margin: 0 }}>Daily Hub</h1>
        <p style={{ color: "#5a5968", fontSize: "14px", marginTop: "8px" }}>
          Fitness · Ernährung · Produktivität
        </p>
      </div>
      <button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        style={{
          background: "#1e1e21", border: "1px solid #3a3a40", borderRadius: "12px",
          padding: "14px 24px", color: "#f0eff4", fontSize: "15px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: "12px", fontFamily: "'DM Sans', sans-serif"
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Mit Google einloggen
      </button>
      <p style={{ color: "#3a3a40", fontSize: "12px", marginTop: "24px", textAlign: "center" }}>
        Zugriff auf Gmail, Calendar & Tasks
      </p>
    </div>
  )
}
