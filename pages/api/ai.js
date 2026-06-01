import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end()

  const { type, data } = req.body

  try {
    if (type === "food") {
      const msg = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 256,
        messages: [{
          role: "user",
          content: `Analysiere diese Mahlzeit für Muskelaufbau und gib NUR ein JSON-Objekt zurück (kein Markdown):
{"name":"kurzer Name","kcal":zahl,"protein":zahl,"carbs":zahl,"fat":zahl}
Mahlzeit: "${data.text}"
Schätze realistische Werte. Alle Zahlen als Integer.`
        }]
      })
      const text = msg.content[0].text.replace(/```json|```/g, "").trim()
      res.json(JSON.parse(text))

    } else if (type === "briefing") {
      const { tasks, events } = data
      const open = (tasks || []).filter(t => !t.done && !t.completed)
      const eventList = (events || []).map(e => e.title).join(", ") || "keine"
      const todoList  = open.slice(0, 5).map(t => t.text || t.title).join(", ") || "keine"

      const msg = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 180,
        messages: [{
          role: "user",
          content: `Tages-Briefing auf Deutsch. Maximal 2 kurze Sätze. Professionell, prägnant, kein Smalltalk.
Nenne was heute ansteht (Termine und Aufgaben), nicht Fitness oder Ernährung.

Offene Aufgaben: ${todoList}
Heutige Termine: ${eventList}

Antworte direkt mit dem Briefing-Text, ohne Einleitung.`
        }]
      })
      res.json({ text: msg.content[0].text })

    } else if (type === "gym") {
      const { exercises, day } = data
      const msg = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        messages: [{
          role: "user",
          content: `Push/Pull/Legs Split, Muskelaufbau. Heute: ${day}-Tag. 
Bisherige Übungen: ${exercises.length ? exercises.map(e => `${e.name} ${e.detail}`).join(", ") : "keine"}.
Gib einen konkreten Tipp in 2 Sätzen auf Deutsch.`
        }]
      })
      res.json({ text: msg.content[0].text })

    } else if (type === "news-summary") {
      const { items } = data
      const headlines = items.slice(0, 12).map(i => i.title).join(" · ")
      const msg = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 180,
        messages: [{
          role: "user",
          content: `Fasse diese Nachrichten-Schlagzeilen in 2 prägnanten Sätzen auf Deutsch zusammen. Was sind die wichtigsten Themen gerade? Journalistisch, neutral, direkt.

Schlagzeilen: ${headlines}`
        }]
      })
      res.json({ text: msg.content[0].text })

    } else if (type === "mail-summary") {
      const { messages } = data
      const msg = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [{
          role: "user",
          content: `Meine E-Mails: ${messages.map(m => `"${m.subject}" von ${m.from}`).join("; ")}.
Was ist dringend? Was kann warten? 3 Sätze auf Deutsch, direkt.`
        }]
      })
      res.json({ text: msg.content[0].text })
    }

  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
