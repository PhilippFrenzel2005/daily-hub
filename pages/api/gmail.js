import { getServerSession } from "next-auth"
import { authOptions } from "../../lib/authOptions"
import { google } from "googleapis"

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: "Nicht eingeloggt" })

  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: session.accessToken })
  const gmail = google.gmail({ version: "v1", auth })

  try {
    const list = await gmail.users.messages.list({
      userId: "me",
      labelIds: ["INBOX"],
      maxResults: 10,
    })

    const messages = await Promise.all(
      (list.data.messages || []).map(async (m) => {
        const msg = await gmail.users.messages.get({
          userId: "me",
          id: m.id,
          format: "metadata",
          metadataHeaders: ["From", "Subject", "Date"],
        })
        const headers = msg.data.payload?.headers || []
        const get = (name) => headers.find((h) => h.name === name)?.value || ""
        return {
          id: m.id,
          from: get("From"),
          subject: get("Subject"),
          date: get("Date"),
          snippet: msg.data.snippet,
          unread: msg.data.labelIds?.includes("UNREAD"),
        }
      })
    )

    res.json({ messages })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
