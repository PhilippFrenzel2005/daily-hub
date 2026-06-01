import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/router"
import { useState, useEffect } from "react"
import Head from "next/head"

const KCAL_GOAL = 3200, PROT_GOAL = 200, CARB_GOAL = 400, FAT_GOAL = 90, WATER_GOAL = 3.5
const A = "#557A53"   // accent
const AS = "#EBF0EB"  // accent-soft

const GYM_PLAN = ["Push","Pull","Beine","Rest","Push","Pull","Rest"]

const DEFAULT_EXERCISES = {
  Push: [
    { name:"Bankdrücken",      detail:"4 × 8 · 80 kg",  setsTotal:4 },
    { name:"Schrägbank KH",    detail:"3 × 10 · 28 kg", setsTotal:3 },
    { name:"Schulterdrücken",  detail:"3 × 10 · 22 kg", setsTotal:3 },
    { name:"Seitheben",        detail:"3 × 15 · 12 kg", setsTotal:3 },
    { name:"Trizeps Pushdown", detail:"3 × 12 · 30 kg", setsTotal:3 },
    { name:"Dips",             detail:"3 × max",          setsTotal:3 },
  ],
  Pull: [
    { name:"Klimmzüge",        detail:"4 × 8",            setsTotal:4 },
    { name:"Kabelrudern",      detail:"3 × 12 · 60 kg",   setsTotal:3 },
    { name:"Lat-Zug",          detail:"3 × 12 · 55 kg",   setsTotal:3 },
    { name:"Bizeps Curls",     detail:"3 × 12 · 15 kg",   setsTotal:3 },
    { name:"Face Pulls",       detail:"3 × 15 · 20 kg",   setsTotal:3 },
    { name:"Hammer Curls",     detail:"3 × 10 · 14 kg",   setsTotal:3 },
  ],
  Beine: [
    { name:"Kniebeugen",       detail:"4 × 8 · 100 kg",   setsTotal:4 },
    { name:"Beinpresse",       detail:"3 × 12 · 140 kg",  setsTotal:3 },
    { name:"Beinstrecker",     detail:"3 × 15 · 45 kg",   setsTotal:3 },
    { name:"Leg Curl",         detail:"3 × 12 · 40 kg",   setsTotal:3 },
    { name:"Wadenheben",       detail:"4 × 15 · 60 kg",   setsTotal:4 },
    { name:"Hip Thrust",       detail:"3 × 12 · 80 kg",   setsTotal:3 },
  ],
}

const QUICK_FOODS = [
  { name:"Protein Shake",   kcal:130, protein:25, carbs:5,  fat:2 },
  { name:"Haferflocken 80g",kcal:295, protein:10, carbs:52, fat:5 },
  { name:"Hühnerbrust 150g",kcal:165, protein:31, carbs:0,  fat:4 },
  { name:"2 Eier",           kcal:144, protein:12, carbs:1,  fat:10 },
  { name:"Banane",           kcal:89,  protein:1,  carbs:23, fat:0 },
  { name:"Vollkornbrot",     kcal:200, protein:8,  carbs:36, fat:2 },
  { name:"Magerquark 250g",  kcal:130, protein:27, carbs:5,  fat:1 },
  { name:"Reis 100g",        kcal:350, protein:7,  carbs:77, fat:1 },
]

// ─── Icon component ───────────────────────────────────────────────────────────
function Icon({ name, size=24, color="currentColor", sw=1.7 }) {
  const p = {
    home:     <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    food:     <><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3"/><path d="M21 15v7"/></>,
    gym:      <><line x1="7" y1="12" x2="17" y2="12"/><line x1="5" y1="9" x2="5" y2="15"/><line x1="19" y1="9" x2="19" y2="15"/><line x1="3" y1="10.5" x2="3" y2="13.5"/><line x1="21" y1="10.5" x2="21" y2="13.5"/></>,
    tasks:    <><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>,
    mail:     <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></>,
    flame:    <><path d="M8.5 14.5A4.5 4.5 0 0 0 13 19c2.5 0 4.5-2 4.5-4.5 0-2.63-2.17-3.87-3.5-5.5C12.5 7.5 12 6 12 4c-.91 1.68-2 3.05-2 5C8.91 10.41 8.5 12.33 8.5 14.5Z"/></>,
    drop:     <><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></>,
    sparkle:  <><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/></>,
    refresh:  <><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></>,
    chevron:  <polyline points="9 18 15 12 9 6"/>,
    plus:     <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    check:    <polyline points="20 6 9 17 4 12"/>,
    arrowUp:  <><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    sync:     <><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></>,
    x:        <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    signout:  <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    news:     <><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></>,
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      style={{display:"block",flexShrink:0}}>
      {p[name]}
    </svg>
  )
}

