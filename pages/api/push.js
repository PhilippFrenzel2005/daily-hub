const subscriptions = new Map()

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { subscription, userId } = req.body
    subscriptions.set(userId, subscription)
    res.json({ ok: true })
  }

  if (req.method === "DELETE") {
    const { userId } = req.body
    subscriptions.delete(userId)
    res.json({ ok: true })
  }
}

export { subscriptions }
