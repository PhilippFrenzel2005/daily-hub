import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]"
import { google } from "googleapis"

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: "Nicht eingeloggt" })

  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: session.accessToken })
  const tasks = google.tasks({ version: "v1", auth })

  if (req.method === "GET") {
    try {
      const lists = await tasks.tasklists.list()
      const listId = lists.data.items?.[0]?.id || "@default"
      const result = await tasks.tasks.list({
        tasklist: listId,
        showCompleted: false,
        maxResults: 50,
      })
      res.json({ tasks: result.data.items || [], listId })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  }

  if (req.method === "POST") {
    const { title, notes, due, listId } = req.body
    try {
      const task = await tasks.tasks.insert({
        tasklist: listId || "@default",
        requestBody: { title, notes, due },
      })
      res.json({ task: task.data })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  }

  if (req.method === "PATCH") {
    const { taskId, listId, completed } = req.body
    try {
      await tasks.tasks.patch({
        tasklist: listId || "@default",
        task: taskId,
        requestBody: { status: completed ? "completed" : "needsAction" },
      })
      res.json({ ok: true })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  }
}
