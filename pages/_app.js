import { SessionProvider } from "next-auth/react"
import { useEffect } from "react"
import "../styles/globals.css"

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js")
    }
  }, [])

  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}
