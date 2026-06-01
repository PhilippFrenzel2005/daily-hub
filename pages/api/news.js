export default async function handler(req, res) {
  try {
    const r = await fetch("https://www.tagesschau.de/xml/rss2/", {
      headers: { "User-Agent": "Mozilla/5.0" },
    })
    const xml = await r.text()

    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
      .map((m) => {
        const block = m[1]
        const get = (tag) => {
          const match = block.match(
            new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`)
          )
          return match ? match[1].trim() : ""
        }
        return {
          title: get("title"),
          description: get("description").replace(/<[^>]*>/g, "").slice(0, 220),
          date: get("pubDate"),
          link: get("link") || get("guid"),
        }
      })
      .filter((i) => i.title)
      .slice(0, 15)

    res.setHeader("Cache-Control", "s-maxage=300")
    res.json({ items })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
