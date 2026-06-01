import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]"
import { google } from "googleapis"

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: "Nicht eingeloggt" })

  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: session.accessToken })
  const calendar = google.calendar({ version: "v3", auth })

  try {
    const now = new Date()
    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59)

    const result = await calendar.events.list({
      calendarId: "primary",
      timeMin: now.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 10,
    })

    const events = (result.data.items || []).map((e) => ({
      id: e.id,
      title: e.summary,
      start: e.start?.dateTime || e.start?.date,
      end: e.end?.dateTime || e.end?.date,
      location: e.location,
      description: e.description,
    }))

    res.json({ events })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
