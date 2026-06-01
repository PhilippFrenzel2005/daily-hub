const FEEDS = [
  { url: "https://www.tagesschau.de/xml/rss2/", source: "Tagesschau" },
  { url: "https://www.spiegel.de/schlagzeilen/index.rss", source: "Spiegel" },
  { url: "https://www.derstandard.at/rss", source: "Standard" },
  { url: "https://www.heise.de/rss/heise-atom.xml", source: "Heise" },
]

function decode(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, "")
    .trim()
}

function parseItems(xml, source) {
  const isAtom = xml.includes("<feed")
  const itemRe = isAtom ? /<entry>([\s\S]*?)<\/entry>/g : /<item>([\s\S]*?)<\/item>/g

  return [...xml.matchAll(itemRe)].map((m) => {
    const block = m[1]
    const get = (tag) => {
      const m = block.match(
        new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`)
      )
      return m ? decode(m[1].replace(/<[^>]*>/g, "")) : ""
    }
    const getAttr = (tag, attr) => {
      const m = block.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"[^>]*/?>`))
      return m ? m[1] : ""
    }
    return {
      title: get("title"),
      description: get(isAtom ? "summary" : "description").slice(0, 220),
      date: get(isAtom ? "updated" : "pubDate"),
      link: isAtom ? getAttr("link", "href") : (get("link") || get("guid")),
      source,
    }
  }).filter((i) => i.title)
}

export default async function handler(req, res) {
  try {
    const results = await Promise.allSettled(
      FEEDS.map(({ url, source }) =>
        fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } })
          .then((r) => r.text())
          .then((xml) => parseItems(xml, source))
      )
    )

    const items = results
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => r.value)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 25)

    res.setHeader("Cache-Control", "s-maxage=300")
    res.json({ items })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
