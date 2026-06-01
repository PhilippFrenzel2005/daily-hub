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
      const { meals, exercises, tasks, events, water } = data
      const kcal = meals.reduce((s, m) => s + (m.kcal || 0), 0)
      const prot = meals.reduce((s, m) => s + (m.protein || 0), 0)

      const msg = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        messages: [{
          role: "user",
          content: `Du bist ein persönlicher Assistent. Erstelle ein kurzes Morgen-Briefing auf Deutsch (max 4 Sätze, direkt und motivierend).

Heute:
- Kalorien: ${kcal} von 3200 kcal
- Protein: ${Math.round(prot)}g von 200g  
- Wasser: ${water.toFixed(1)}L von 3.5L
- Workout: ${exercises.length ? exercises.map(e => e.name).join(", ") : "noch keins"}
- Offene Todos: ${tasks.filter(t => !t.completed).length}
- Termine heute: ${events.length ? events.map(e => e.title).join(", ") : "keine"}

Kein Smalltalk, direkt zum Punkt.`
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