// ─── Calorie Ring ─────────────────────────────────────────────────────────────
function CalorieRing({ kcal, goal }) {
  const r = 52, circ = 2 * Math.PI * r
  const pct = Math.min(1, kcal / goal)
  const offset = circ * (1 - pct)
  return (
    <div style={{position:"relative",width:128,height:128,flexShrink:0}}>
      <svg width={128} height={128} style={{transform:"rotate(-90deg)"}}>
        <circle cx={64} cy={64} r={r} fill="none" stroke="rgba(85,122,83,0.15)" strokeWidth={12}/>
        <circle cx={64} cy={64} r={r} fill="none" stroke={A} strokeWidth={12}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{transition:"stroke-dashoffset .6s cubic-bezier(.2,.8,.2,1)"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <span style={{fontSize:26,fontWeight:700,color:"#211D17",fontVariantNumeric:"tabular-nums",lineHeight:1}}>
          {Math.max(0, goal - kcal)}
        </span>
        <span style={{fontSize:11.5,color:"#8B8275",marginTop:3}}>kcal übrig</span>
      </div>
    </div>
  )
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const card = {
  background:"#FFFFFF",
  border:"1px solid rgba(33,29,23,0.08)",
  borderRadius:22,
  padding:16,
  marginBottom:18,
  boxShadow:"0 1px 2px rgba(33,29,23,0.04), 0 10px 26px rgba(33,29,23,0.05)",
}
const sLabel = {
  fontSize:12,fontWeight:700,textTransform:"uppercase",
  letterSpacing:"0.10em",color:"#8B8275",marginBottom:10,
}
const progBar = (pct, color=A) => ({
  height:"100%",borderRadius:"inherit",
  width:`${Math.min(100,pct)}%`,background:color,
  transition:"width .5s cubic-bezier(.2,.8,.2,1)",
})

// ─── Helpers ─────────────────────────────────────────────────────────────────
function makeDefaultEx(type) {
  return (DEFAULT_EXERCISES[type] || []).map((e,i) => ({
    ...e, id: Date.now()+i, sets: Array(e.setsTotal).fill(false)
  }))
}
function migrateEx(saved, type) {
  if (!saved?.length) return makeDefaultEx(type)
  return saved.map(e => ({
    ...e,
    setsTotal: e.setsTotal || 3,
    sets: e.sets || Array(e.setsTotal || 3).fill(false),
  }))
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [tab, setTab]               = useState("home")
  const [meals, setMeals]           = useState([])
  const [exercises, setExercises]   = useState([])
  const [water, setWater]           = useState(0)
  const [todos, setTodos]           = useState([])
  const [tasksListId, setTasksListId] = useState("@default")
  const [events, setEvents]         = useState([])
  const [emails, setEmails]         = useState([])
  const [gymDone, setGymDone]       = useState([false,false,false,false,false,false,false])
  const [briefing, setBriefing]     = useState("")
  const [foodInput, setFoodInput]   = useState("")
  const [gymEx, setGymEx]           = useState("")
  const [gymDetail, setGymDetail]   = useState("")
  const [todoInput, setTodoInput]   = useState("")
  const [aiLoading, setAiLoading]   = useState({})
  const [mailSummary, setMailSummary] = useState("")
  const [gymTip, setGymTip]         = useState("")
  const [unreadCount, setUnreadCount] = useState(0)
  const [news, setNews]               = useState([])
  const [newsLoading, setNewsLoading] = useState(false)

  const TODAY    = new Date().toDateString()
  const todayIdx = (new Date().getDay() + 6) % 7
  const todayType = GYM_PLAN[todayIdx]

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (status !== "authenticated") return
    try {
      const saved = JSON.parse(localStorage.getItem("hub-data") || "{}")
      if (saved.date === TODAY) {
        setMeals(saved.meals || [])
        setExercises(migrateEx(saved.exercises, todayType))
        setWater(saved.water || 0)
        setGymDone(saved.gymDone || Array(7).fill(false))
      } else {
        setExercises(makeDefaultEx(todayType))
      }
    } catch { setExercises(makeDefaultEx(todayType)) }
    fetchTasks()
    fetchCalendar()
    loadBriefing()
  }, [status])

  useEffect(() => {
    if (status !== "authenticated") return
    localStorage.setItem("hub-data", JSON.stringify({ date:TODAY, meals, exercises, water, gymDone }))
  }, [meals, exercises, water, gymDone, status])

  // ─── Data fetchers ──────────────────────────────────────────────────────────
  const fetchTasks = async () => {
    try {
      const d = await fetch("/api/tasks").then(r=>r.json())
      setTodos((d.tasks||[]).map(t=>({id:t.id,text:t.title,done:t.status==="completed",fromGoogle:true})))
      setTasksListId(d.listId || "@default")
    } catch {}
  }

  const fetchCalendar = async () => {
    try {
      const d = await fetch("/api/calendar").then(r=>r.json())
      setEvents(d.events || [])
    } catch {}
  }

  const fetchMail = async () => {
    setAiLoading(l=>({...l,mail:true}))
    try {
      const d = await fetch("/api/gmail").then(r=>r.json())
      setEmails(d.messages || [])
      setUnreadCount((d.messages||[]).filter(m=>m.unread).length)
      if (d.messages?.length) {
        const ad = await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({type:"mail-summary",data:{messages:d.messages}})}).then(r=>r.json())
        setMailSummary(ad.text || "")
      }
    } catch {}
    setAiLoading(l=>({...l,mail:false}))
  }

  const loadBriefing = async () => {
    setAiLoading(l=>({...l,briefing:true}))
    try {
      const d = await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({type:"briefing",data:{meals,exercises,tasks:todos,events,water}})}).then(r=>r.json())
      setBriefing(d.text || "")
    } catch {}
    setAiLoading(l=>({...l,briefing:false}))
  }

  const fetchNews = async () => {
    setNewsLoading(true)
    try {
      const d = await fetch("/api/news").then(r=>r.json())
      setNews(d.items || [])
    } catch {}
    setNewsLoading(false)
  }

  const loadGymTip = async () => {
    setAiLoading(l=>({...l,gym:true}))
    try {
      const d = await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({type:"gym",data:{exercises,day:todayType}})}).then(r=>r.json())
      setGymTip(d.text || "")
    } catch {}
    setAiLoading(l=>({...l,gym:false}))
  }

  // ─── Actions ────────────────────────────────────────────────────────────────
  const logFood = async () => {
    if (!foodInput.trim()) return
    setAiLoading(l=>({...l,food:true}))
    try {
      const d = await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({type:"food",data:{text:foodInput}})}).then(r=>r.json())
      const now = new Date()
      setMeals(m=>[...m,{...d,time:`${now.getHours()}:${String(now.getMinutes()).padStart(2,"0")}`,id:Date.now()}])
      setFoodInput("")
    } catch {}
    setAiLoading(l=>({...l,food:false}))
  }

  const addQuickFood = (f) => {
    const now = new Date()
    setMeals(m=>[...m,{...f,time:`${now.getHours()}:${String(now.getMinutes()).padStart(2,"0")}`,id:Date.now()}])
  }

  const addExercise = () => {
    if (!gymEx.trim()) return
    const setsTotal = parseInt(gymDetail.match(/^(\d+)/)?.[1]) || 3
    setExercises(e=>[...e,{id:Date.now(),name:gymEx,detail:gymDetail||"3 × 10",setsTotal,sets:Array(setsTotal).fill(false)}])
    setGymEx(""); setGymDetail("")
  }

  const toggleSet = (exId, si) =>
    setExercises(ex=>ex.map(e=> e.id!==exId ? e : {...e,sets:e.sets.map((s,i)=>i===si?!s:s)}))

  const addTodo = async () => {
    if (!todoInput.trim()) return
    const todo = {id:Date.now(),text:todoInput,done:false}
    setTodos(t=>[todo,...t])
    setTodoInput("")
    try {
      await fetch("/api/tasks",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({title:todoInput,listId:tasksListId})})
    } catch {}
  }

  const toggleTodo = async (todo) => {
    setTodos(t=>t.map(x=>x.id===todo.id?{...x,done:!x.done}:x))
    if (todo.fromGoogle) {
      try {
        await fetch("/api/tasks",{method:"PATCH",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({taskId:todo.id,listId:tasksListId,completed:!todo.done})})
      } catch {}
    }
  }

  // ─── Computed ───────────────────────────────────────────────────────────────
  const t = {
    kcal: meals.reduce((s,m)=>s+(m.kcal||0),0),
    prot: meals.reduce((s,m)=>s+(m.protein||0),0),
    carb: meals.reduce((s,m)=>s+(m.carbs||0),0),
    fat:  meals.reduce((s,m)=>s+(m.fat||0),0),
  }
  const openTodos  = todos.filter(x=>!x.done)
  const totalSets  = exercises.reduce((s,e)=>s+e.setsTotal,0)
  const doneSets   = exercises.reduce((s,e)=>s+e.sets.filter(Boolean).length,0)
  const gymPct     = totalSets>0 ? Math.round(doneSets/totalSets*100) : 0

  const greeting = () => {
    const h = new Date().getHours()
    const name = session?.user?.name?.split(" ")[0] || ""
    if (h<12) return ["Guten Morgen,", name ? name+"." : ""]
    if (h<18) return ["Guten Tag,",    name ? name+"." : ""]
    return          ["Guten Abend,",   name ? name+"." : ""]
  }

  const fmtTime = (iso) => {
    if (!iso) return ""
    const d = new Date(iso)
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2,"0")}`
  }

  const fmtMailDate = (str) => {
    if (!str) return ""
    const d = new Date(str)
    if (Date.now()-d < 86400000) return `${d.getHours()}:${String(d.getMinutes()).padStart(2,"0")}`
    return `${d.getDate()}.${d.getMonth()+1}.`
  }

  // ─── Auth guard ──────────────────────────────────────────────────────────────
  if (status==="loading") return (
    <div style={{minHeight:"100vh",background:"#F2EEE6",display:"flex",alignItems:"center",
      justifyContent:"center",color:"#8B8275",fontFamily:"'Hanken Grotesk',system-ui,sans-serif"}}>
      Laden…
    </div>
  )
  if (!session) return null

  const [g1, g2] = greeting()

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>Daily Hub</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
      </Head>

      {/* Scroll area */}
      <div style={{maxWidth:480,margin:"0 auto",padding:"52px 16px 88px",minHeight:"100vh",background:"#F2EEE6"}}>

        {/* ═══════════════ HOME ═══════════════════════════════════════════════ */}
        {tab==="home" && (
          <div style={{animation:"fadeSlideIn .28s ease"}}>

            {/* Greeting */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
              <div>
                <div style={{fontSize:13,color:"#8B8275",marginBottom:4}}>
                  {new Date().toLocaleDateString("de-AT",{weekday:"long",day:"numeric",month:"long"})}
                </div>
                <div style={{fontSize:30,fontWeight:800,color:"#211D17",lineHeight:1.1}}>
                  {g1}<br/>{g2}
                </div>
              </div>
              <button onClick={()=>signOut({callbackUrl:"/login"})} title="Abmelden"
                style={{background:"none",border:"none",padding:6,cursor:"pointer",marginTop:4,color:"#B6AEA0",display:"flex"}}>
                <Icon name="signout" size={18} color="#B6AEA0" sw={1.7}/>
              </button>
            </div>

            {/* KI Briefing */}
            <div style={{...card,padding:0,overflow:"hidden"}}>
              <div style={{background:AS,borderBottom:"1px solid rgba(33,29,23,0.08)",padding:"12px 16px",
                display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <Icon name="sparkle" size={15} color={A} sw={2}/>
                  <span style={{fontSize:14,fontWeight:700,color:A}}>Tages-Briefing</span>
                </div>
                <button onClick={loadBriefing} style={{background:"none",border:"none",padding:4,cursor:"pointer",display:"flex"}}>
                  <Icon name="refresh" size={17} color="#8B8275" sw={1.7}/>
                </button>
              </div>
              <div style={{padding:16}}>
                {aiLoading.briefing ? (
                  <div style={{display:"flex",flexDirection:"column",gap:9}}>
                    {[92,80,85,70].map((w,i)=>(
                      <div key={i} style={{height:12,borderRadius:6,width:`${w}%`,
                        background:"linear-gradient(90deg,#e8e4dc 25%,#f2eee6 50%,#e8e4dc 75%)",
                        backgroundSize:"200% 100%",animation:"shimmer 1.5s ease infinite"}}/>
                    ))}
                  </div>
                ) : (
                  <p style={{fontSize:15,color:"#211D17",lineHeight:1.62}}>
                    {briefing || "Tippe auf den Refresh-Button für dein persönliches Tages-Briefing."}
                  </p>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div style={{display:"flex",gap:12,marginBottom:18}}>
              {[
                {icon:"flame",label:"Kalorien",val:t.kcal,goal:KCAL_GOAL,unit:"kcal",fmt:v=>v},
                {icon:"drop", label:"Wasser",  val:water,  goal:WATER_GOAL,unit:"L",  fmt:v=>v.toFixed(1).replace(".",",")},
              ].map(({icon,label,val,goal,unit,fmt})=>(
                <div key={label} style={{...card,flex:1,marginBottom:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:6}}>
                    <Icon name={icon} size={14} color={A} sw={2}/>
                    <span style={{...sLabel,marginBottom:0}}>{label}</span>
                  </div>
                  <div style={{fontSize:38,fontWeight:700,color:"#211D17",lineHeight:1,fontVariantNumeric:"tabular-nums"}}>
                    {fmt(val)}{unit==="L"&&<span style={{fontSize:17,fontWeight:600}}> L</span>}
                  </div>
                  <div style={{fontSize:12.5,color:"#8B8275",marginTop:4}}>/ {goal} {unit}</div>
                  <div style={{height:8,background:"rgba(85,122,83,0.12)",borderRadius:4,marginTop:10,overflow:"hidden"}}>
                    <div style={progBar(val/goal*100)}/>
                  </div>
                </div>
              ))}
            </div>

            {/* Makros */}
            <div style={card}>
              <div style={sLabel}>Makros</div>
              {[["Protein",t.prot,PROT_GOAL,A],["Carbs",t.carb,CARB_GOAL,"#4A7060"],["Fett",t.fat,FAT_GOAL,"#B6AEA0"]].map(([label,val,goal,color])=>(
                <div key={label} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <span style={{fontSize:13,color:"#8B8275",width:56,flexShrink:0}}>{label}</span>
                  <div style={{flex:1,height:7,background:"rgba(33,29,23,0.07)",borderRadius:4,overflow:"hidden"}}>
                    <div style={progBar(val/goal*100,color)}/>
                  </div>
                  <span style={{fontSize:12,color:"#8B8275",minWidth:76,textAlign:"right",fontVariantNumeric:"tabular-nums"}}>
                    {Math.round(val)} / {goal}g
                  </span>
                </div>
              ))}
            </div>

            {/* Training card */}
            <button onClick={()=>setTab("gym")} style={{...card,width:"100%",textAlign:"left",
              cursor:"pointer",display:"flex",alignItems:"center",gap:12,border:"1px solid rgba(33,29,23,0.08)"}}>
              <div style={{width:46,height:46,borderRadius:11,background:AS,display:"flex",
                alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Icon name="gym" size={22} color={A} sw={2}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:A,textTransform:"uppercase",
                  letterSpacing:"0.05em",marginBottom:2}}>{todayType}-Tag</div>
                <div style={{fontSize:16,fontWeight:700,color:"#211D17"}}>
                  {todayType==="Rest" ? "Ruhetag" : `${todayType}-Workout`}
                </div>
                <div style={{fontSize:12.5,color:"#8B8275",marginTop:1}}>
                  {doneSets>0 ? `${doneSets}/${totalSets} Sätze erledigt` : "Noch nicht gestartet"}
                </div>
              </div>
              <Icon name="chevron" size={18} color="#B6AEA0" sw={2}/>
            </button>

            {/* Agenda */}
            <div style={card}>
              <div style={sLabel}>Heute</div>
              {events.slice(0,3).map((e,i)=>(
                <div key={e.id} style={{display:"flex",gap:10,alignItems:"center",padding:"8px 0",
                  borderBottom:"1px solid rgba(33,29,23,0.06)"}}>
                  <span style={{fontSize:14,fontWeight:700,color:A,width:46,flexShrink:0,fontVariantNumeric:"tabular-nums"}}>
                    {fmtTime(e.start)}
                  </span>
                  <span style={{fontSize:14,color:"#211D17",flex:1}}>{e.title}</span>
                </div>
              ))}
              {events.length===0 && (
                <div style={{fontSize:13,color:"#B6AEA0",padding:"4px 0 8px"}}>Keine Termine heute</div>
              )}
              <button onClick={()=>setTab("aufgaben")} style={{display:"flex",alignItems:"center",
                gap:8,padding:"10px 0 2px",width:"100%",background:"none",border:"none",
                borderTop:"1px solid rgba(33,29,23,0.06)",marginTop:4,cursor:"pointer"}}>
                <Icon name="tasks" size={16} color="#8B8275" sw={1.7}/>
                <span style={{flex:1,textAlign:"left",fontSize:14,color:"#8B8275"}}>
                  {openTodos.length} offene Todos
                </span>
                <Icon name="chevron" size={16} color="#B6AEA0" sw={2}/>
              </button>
            </div>

            {/* Week strip */}
            <div style={card}>
              <div style={sLabel}>Diese Woche</div>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                {["Mo","Di","Mi","Do","Fr","Sa","So"].map((d,i)=>{
                  const isToday = i===todayIdx
                  return (
                    <div key={d} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                      <span style={{fontSize:12,fontWeight:600,color:isToday?"#211D17":"#B6AEA0"}}>{d}</span>
                      <div onClick={()=>setGymDone(gd=>{const n=[...gd];n[i]=!n[i];return n})} style={{
                        width:38,height:38,borderRadius:"50%",display:"flex",alignItems:"center",
                        justifyContent:"center",fontSize:11,fontWeight:600,cursor:"pointer",
                        background: isToday?A:gymDone[i]?"rgba(85,122,83,0.14)":"transparent",
                        color: isToday?"#FFFFFF":gymDone[i]?A:"#B6AEA0",
                        border: isToday?"none":gymDone[i]?`1.5px solid ${A}`:"1.5px solid rgba(33,29,23,0.12)",
                        transition:"all .15s ease",
                      }}>
                        {GYM_PLAN[i].slice(0,2)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ ESSEN ══════════════════════════════════════════════ */}
        {tab==="essen" && (
          <div style={{animation:"fadeSlideIn .28s ease"}}>
            <h1 style={{fontSize:30,fontWeight:800,color:"#211D17",marginBottom:20}}>Essen</h1>

            {/* Ring + Makros */}
            <div style={{...card,display:"flex",gap:20,alignItems:"center"}}>
              <CalorieRing kcal={t.kcal} goal={KCAL_GOAL}/>
              <div style={{flex:1}}>
                {[["Protein",t.prot,PROT_GOAL,A],["Carbs",t.carb,CARB_GOAL,"#4A7060"],["Fett",t.fat,FAT_GOAL,"#B6AEA0"]].map(([label,val,goal,color])=>(
                  <div key={label} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontSize:12.5,color:"#8B8275"}}>{label}</span>
                      <span style={{fontSize:12.5,color:"#211D17",fontVariantNumeric:"tabular-nums"}}>{Math.round(val)}g</span>
                    </div>
                    <div style={{height:6,background:"rgba(33,29,23,0.07)",borderRadius:3,overflow:"hidden"}}>
                      <div style={progBar(val/goal*100,color)}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mahlzeit einloggen */}
            <div style={card}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:12}}>
                <Icon name="sparkle" size={14} color={A} sw={2}/>
                <span style={{fontSize:13,color:"#8B8275"}}>KI berechnet Kalorien & Makros automatisch</span>
              </div>
              <div style={{display:"flex",gap:8,background:"#FBF8F2",borderRadius:14,
                border:"1px solid rgba(33,29,23,0.08)",padding:"10px 10px 10px 14px",alignItems:"flex-end"}}>
                <textarea rows={2} value={foodInput} onChange={e=>setFoodInput(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();logFood()}}}
                  placeholder='z. B. "2 Eier, Toast mit Avocado und ein Kaffee"'
                  style={{flex:1,background:"none",border:"none",outline:"none",fontSize:14,
                    color:"#211D17",resize:"none",lineHeight:1.5,minHeight:46}}/>
                <button onClick={logFood} style={{width:40,height:40,borderRadius:11,
                  background:foodInput.trim()?A:"rgba(33,29,23,0.06)",border:"none",
                  display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",
                  flexShrink:0,transition:"background .15s"}}>
                  {aiLoading.food
                    ? <span style={{fontSize:14,color:"#FFFFFF"}}>…</span>
                    : <Icon name="arrowUp" size={18} color={foodInput.trim()?"#FFFFFF":"#B6AEA0"} sw={2}/>
                  }
                </button>
              </div>
            </div>

            {/* Schnell-Buttons */}
            <div style={card}>
              <div style={sLabel}>Schnell hinzufügen</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {QUICK_FOODS.map(f=>(
                  <button key={f.name} onClick={()=>addQuickFood(f)} style={{
                    background:"#FBF8F2",border:"1px solid rgba(33,29,23,0.08)",borderRadius:14,
                    padding:"7px 12px",fontSize:12.5,color:"#211D17",cursor:"pointer"}}>
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mahlzeitenliste */}
            <div style={card}>
              <div style={sLabel}>Mahlzeiten</div>
              {meals.length===0 && (
                <div style={{textAlign:"center",padding:"20px 0",color:"#B6AEA0",fontSize:13}}>Noch keine Mahlzeiten</div>
              )}
              {meals.map((m,i)=>(
                <div key={m.id||i} style={{display:"flex",alignItems:"center",padding:"10px 0",
                  borderBottom:"1px solid rgba(33,29,23,0.06)"}}>
                  <span style={{fontSize:12.5,fontWeight:600,color:"#8B8275",minWidth:40,fontVariantNumeric:"tabular-nums"}}>{m.time}</span>
                  <div style={{flex:1,minWidth:0,marginLeft:8}}>
                    <div style={{fontSize:14.5,fontWeight:600,color:"#211D17",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.name}</div>
                    <div style={{fontSize:12,color:"#8B8275",marginTop:1}}>
                      {Math.round(m.protein||0)}g P · {Math.round(m.carbs||0)}g C · {Math.round(m.fat||0)}g F
                    </div>
                  </div>
                  <span style={{fontSize:15,fontWeight:700,color:"#211D17",fontVariantNumeric:"tabular-nums",marginLeft:8}}>{m.kcal}</span>
                  <button onClick={()=>setMeals(ms=>ms.filter((_,j)=>j!==i))}
                    style={{background:"none",border:"none",color:"#B6AEA0",fontSize:18,cursor:"pointer",padding:"0 0 0 8px",lineHeight:1}}>
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Wasser */}
            <div style={card}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <Icon name="drop" size={20} color={A} sw={2}/>
                  <span style={{fontSize:26,fontWeight:700,color:"#211D17",fontVariantNumeric:"tabular-nums"}}>
                    {water.toFixed(2).replace(/\.?0+$/,"").replace(".",",")} L
                  </span>
                </div>
                <span style={{fontSize:13,color:"#8B8275"}}>Ziel {WATER_GOAL} L</span>
              </div>
              <div style={{height:9,background:"rgba(85,122,83,0.12)",borderRadius:5,overflow:"hidden",marginBottom:12}}>
                <div style={progBar(water/WATER_GOAL*100)}/>
              </div>
              <div style={{display:"flex",gap:8}}>
                {[[0.25,"Glas"],[0.5,"Flasche"],[0.75,"Groß"]].map(([amount,label])=>(
                  <button key={label} onClick={()=>setWater(w=>Math.round((w+amount)*100)/100)} style={{
                    flex:1,height:38,background:"#FBF8F2",border:"1px solid rgba(33,29,23,0.08)",
                    borderRadius:14,fontSize:12.5,color:A,fontWeight:600,cursor:"pointer"}}>
                    +{String(amount).replace(".",",")} L
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ GYM ════════════════════════════════════════════════ */}
        {tab==="gym" && (
          <div style={{animation:"fadeSlideIn .28s ease"}}>
            <h1 style={{fontSize:30,fontWeight:800,color:"#211D17",marginBottom:20}}>Gym</h1>

            {/* Header card */}
            <div style={card}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                <div style={{width:48,height:48,borderRadius:11,background:AS,display:"flex",
                  alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <Icon name="gym" size={24} color={A} sw={2}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:700,color:A,textTransform:"uppercase",
                    letterSpacing:"0.05em",marginBottom:2}}>{todayType}-Tag</div>
                  <div style={{fontSize:17,fontWeight:700,color:"#211D17"}}>
                    {todayType==="Rest" ? "Ruhetag" : `${todayType}-Workout`}
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:22,fontWeight:700,color:"#211D17"}}>{gymPct}%</div>
                  <div style={{fontSize:11,color:"#8B8275"}}>{doneSets}/{totalSets} Sätze</div>
                </div>
              </div>
              <div style={{height:8,background:"rgba(85,122,83,0.12)",borderRadius:4,overflow:"hidden"}}>
                <div style={progBar(gymPct)}/>
              </div>
            </div>

            {/* KI Tip */}
            {gymTip ? (
              <div style={{...card,background:AS}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                  <Icon name="sparkle" size={14} color={A} sw={2}/>
                  <span style={{fontSize:13,fontWeight:700,color:A}}>KI-Gym-Tipp</span>
                </div>
                <p style={{fontSize:14,color:"#211D17",lineHeight:1.55}}>{gymTip}</p>
              </div>
            ) : (
              <button onClick={loadGymTip} style={{...card,width:"100%",cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                color:A,fontSize:14,fontWeight:600,border:"1px solid rgba(85,122,83,0.25)"}}>
                <Icon name="sparkle" size={16} color={A} sw={2}/>
                {aiLoading.gym ? "Lädt…" : "KI-Tipp für heute abrufen"}
              </button>
            )}

            {/* Exercise cards */}
            {exercises.map(ex=>{
              const done = ex.sets.filter(Boolean).length
              return (
                <div key={ex.id} style={card}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div>
                      <div style={{fontSize:15.5,fontWeight:700,color:"#211D17"}}>{ex.name}</div>
                      <div style={{fontSize:12.5,color:"#8B8275",marginTop:2}}>{ex.detail}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginTop:2}}>
                      <span style={{fontSize:13,color:"#8B8275"}}>{done}/{ex.setsTotal}</span>
                      <button onClick={()=>setExercises(e=>e.filter(x=>x.id!==ex.id))}
                        style={{background:"none",border:"none",cursor:"pointer",padding:0,display:"flex"}}>
                        <Icon name="x" size={16} color="#B6AEA0" sw={2}/>
                      </button>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    {ex.sets.map((isDone,si)=>(
                      <button key={si} onClick={()=>toggleSet(ex.id,si)} style={{
                        flex:1,height:38,borderRadius:14,border:"none",cursor:"pointer",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        background:isDone?A:"#FBF8F2",
                        transition:"all .15s ease",
                      }}>
                        {isDone
                          ? <Icon name="check" size={16} color="#FFFFFF" sw={2.5}/>
                          : <span style={{fontSize:13,color:"#B6AEA0",fontWeight:500}}>{si+1}</span>
                        }
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}

            {/* Add exercise */}
            <div style={card}>
              <div style={sLabel}>Übung hinzufügen</div>
              <div style={{display:"flex",gap:8}}>
                <input value={gymEx} onChange={e=>setGymEx(e.target.value)} placeholder="Übungsname…"
                  onKeyDown={e=>e.key==="Enter"&&addExercise()}
                  style={{flex:2,background:"#FBF8F2",border:"1px solid rgba(33,29,23,0.08)",borderRadius:14,
                    padding:"9px 12px",color:"#211D17",fontSize:13,outline:"none"}}/>
                <input value={gymDetail} onChange={e=>setGymDetail(e.target.value)} placeholder="3×10×80kg"
                  onKeyDown={e=>e.key==="Enter"&&addExercise()}
                  style={{flex:1.3,background:"#FBF8F2",border:"1px solid rgba(33,29,23,0.08)",borderRadius:14,
                    padding:"9px 12px",color:"#211D17",fontSize:13,outline:"none"}}/>
                <button onClick={addExercise} style={{width:42,height:42,borderRadius:14,background:A,
                  border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <Icon name="plus" size={18} color="#FFFFFF" sw={2.5}/>
                </button>
              </div>
            </div>

            {/* Split overview */}
            <div style={card}>
              <div style={sLabel}>Wochenplan</div>
              {["Mo","Di","Mi","Do","Fr","Sa","So"].map((d,i)=>{
                const isToday = i===todayIdx
                return (
                  <div key={d} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 10px",
                    borderRadius:12,marginBottom:2,background:isToday?AS:"transparent"}}>
                    <span style={{fontSize:13,color:isToday?A:"#8B8275",width:24}}>{d}</span>
                    <span style={{fontSize:14,fontWeight:isToday?700:400,color:isToday?A:"#211D17",flex:1}}>
                      {GYM_PLAN[i]}
                    </span>
                    {isToday && (
                      <span style={{fontSize:11,fontWeight:700,color:"#FFFFFF",background:A,
                        padding:"2px 8px",borderRadius:99}}>Heute</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ═══════════════ AUFGABEN ═══════════════════════════════════════════ */}
        {tab==="aufgaben" && (
          <div style={{animation:"fadeSlideIn .28s ease"}}>
            <h1 style={{fontSize:30,fontWeight:800,color:"#211D17",marginBottom:20}}>Aufgaben</h1>

            {/* Calendar */}
            <div style={card}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
                <Icon name="calendar" size={14} color="#8B8275" sw={1.7}/>
                <span style={sLabel}>Google Kalender</span>
              </div>
              {events.length===0 && (
                <div style={{fontSize:13,color:"#B6AEA0",padding:"4px 0"}}>Keine Termine heute</div>
              )}
              {events.map((e,i)=>(
                <div key={e.id} style={{display:"flex",gap:10,alignItems:"center",padding:"9px 0",
                  borderBottom:i<events.length-1?"1px solid rgba(33,29,23,0.06)":"none"}}>
                  <div style={{width:3,height:34,borderRadius:2,background:A,flexShrink:0}}/>
                  <span style={{fontSize:14,fontWeight:700,color:A,width:46,flexShrink:0,fontVariantNumeric:"tabular-nums"}}>
                    {fmtTime(e.start)}
                  </span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:15,fontWeight:600,color:"#211D17"}}>{e.title}</div>
                    {e.end && <div style={{fontSize:12,color:"#8B8275"}}>bis {fmtTime(e.end)}</div>}
                  </div>
                </div>
              ))}
            </div>

            {/* Tasks */}
            <div style={card}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <Icon name="sync" size={14} color="#8B8275" sw={1.7}/>
                  <span style={sLabel}>Google Tasks</span>
                </div>
                <button onClick={fetchTasks} style={{background:"none",border:"none",cursor:"pointer",
                  padding:4,display:"flex"}}>
                  <Icon name="refresh" size={15} color="#B6AEA0" sw={1.7}/>
                </button>
              </div>

              {todos.map(todo=>(
                <div key={todo.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",
                  borderBottom:"1px solid rgba(33,29,23,0.06)"}}>
                  <button onClick={()=>toggleTodo(todo)} style={{
                    width:24,height:24,borderRadius:"50%",
                    border:`1.5px solid ${todo.done?A:"rgba(33,29,23,0.18)"}`,
                    background:todo.done?A:"transparent",cursor:"pointer",
                    display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
                    {todo.done && <Icon name="check" size={12} color="#FFFFFF" sw={2.5}/>}
                  </button>
                  <span style={{flex:1,fontSize:14,color:todo.done?"#B6AEA0":"#211D17",
                    textDecoration:todo.done?"line-through":"none"}}>
                    {todo.text}
                  </span>
                </div>
              ))}

              {/* Add todo row */}
              <div style={{display:"flex",alignItems:"center",gap:8,
                padding:`${todos.length?10:4}px 0 4px`,
                borderTop:todos.length?"1px solid rgba(33,29,23,0.06)":"none",
                marginTop:todos.length?4:0}}>
                <Icon name="plus" size={18} color="#B6AEA0" sw={1.7}/>
                <input value={todoInput} onChange={e=>setTodoInput(e.target.value)}
                  placeholder="Aufgabe hinzufügen…" onKeyDown={e=>e.key==="Enter"&&addTodo()}
                  style={{flex:1,background:"none",border:"none",outline:"none",
                    fontSize:14,color:"#211D17"}}/>
                {todoInput.trim() && (
                  <button onClick={addTodo} style={{background:A,border:"none",borderRadius:10,
                    padding:"4px 10px",color:"#FFFFFF",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                    Hinzufügen
                  </button>
                )}
              </div>
              <div style={{fontSize:11.5,color:"#B6AEA0",marginTop:4}}>Synchronisiert live mit Google Tasks</div>
            </div>

            {/* Clear done */}
            {todos.some(t=>t.done) && (
              <button onClick={()=>setTodos(t=>t.filter(x=>!x.done))}
                style={{background:"none",border:"1px solid rgba(33,29,23,0.08)",borderRadius:14,
                  padding:"10px 16px",fontSize:13,color:"#8B8275",cursor:"pointer",
                  display:"flex",alignItems:"center",gap:6,width:"100%",justifyContent:"center"}}>
                Erledigte Aufgaben löschen
              </button>
            )}
          </div>
        )}

        {/* ═══════════════ MAIL ═══════════════════════════════════════════════ */}
        {tab==="mail" && (
          <div style={{animation:"fadeSlideIn .28s ease"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <h1 style={{fontSize:30,fontWeight:800,color:"#211D17"}}>Posteingang</h1>
              {unreadCount>0 && (
                <span style={{fontSize:14,fontWeight:600,color:"#8B8275"}}>{unreadCount} ungelesen</span>
              )}
            </div>

            {/* KI Summary trigger */}
            {!mailSummary && !aiLoading.mail && (
              <button onClick={fetchMail} style={{
                ...card,width:"100%",cursor:"pointer",border:"none",
                display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                background:A,color:"#FFFFFF",fontSize:15,fontWeight:600,
                boxShadow:"0 4px 16px rgba(85,122,83,0.35)",marginBottom:18}}>
                <Icon name="sparkle" size={18} color="#FFFFFF" sw={2}/>
                Posteingang mit KI zusammenfassen
              </button>
            )}

            {aiLoading.mail && (
              <div style={{...card,display:"flex",alignItems:"center",justifyContent:"center",gap:8,color:"#8B8275"}}>
                <Icon name="sparkle" size={16} color="#8B8275" sw={2}/>
                <span style={{fontSize:14}}>Posteingang wird geladen…</span>
              </div>
            )}

            {mailSummary && (
              <div style={{...card,padding:0,overflow:"hidden"}}>
                <div style={{background:AS,borderBottom:"1px solid rgba(33,29,23,0.08)",
                  padding:"12px 16px",display:"flex",alignItems:"center",gap:6}}>
                  <Icon name="sparkle" size={14} color={A} sw={2}/>
                  <span style={{fontSize:14,fontWeight:700,color:A}}>KI-Zusammenfassung</span>
                </div>
                <div style={{padding:16}}>
                  <p style={{fontSize:14,color:"#211D17",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{mailSummary}</p>
                </div>
              </div>
            )}

            {/* Refresh row */}
            {emails.length>0 && (
              <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
                <button onClick={fetchMail} style={{background:"none",border:"1px solid rgba(33,29,23,0.08)",
                  borderRadius:14,padding:"6px 12px",cursor:"pointer",display:"flex",alignItems:"center",
                  gap:4,fontSize:12,color:"#8B8275"}}>
                  <Icon name="refresh" size={14} color="#8B8275" sw={1.7}/>
                  Aktualisieren
                </button>
              </div>
            )}

            {/* No mails state */}
            {emails.length===0 && !aiLoading.mail && mailSummary==="" && (
              <div style={{textAlign:"center",padding:"40px 0",color:"#B6AEA0",fontSize:13}}>
                Klicke oben, um Mails zu laden.
              </div>
            )}

            {/* Mail list */}
            {emails.map(m=>(
              <div key={m.id} style={{...card,display:"flex",gap:10,alignItems:"flex-start",cursor:"pointer",marginBottom:10}}
                onClick={()=>setEmails(em=>em.map(x=>x.id===m.id?{...x,unread:false}:x))}>
                <div style={{width:8,height:8,borderRadius:"50%",background:m.unread?A:"transparent",
                  marginTop:6,flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",gap:8,marginBottom:2}}>
                    <span style={{fontSize:14.5,fontWeight:m.unread?700:400,color:"#211D17",
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                      {m.from?.replace(/<.*>/,"").trim()}
                    </span>
                    <span style={{fontSize:11.5,color:"#B6AEA0",flexShrink:0}}>{fmtMailDate(m.date)}</span>
                  </div>
                  <div style={{fontSize:13.5,fontWeight:m.unread?600:400,color:m.unread?"#211D17":"#8B8275",
                    marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {m.subject}
                  </div>
                  <div style={{fontSize:12.5,color:"#B6AEA0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {m.snippet}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══════════════ NEWS ══════════════════════════════════════════════ */}
        {tab==="news" && (
          <div style={{animation:"fadeSlideIn .28s ease"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <h1 style={{fontSize:30,fontWeight:800,color:"#211D17"}}>Nachrichten</h1>
              <button onClick={fetchNews} style={{background:"none",border:"1px solid rgba(33,29,23,0.08)",
                borderRadius:14,padding:"6px 12px",cursor:"pointer",display:"flex",alignItems:"center",
                gap:4,fontSize:12,color:"#8B8275"}}>
                <Icon name="refresh" size={14} color="#8B8275" sw={1.7}/>
                {newsLoading ? "Lädt…" : "Aktualisieren"}
              </button>
            </div>

            {newsLoading && (
              <div style={card}>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {[88,72,80,65,90].map((w,i)=>(
                    <div key={i} style={{height:14,borderRadius:6,width:`${w}%`,
                      background:"linear-gradient(90deg,#e8e4dc 25%,#f2eee6 50%,#e8e4dc 75%)",
                      backgroundSize:"200% 100%",animation:"shimmer 1.5s ease infinite"}}/>
                  ))}
                </div>
              </div>
            )}

            {!newsLoading && news.length===0 && (
              <div style={{textAlign:"center",padding:"40px 0",color:"#B6AEA0",fontSize:13}}>
                Klicke "Aktualisieren" für aktuelle Nachrichten.
              </div>
            )}

            {news.map((item,i)=>(
              <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
                style={{...card,display:"block",textDecoration:"none",marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,marginBottom:6}}>
                  <span style={{fontSize:10.5,fontWeight:700,color:A,textTransform:"uppercase",
                    letterSpacing:"0.06em",flexShrink:0}}>{item.source}</span>
                  <span style={{fontSize:11,color:"#B6AEA0",flexShrink:0}}>
                    {item.date ? new Date(item.date).toLocaleDateString("de-AT",{day:"numeric",month:"short"}) : ""}
                  </span>
                </div>
                <div style={{fontSize:15,fontWeight:600,color:"#211D17",lineHeight:1.4,marginBottom:4}}>
                  {item.title}
                </div>
                {item.description && (
                  <div style={{fontSize:12.5,color:"#8B8275",lineHeight:1.5}}>
                    {item.description}
                  </div>
                )}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* ═══════════════ BOTTOM NAV ═════════════════════════════════════════ */}
      <nav style={{
        position:"fixed",bottom:0,left:0,right:0,
        background:"rgba(255,255,255,0.88)",
        backdropFilter:"blur(16px) saturate(160%)",
        WebkitBackdropFilter:"blur(16px) saturate(160%)",
        borderTop:"1px solid rgba(33,29,23,0.08)",
        display:"flex",justifyContent:"space-around",alignItems:"stretch",
        zIndex:100,paddingBottom:"env(safe-area-inset-bottom,0px)",
      }}>
        {[
          ["home",  "home",   "Home"],
          ["essen", "food",   "Essen"],
          ["gym",   "gym",    "Gym"],
          ["aufgaben","tasks","Tasks"],
          ["mail",  "mail",   "Mail"],
          ["news",  "news",   "News"],
        ].map(([id,icon,label])=>{
          const active = tab===id
          const badge  = id==="mail" && unreadCount>0 ? unreadCount : 0
          return (
            <button key={id} onClick={()=>{ setTab(id); if(id==="news"&&!news.length) fetchNews() }}
              style={{background:"none",border:"none",cursor:"pointer",flex:1,
                display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                gap:2,padding:"8px 4px",position:"relative",minHeight:58}}>
              {badge>0 && (
                <div style={{position:"absolute",top:6,left:"50%",marginLeft:4,
                  width:16,height:16,borderRadius:"50%",background:A,
                  border:"2px solid #F2EEE6",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:9,color:"#FFFFFF",fontWeight:700,lineHeight:1}}>
                    {badge>9?"9+":badge}
                  </span>
                </div>
              )}
              <Icon name={icon} size={22} color={active?A:"#B6AEA0"} sw={active?2:1.7}/>
              <span style={{fontSize:10.5,fontWeight:active?700:500,color:active?A:"#B6AEA0"}}>
                {label}
              </span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
