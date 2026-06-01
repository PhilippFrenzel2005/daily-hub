import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/router"
import { useState, useEffect, useCallback } from "react"
import Head from "next/head"

const KCAL_GOAL = 3200, PROT_GOAL = 200, CARB_GOAL = 400, FAT_GOAL = 90, WATER_GOAL = 3.5

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState("home")
  const [meals, setMeals] = useState([])
  const [exercises, setExercises] = useState([])
  const [water, setWater] = useState(0)
  const [todos, setTodos] = useState([])
  const [tasksListId, setTasksListId] = useState("@default")
  const [events, setEvents] = useState([])
  const [emails, setEmails] = useState([])
  const [gymPlan] = useState(["Push","Pull","Rest","Beine","Push","Pull","Rest"])
  const [gymDone, setGymDone] = useState([false,false,false,false,false,false,false])
  const [briefing, setBriefing] = useState("")
  const [foodInput, setFoodInput] = useState("")
  const [gymEx, setGymEx] = useState("")
  const [gymDetail, setGymDetail] = useState("")
  const [todoInput, setTodoInput] = useState("")
  const [todoPrio, setTodoPrio] = useState("med")
  const [aiLoading, setAiLoading] = useState({})
  const [mailSummary, setMailSummary] = useState("")
  const [gymTip, setGymTip] = useState("")
  const [unreadCount, setUnreadCount] = useState(0)
  const [news, setNews] = useState([])
  const [newsLoading, setNewsLoading] = useState(false)
  const TODAY = new Date().toDateString()

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  // Load persisted data
  useEffect(() => {
    if (status !== "authenticated") return
    try {
      const saved = JSON.parse(localStorage.getItem("hub-data") || "{}")
      if (saved.date === TODAY) {
        setMeals(saved.meals || [])
        setExercises(saved.exercises || [])
        setWater(saved.water || 0)
        setGymDone(saved.gymDone || [false,false,false,false,false,false,false])
      }
    } catch(e) {}
    fetchTasks()
    fetchCalendar()
  }, [status])

  // Persist data
  useEffect(() => {
    if (status !== "authenticated") return
    localStorage.setItem("hub-data", JSON.stringify({ date: TODAY, meals, exercises, water, gymDone }))
  }, [meals, exercises, water, gymDone, status])

  const fetchTasks = async () => {
    try {
      const r = await fetch("/api/tasks")
      const d = await r.json()
      setTodos((d.tasks || []).map(t => ({ id: t.id, text: t.title, done: t.status === "completed", prio: "med", fromGoogle: true })))
      setTasksListId(d.listId || "@default")
    } catch(e) {}
  }

  const fetchCalendar = async () => {
    try {
      const r = await fetch("/api/calendar")
      const d = await r.json()
      setEvents(d.events || [])
    } catch(e) {}
  }

  const fetchMail = async () => {
    setAiLoading(l => ({...l, mail: true}))
    try {
      const r = await fetch("/api/gmail")
      const d = await r.json()
      setEmails(d.messages || [])
      setUnreadCount((d.messages || []).filter(m => m.unread).length)
      if (d.messages?.length) {
        const ai = await fetch("/api/ai", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ type: "mail-summary", data: { messages: d.messages }})})
        const ad = await ai.json()
        setMailSummary(ad.text || "")
      }
    } catch(e) {}
    setAiLoading(l => ({...l, mail: false}))
  }

  const fetchNews = async () => {
    setNewsLoading(true)
    try {
      const r = await fetch("/api/news")
      const d = await r.json()
      setNews(d.items || [])
    } catch(e) {}
    setNewsLoading(false)
  }

  const logFood = async () => {
    if (!foodInput.trim()) return
    setAiLoading(l => ({...l, food: true}))
    try {
      const r = await fetch("/api/ai", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ type: "food", data: { text: foodInput }})})
      const d = await r.json()
      const now = new Date()
      setMeals(m => [...m, { ...d, time: `${now.getHours()}:${String(now.getMinutes()).padStart(2,"0")}`, id: Date.now() }])
      setFoodInput("")
    } catch(e) {}
    setAiLoading(l => ({...l, food: false}))
  }

  const addExercise = () => {
    if (!gymEx.trim()) return
    setExercises(e => [...e, { name: gymEx, detail: gymDetail || "—", id: Date.now() }])
    setGymEx(""); setGymDetail("")
  }

  const addTodo = async () => {
    if (!todoInput.trim()) return
    const todo = { id: Date.now(), text: todoInput, done: false, prio: todoPrio }
    setTodos(t => [todo, ...t])
    setTodoInput("")
    try {
      await fetch("/api/tasks", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ title: todoInput, listId: tasksListId })})
    } catch(e) {}
  }

  const toggleTodo = async (todo) => {
    setTodos(t => t.map(x => x.id === todo.id ? {...x, done: !x.done} : x))
    if (todo.fromGoogle) {
      try {
        await fetch("/api/tasks", { method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ taskId: todo.id, listId: tasksListId, completed: !todo.done })})
      } catch(e) {}
    }
  }

  const loadBriefing = async () => {
    setAiLoading(l => ({...l, briefing: true}))
    try {
      const r = await fetch("/api/ai", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ type: "briefing", data: { meals, exercises, tasks: todos, events, water }})})
      const d = await r.json()
      setBriefing(d.text || "")
    } catch(e) {}
    setAiLoading(l => ({...l, briefing: false}))
  }

  const loadGymTip = async () => {
    setAiLoading(l => ({...l, gym: true}))
    const today = (new Date().getDay() + 6) % 7
    try {
      const r = await fetch("/api/ai", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ type: "gym", data: { exercises, day: gymPlan[today] }})})
      const d = await r.json()
      setGymTip(d.text || "")
    } catch(e) {}
    setAiLoading(l => ({...l, gym: false}))
  }

  const totals = () => ({
    kcal: meals.reduce((s,m) => s+(m.kcal||0),0),
    prot: meals.reduce((s,m) => s+(m.protein||0),0),
    carb: meals.reduce((s,m) => s+(m.carbs||0),0),
    fat:  meals.reduce((s,m) => s+(m.fat||0),0),
  })

  const QUICK_FOODS = [
    { name: "Protein Shake", kcal: 130, protein: 25, carbs: 5, fat: 2 },
    { name: "Haferflocken 80g", kcal: 295, protein: 10, carbs: 52, fat: 5 },
    { name: "Hühnerbrust 150g", kcal: 165, protein: 31, carbs: 0, fat: 4 },
    { name: "2 Eier", kcal: 144, protein: 12, carbs: 1, fat: 10 },
    { name: "Banane", kcal: 89, protein: 1, carbs: 23, fat: 0 },
    { name: "Vollkornbrot", kcal: 200, protein: 8, carbs: 36, fat: 2 },
    { name: "Magerquark 250g", kcal: 130, protein: 27, carbs: 5, fat: 1 },
    { name: "Reis 100g", kcal: 350, protein: 7, carbs: 77, fat: 1 },
  ]

  const t = totals()
  const today = (new Date().getDay()+6)%7
  const openTodos = todos.filter(x=>!x.done)

  const greeting = () => {
    const h = new Date().getHours()
    const name = session?.user?.name?.split(" ")[0] || ""
    if (h<12) return `Guten Morgen${name ? ", "+name : ""}`
    if (h<18) return `Guten Tag${name ? ", "+name : ""}`
    return `Guten Abend${name ? ", "+name : ""}`
  }

  const fmtTime = (iso) => {
    if (!iso) return ""
    const d = new Date(iso)
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2,"0")}`
  }

  const fmtMailDate = (str) => {
    if (!str) return ""
    const d = new Date(str)
    const diff = Date.now() - d
    if (diff < 86400000) return `${d.getHours()}:${String(d.getMinutes()).padStart(2,"0")}`
    return `${d.getDate()}.${d.getMonth()+1}.`
  }

  if (status === "loading") return (
    <div style={{minHeight:"100vh",background:"#0e0e0f",display:"flex",alignItems:"center",justifyContent:"center",color:"#5a5968"}}>
      Laden...
    </div>
  )
  if (!session) return null

  const s = {
    page: { maxWidth: 480, margin: "0 auto", paddingBottom: 40 },
    nav: { display:"flex", gap:2, padding:"12px 16px 0", borderBottom:"1px solid #2e2e33", background:"#161618", position:"sticky", top:0, zIndex:100, overflowX:"auto" },
    navBtn: (active) => ({ background: active?"#1e1e21":"none", border:"none", color: active?"#f0eff4":"#5a5968", fontSize:13, fontWeight:500, padding:"8px 12px", borderRadius:"10px 10px 0 0", cursor:"pointer", borderBottom: active?"2px solid #2dce7a":"2px solid transparent", marginBottom:-1, whiteSpace:"nowrap" }),
    section: { padding:"20px 16px 0" },
    sHead: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 },
    sTitle: { fontSize:11, fontWeight:500, color:"#5a5968", textTransform:"uppercase", letterSpacing:".08em" },
    card: { background:"#161618", border:"1px solid #2e2e33", borderRadius:16, padding:"16px", marginBottom:12 },
    cardSm: { background:"#1e1e21", border:"1px solid #2e2e33", borderRadius:10, padding:"12px 14px", marginBottom:8 },
    stat: { background:"#1e1e21", border:"1px solid #2e2e33", borderRadius:16, padding:"14px 16px", flex:1 },
    statLabel: { fontSize:11, color:"#5a5968", marginBottom:4 },
    statVal: { fontSize:26, fontWeight:300, color:"#f0eff4", fontFamily:"'DM Mono',monospace" },
    prog: (pct, color) => ({ height:4, background:"#28282c", borderRadius:2, marginTop:8, overflow:"hidden", position:"relative" }),
    progFill: (pct, color) => ({ height:"100%", borderRadius:2, width:`${Math.min(100,pct)}%`, background:color, transition:"width .4s" }),
    btn: (variant) => {
      const v = { green:{bg:"#1a4a32",border:"#2dce7a",color:"#6effa8"}, blue:{bg:"#1a2e4a",border:"#4d9fff",color:"#93c8ff"}, purple:{bg:"#2a1f4a",border:"#a78bfa",color:"#c4b5fd"}, default:{bg:"#1e1e21",border:"#3a3a40",color:"#a09fb0"} }
      const c = v[variant]||v.default
      return { background:c.bg, border:`1px solid ${c.border}`, borderRadius:10, padding:"9px 14px", color:c.color, fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"opacity .15s" }
    },
    input: { background:"#1e1e21", border:"1px solid #2e2e33", borderRadius:10, padding:"9px 12px", color:"#f0eff4", fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", width:"100%" },
    insight: { background:"#2a1f4a", border:"1px solid #a78bfa", borderRadius:16, padding:"14px 16px", marginBottom:14 },
    insightLabel: { fontSize:11, color:"#c4b5fd", fontWeight:500, marginBottom:6 },
    insightText: { fontSize:13, color:"#a09fb0", lineHeight:1.6 },
    macroRow: { display:"flex", alignItems:"center", gap:10, marginBottom:10 },
    tag: (color) => {
      const c = {green:{bg:"#1a4a32",color:"#6effa8"},amber:{bg:"#3a2a0e",color:"#ffd080"},blue:{bg:"#1a2e4a",color:"#93c8ff"},red:{bg:"#3a1a1a",color:"#ff9090"}}[color]||{bg:"#1e1e21",color:"#a09fb0"}
      return { display:"inline-flex", alignItems:"center", gap:4, fontSize:11, padding:"3px 8px", borderRadius:99, fontWeight:500, background:c.bg, color:c.color }
    },
    row: { display:"flex", gap:8, marginTop:10 },
    hr: { border:"none", borderTop:"1px solid #2e2e33", margin:"14px 0" },
  }

  return (
    <>
      <Head>
        <title>Daily Hub</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      <div style={s.page}>
        {/* NAV */}
        <nav style={s.nav}>
          {[["home","◈ Home"],["todos",`☐ Todos${openTodos.length>0?" ("+openTodos.length+")":""}`],["food","◉ Essen"],["gym","⊕ Gym"],["mail",`✉ Mail${unreadCount>0?" ("+unreadCount+")":""}`],["news","◎ News"]].map(([id,label])=>(
            <button key={id} style={s.navBtn(tab===id)} onClick={()=>{ setTab(id); if(id==="mail"&&!emails.length) fetchMail(); if(id==="news"&&!news.length) fetchNews() }}>{label}</button>
          ))}
          <button style={{...s.navBtn(false), marginLeft:"auto"}} onClick={()=>signOut({callbackUrl:"/login"})}>↪</button>
        </nav>

        {/* HOME */}
        {tab==="home" && (
          <div style={s.section}>
            <div style={{fontSize:22,fontWeight:300,color:"#f0eff4",marginBottom:4}}>{greeting()}</div>
            <div style={{fontSize:13,color:"#5a5968",marginBottom:20}}>
              {new Date().toLocaleDateString("de-AT",{weekday:"long",day:"numeric",month:"long"})}
            </div>

            {briefing && (
              <div style={s.insight}>
                <div style={s.insightLabel}>✦ Tages-Briefing</div>
                <div style={s.insightText}>{briefing}</div>
              </div>
            )}

            {events.length>0 && (
              <div style={{...s.card, marginBottom:16}}>
                <div style={{...s.sTitle, marginBottom:10}}>Heute</div>
                {events.map(e=>(
                  <div key={e.id} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"6px 0",borderBottom:"1px solid #2e2e33"}}>
                    <span style={{fontSize:12,fontFamily:"'DM Mono',monospace",color:"#4d9fff",minWidth:40}}>{fmtTime(e.start)}</span>
                    <span style={{fontSize:13,color:"#f0eff4"}}>{e.title}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{display:"flex",gap:10,marginBottom:12}}>
              <div style={s.stat}>
                <div style={s.statLabel}>🔥 Kalorien</div>
                <div style={s.statVal}>{t.kcal}</div>
                <div style={{fontSize:11,color:"#5a5968",marginTop:2}}>/ {KCAL_GOAL} kcal</div>
                <div style={s.prog()}><div style={s.progFill(t.kcal/KCAL_GOAL*100,"#2dce7a")}></div></div>
              </div>
              <div style={s.stat}>
                <div style={s.statLabel}>💧 Wasser</div>
                <div style={s.statVal}>{water.toFixed(1)}<span style={{fontSize:14}}>L</span></div>
                <div style={{fontSize:11,color:"#5a5968",marginTop:2}}>/ {WATER_GOAL} L</div>
                <div style={s.prog()}><div style={s.progFill(water/WATER_GOAL*100,"#4d9fff")}></div></div>
              </div>
            </div>

            <div style={s.card}>
              {[["Protein",t.prot,PROT_GOAL,"#2dce7a"],["Carbs",t.carb,CARB_GOAL,"#f5a623"],["Fett",t.fat,FAT_GOAL,"#a78bfa"]].map(([name,val,goal,color])=>(
                <div key={name} style={s.macroRow}>
                  <span style={{fontSize:12,color:"#a09fb0",width:52,flexShrink:0}}>{name}</span>
                  <div style={{flex:1,height:6,background:"#28282c",borderRadius:3,overflow:"hidden"}}>
                    <div style={{height:"100%",borderRadius:3,width:`${Math.min(100,Math.round(val/goal*100))}%`,background:color,transition:"width .4s"}}></div>
                  </div>
                  <span style={{fontSize:12,color:"#a09fb0",fontFamily:"'DM Mono',monospace",minWidth:72,textAlign:"right"}}>{Math.round(val)} / {goal}g</span>
                </div>
              ))}
            </div>

            {openTodos.length>0 && (
              <>
                <div style={s.sHead}><span style={s.sTitle}>Offene Todos</span><button style={s.btn()} onClick={()=>setTab("todos")}>Alle →</button></div>
                {openTodos.slice(0,3).map(todo=>(
                  <div key={todo.id} style={s.cardSm}>
                    <span style={{fontSize:13,color:"#a09fb0"}}>{todo.text}</span>
                  </div>
                ))}
              </>
            )}

            <div style={{display:"flex",gap:8,marginTop:16}}>
              <button style={{...s.btn("purple"),flex:1}} onClick={loadBriefing}>
                {aiLoading.briefing ? "⏳ Lädt..." : "✦ KI-Briefing"}
              </button>
            </div>

            {/* Week strip */}
            <div style={{...s.sHead,marginTop:20}}><span style={s.sTitle}>Woche</span></div>
            <div style={s.card}>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                {["Mo","Di","Mi","Do","Fr","Sa","So"].map((d,i)=>{
                  const isDone = gymDone[i], isToday = i===today
                  const dotStyle = {
                    width:30,height:30,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:500,cursor:"pointer",
                    background: isDone?"#1a4a32":isToday?"#1e1e21":"#1e1e21",
                    color: isDone?"#6effa8":isToday?"#f0eff4":"#5a5968",
                    border: isDone?"1px solid #2dce7a":isToday?"1.5px solid #2dce7a":"1px solid #2e2e33"
                  }
                  return (
                    <div key={d} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                      <span style={{fontSize:10,color:"#5a5968"}}>{d}</span>
                      <div style={dotStyle} onClick={()=>setGymDone(gd=>{const n=[...gd];n[i]=!n[i];return n})}>{gymPlan[i].slice(0,2)}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* TODOS */}
        {tab==="todos" && (
          <div style={s.section}>
            <div style={s.sHead}>
              <span style={s.sTitle}>Aufgaben</span>
              <button style={s.btn()} onClick={()=>setTodos(t=>t.filter(x=>!x.done))}>Erledigt löschen</button>
            </div>
            <div style={s.row}>
              <input style={{...s.input,flex:1}} value={todoInput} onChange={e=>setTodoInput(e.target.value)} placeholder="Neue Aufgabe..." onKeyDown={e=>e.key==="Enter"&&addTodo()} />
              <select value={todoPrio} onChange={e=>setTodoPrio(e.target.value)} style={{...s.input,width:90,flex:"none"}}>
                <option value="low">Niedrig</option>
                <option value="med">Mittel</option>
                <option value="high">Hoch</option>
              </select>
              <button style={s.btn("green")} onClick={addTodo}>+</button>
            </div>
            <div style={s.hr}></div>
            {todos.length===0 && <div style={{textAlign:"center",padding:"24px 0",color:"#5a5968",fontSize:13}}>Keine Aufgaben.</div>}
            {todos.map(todo=>(
              <div key={todo.id} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 0",borderBottom:"1px solid #2e2e33"}}>
                <div onClick={()=>toggleTodo(todo)} style={{width:18,height:18,border:`1.5px solid ${todo.done?"#2dce7a":"#3a3a40"}`,borderRadius:5,flexShrink:0,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",marginTop:1,background:todo.done?"#2dce7a":"transparent"}}>
                  {todo.done && <span style={{fontSize:11,color:"#000",fontWeight:700}}>✓</span>}
                </div>
                <span style={{flex:1,fontSize:14,color:todo.done?"#5a5968":"#f0eff4",textDecoration:todo.done?"line-through":"none",lineHeight:1.4}}>{todo.text}</span>
                <span style={s.tag(todo.prio==="high"?"red":todo.prio==="med"?"amber":"green")}>{todo.prio==="high"?"Hoch":todo.prio==="med"?"Mittel":"Niedrig"}</span>
              </div>
            ))}
          </div>
        )}

        {/* FOOD */}
        {tab==="food" && (
          <div style={s.section}>
            <div style={{display:"flex",gap:10,marginBottom:12}}>
              <div style={s.stat}>
                <div style={s.statLabel}>🔥 Kcal</div>
                <div style={s.statVal}>{t.kcal}</div>
                <div style={{fontSize:11,color:"#5a5968",marginTop:2}}>/ {KCAL_GOAL} kcal</div>
                <div style={s.prog()}><div style={s.progFill(t.kcal/KCAL_GOAL*100,"#2dce7a")}></div></div>
              </div>
              <div style={s.stat}>
                <div style={s.statLabel}>💧 Wasser</div>
                <div style={s.statVal}>{water.toFixed(1)}<span style={{fontSize:14}}>L</span></div>
                <div style={{fontSize:11,color:"#5a5968",marginTop:2}}>/ {WATER_GOAL} L</div>
                <div style={s.prog()}><div style={s.progFill(water/WATER_GOAL*100,"#4d9fff")}></div></div>
              </div>
            </div>

            <div style={{display:"flex",gap:6,marginBottom:14}}>
              {[0.25,0.33,0.5,1].map(l=>(
                <button key={l} style={{...s.btn(),flex:1,fontSize:12}} onClick={()=>setWater(w=>Math.round((w+l)*100)/100)}>+{l}L</button>
              ))}
            </div>

            <div style={s.sHead}><span style={s.sTitle}>Schnell hinzufügen</span></div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
              {QUICK_FOODS.map(f=>(
                <button key={f.name} style={{...s.btn(),fontSize:11,padding:"6px 10px"}} onClick={()=>{
                  const now = new Date()
                  setMeals(m=>[...m,{...f,time:`${now.getHours()}:${String(now.getMinutes()).padStart(2,"0")}`,id:Date.now()}])
                }}>{f.name}</button>
              ))}
            </div>

            <div style={s.sHead}><span style={s.sTitle}>Mahlzeiten</span></div>
            <div style={s.row}>
              <input style={{...s.input,flex:1}} value={foodInput} onChange={e=>setFoodInput(e.target.value)} placeholder="z.B. 3 Eier, Haferflocken 80g..." onKeyDown={e=>e.key==="Enter"&&logFood()} />
              <button style={s.btn("purple")} onClick={logFood}>{aiLoading.food?"⏳":"✦ Log"}</button>
            </div>
            <div style={s.hr}></div>
            {meals.length===0 && <div style={{textAlign:"center",padding:"24px 0",color:"#5a5968",fontSize:13}}>Noch keine Mahlzeiten.</div>}
            {meals.map((m,i)=>(
              <div key={m.id||i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #2e2e33"}}>
                <div>
                  <div style={{fontSize:14,color:"#f0eff4"}}>{m.name}</div>
                  <div style={{fontSize:11,color:"#5a5968",marginTop:2}}>{m.time} · P:{Math.round(m.protein||0)}g C:{Math.round(m.carbs||0)}g F:{Math.round(m.fat||0)}g</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:13,fontFamily:"'DM Mono',monospace",color:"#ffd080"}}>{m.kcal} kcal</span>
                  <button style={{background:"none",border:"none",color:"#5a5968",fontSize:16}} onClick={()=>setMeals(m=>m.filter((_,j)=>j!==i))}>×</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* GYM */}
        {tab==="gym" && (
          <div style={s.section}>
            <div style={s.sHead}>
              <span style={s.sTitle}>Workout heute</span>
              <span style={s.tag("green")}>{gymPlan[today]}</span>
            </div>
            <div style={s.row}>
              <input style={{...s.input,flex:2}} value={gymEx} onChange={e=>setGymEx(e.target.value)} placeholder="Übung..." onKeyDown={e=>e.key==="Enter"&&addExercise()} />
              <input style={{...s.input,flex:1.5}} value={gymDetail} onChange={e=>setGymDetail(e.target.value)} placeholder="3×10×80kg" onKeyDown={e=>e.key==="Enter"&&addExercise()} />
              <button style={s.btn("green")} onClick={addExercise}>+</button>
            </div>
            <div style={{...s.card,marginTop:8}}>
              {exercises.length===0 && <div style={{textAlign:"center",padding:"16px 0",color:"#5a5968",fontSize:13}}>Noch kein Workout.</div>}
              {exercises.map((e,i)=>(
                <div key={e.id||i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid #2e2e33"}}>
                  <span style={{fontSize:14,color:"#f0eff4"}}>{e.name}</span>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:12,fontFamily:"'DM Mono',monospace",color:"#c4b5fd"}}>{e.detail}</span>
                    <button style={{background:"none",border:"none",color:"#5a5968",fontSize:15}} onClick={()=>setExercises(ex=>ex.filter((_,j)=>j!==i))}>×</button>
                  </div>
                </div>
              ))}
            </div>
            <button style={{...s.btn("purple"),width:"100%",marginTop:8}} onClick={loadGymTip}>{aiLoading.gym?"⏳ Lädt...":"✦ KI-Tipp"}</button>
            {gymTip && <div style={{...s.insight,marginTop:10}}><div style={s.insightLabel}>✦ Gym-Tipp</div><div style={s.insightText}>{gymTip}</div></div>}

            <div style={{...s.sHead,marginTop:20}}><span style={s.sTitle}>Wochenplan</span></div>
            <div style={s.card}>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                {["Mo","Di","Mi","Do","Fr","Sa","So"].map((d,i)=>{
                  const isDone=gymDone[i],isToday=i===today
                  return (
                    <div key={d} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                      <span style={{fontSize:10,color:"#5a5968"}}>{d}</span>
                      <div onClick={()=>setGymDone(gd=>{const n=[...gd];n[i]=!n[i];return n})} style={{width:30,height:30,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:500,cursor:"pointer",background:isDone?"#1a4a32":"#1e1e21",color:isDone?"#6effa8":isToday?"#f0eff4":"#5a5968",border:isDone?"1px solid #2dce7a":isToday?"1.5px solid #2dce7a":"1px solid #2e2e33"}}>{gymPlan[i].slice(0,2)}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* MAIL */}
        {tab==="mail" && (
          <div style={s.section}>
            <div style={s.sHead}>
              <span style={s.sTitle}>Posteingang</span>
              <button style={s.btn("purple")} onClick={fetchMail}>{aiLoading.mail?"⏳ Lädt...":"↻ Aktualisieren"}</button>
            </div>
            {mailSummary && <div style={s.insight}><div style={s.insightLabel}>✦ KI-Zusammenfassung</div><div style={s.insightText}>{mailSummary}</div></div>}
            {emails.length===0 && !aiLoading.mail && <div style={{textAlign:"center",padding:"24px 0",color:"#5a5968",fontSize:13}}>Klicke "Aktualisieren" um Mails zu laden.</div>}
            {aiLoading.mail && <div style={{textAlign:"center",padding:"24px 0",color:"#5a5968",fontSize:13}}>Lädt Mails...</div>}
            {emails.map(m=>(
              <div key={m.id} style={{padding:"12px 0",borderBottom:"1px solid #2e2e33"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                  {m.unread && <div style={{width:7,height:7,background:"#4d9fff",borderRadius:"50%",flexShrink:0,marginTop:5}}></div>}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                      <span style={{fontSize:13,fontWeight:500,color:m.unread?"#93c8ff":"#f0eff4"}}>{m.from?.replace(/<.*>/,"").trim()}</span>
                      <span style={{fontSize:11,color:"#5a5968"}}>{fmtMailDate(m.date)}</span>
                    </div>
                    <div style={{fontSize:13,color:m.unread?"#f0eff4":"#a09fb0",margin:"3px 0 2px"}}>{m.subject}</div>
                    <div style={{fontSize:12,color:"#5a5968",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.snippet}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* NEWS */}
        {tab==="news" && (
          <div style={s.section}>
            <div style={s.sHead}>
              <span style={s.sTitle}>Nachrichten</span>
              <button style={s.btn("blue")} onClick={fetchNews}>{newsLoading?"⏳ Lädt...":"↻ Aktualisieren"}</button>
            </div>
            {newsLoading && <div style={{textAlign:"center",padding:"24px 0",color:"#5a5968",fontSize:13}}>Lädt Nachrichten...</div>}
            {!newsLoading && news.length===0 && <div style={{textAlign:"center",padding:"24px 0",color:"#5a5968",fontSize:13}}>Klicke "Aktualisieren" für aktuelle News.</div>}
            {news.map((item,i)=>(
              <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" style={{display:"block",textDecoration:"none",padding:"12px 0",borderBottom:"1px solid #2e2e33"}}>
                <div style={{fontSize:14,color:"#f0eff4",lineHeight:1.4,marginBottom:4}}>{item.title}</div>
                {item.description && <div style={{fontSize:12,color:"#5a5968",lineHeight:1.5,marginBottom:4}}>{item.description}</div>}
                <div style={{fontSize:11,color:"#3a3a40"}}>
                  {item.date ? new Date(item.date).toLocaleDateString("de-AT",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}) : ""} · Tagesschau
                </div>
              </a>
            ))}
          </div>
        )}

      </div>
    </>
  )
}
