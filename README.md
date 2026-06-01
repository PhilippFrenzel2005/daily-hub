# Daily Hub

Persönlicher Fitness- & Produktivitäts-Assistent als PWA.

## Features
- Kalorien & Makros tracken (KI-Freitext-Eingabe)
- Workout-Tracker mit Push/Pull/Legs-Plan
- Todos via Google Tasks
- Google Calendar Tagesübersicht
- Gmail-Zusammenfassung
- KI-Tages-Briefing
- PWA — installierbar auf iPhone/Android

## Setup

### 1. Repo klonen & Dependencies installieren
```bash
npm install
```

### 2. Umgebungsvariablen
Kopiere `.env.example` zu `.env.local` und fülle alle Werte aus:

```bash
cp .env.example .env.local
```

Benötigte Werte:
- `ANTHROPIC_API_KEY` — von console.anthropic.com
- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` — von console.cloud.google.com
- `NEXTAUTH_SECRET` — beliebiger zufälliger String (z.B. `openssl rand -base64 32`)
- `NEXTAUTH_URL` — deine Vercel-URL

### 3. Google Cloud Setup
Aktiviere folgende APIs:
- Gmail API
- Google Calendar API
- Google Tasks API

OAuth Redirect URI: `https://DEINE-URL.vercel.app/api/auth/callback/google`

### 4. Vercel Deployment
1. Repo auf GitHub pushen
2. vercel.com → "Import Project" → GitHub Repo auswählen
3. Environment Variables in Vercel eintragen (aus .env.local)
4. Deploy

### 5. iOS PWA installieren
1. App in Safari öffnen
2. Teilen-Button → "Zum Home-Bildschirm"
3. Name: "Daily Hub" → Hinzufügen

## Lokal testen
```bash
npm run dev
```
Öffne http://localhost:3000
