import { Html, Head, Main, NextScript } from "next/document"

export default function Document() {
  return (
    <Html lang="de">
      <Head>
        <meta name="application-name" content="Daily Hub" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Daily Hub" />
        <meta name="theme-color" content="#F2EEE6" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
