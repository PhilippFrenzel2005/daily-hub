import { signIn } from "next-auth/react"

export default function Login() {
  return (
    <div style={{
      minHeight:"100vh", background:"#F2EEE6", display:"flex",
      flexDirection:"column", alignItems:"center", justifyContent:"center",
      fontFamily:"'Hanken Grotesk', system-ui, sans-serif", padding:"24px",
    }}>
      <div style={{textAlign:"center",marginBottom:40}}>
        <div style={{
          width:64,height:64,borderRadius:18,background:"#557A53",
          display:"flex",alignItems:"center",justifyContent:"center",
          margin:"0 auto 20px",
          boxShadow:"0 8px 24px rgba(85,122,83,0.3)",
        }}>
          <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/>
          </svg>
        </div>
        <h1 style={{color:"#211D17",fontSize:28,fontWeight:800,margin:0}}>Daily Hub</h1>
        <p style={{color:"#8B8275",fontSize:14,marginTop:8}}>Fitness · Ernährung · Produktivität</p>
      </div>

      <button
        onClick={()=>signIn("google",{callbackUrl:"/"})}
        style={{
          background:"#FFFFFF",border:"1px solid rgba(33,29,23,0.12)",borderRadius:16,
          padding:"14px 24px",color:"#211D17",fontSize:15,fontWeight:600,cursor:"pointer",
          display:"flex",alignItems:"center",gap:12,
          boxShadow:"0 1px 2px rgba(33,29,23,0.04), 0 10px 26px rgba(33,29,23,0.05)",
          fontFamily:"'Hanken Grotesk', system-ui, sans-serif",
        }}
      >
        <svg width={20} height={20} viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Mit Google einloggen
      </button>

      <p style={{color:"#B6AEA0",fontSize:12,marginTop:24,textAlign:"center"}}>
        Zugriff auf Gmail, Calendar & Tasks
      </p>
    </div>
  )
}
