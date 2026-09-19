"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Agent = { name: string; title: string; role?: string; id: string; skin: string; hair: string; shirt: string; access: string; context: number; rating: string; status: string; reports?: string; skills?: string[]; contextNote?: string; shared_memory_agent_ids?: string[] };
type Operation = { now: string; eta: string; tools: string[]; schedule: string[] };
type Draft = { agent: Agent; operation: Operation; isNew: boolean };
type Team = { name: string; purpose: string; agents: Agent[] };
type Vertical = { name: string; short: string; icon: string; tone: string; description: string; teams: Team[] };

const verticals: Vertical[] = [
  {name:"Sales & Business Development",short:"Sales-AI",icon:"↗",tone:"violet",description:"Lead follow-ups, meeting prep and permissioned CRM actions.",teams:[
    {name:"POS Growth",purpose:"Acquire and activate point-of-sale merchants",agents:[
      {name:"Aarav",title:"Sales Manager-AI",id:"SL-MGR-014",skin:"#f1c198",hair:"#38291e",shirt:"#7057c8",access:"Sales CRM · Team pipeline",context:94,rating:"4.9",status:"Online"},
      {name:"Tara",title:"Senior Sales Executive-AI",id:"SL-EXE-071",skin:"#bf7b55",hair:"#241b1d",shirt:"#e38a45",access:"Assigned leads · CRM write",context:88,rating:"4.8",status:"Working",reports:"Aarav"},
      {name:"Kunal",title:"Sales Associate-AI",id:"SL-AST-109",skin:"#d79068",hair:"#54311d",shirt:"#63a973",access:"Assigned leads · Draft only",context:76,rating:"4.6",status:"Online",reports:"Tara"}]},
    {name:"Enterprise Partnerships",purpose:"Build strategic merchant partnerships",agents:[{name:"Ishita",title:"Partnership Manager-AI",id:"SL-PAR-032",skin:"#efbf91",hair:"#532a27",shirt:"#5274b8",access:"Partner CRM · Contracts read",context:91,rating:"4.9",status:"Online"}]},
    {name:"QR Merchant Acquisition",purpose:"Grow QR acceptance and activation",agents:[{name:"Nisha",title:"Acquisition Lead-AI",id:"SL-QR-029",skin:"#d38861",hair:"#32251f",shirt:"#de6e86",access:"Merchant CRM · Team data",context:89,rating:"4.8",status:"Online"}]}]},
  {name:"Customer Service",short:"Support-AI",icon:"♡",tone:"orange",description:"Resolve merchant issues and prepare customer replies.",teams:[{name:"Merchant Resolution",purpose:"Investigate and resolve merchant issues",agents:[{name:"Meera",title:"Support Manager-AI",id:"CS-MGR-009",skin:"#c57e55",hair:"#2d2020",shirt:"#db7c43",access:"Cases · Escalation queue",context:92,rating:"4.9",status:"Online"}]},{name:"Customer Care",purpose:"Handle customer replies and follow-ups",agents:[{name:"Rohan",title:"Customer Associate-AI",id:"CS-AST-122",skin:"#efbe93",hair:"#33221e",shirt:"#5b8fc4",access:"Assigned tickets · Draft only",context:81,rating:"4.7",status:"Working"}]}]},
  {name:"Finance & Accounting",short:"Finance-AI",icon:"₹",tone:"mint",description:"Check invoices, flag variance and prepare reconciliation.",teams:[{name:"Reconciliation",purpose:"Prepare daily settlement reconciliations",agents:[{name:"Kabir",title:"Finance Manager-AI",id:"FN-MGR-018",skin:"#9f644a",hair:"#1b1a1e",shirt:"#44937b",access:"Finance ledger · Read only",context:95,rating:"4.9",status:"Online"}]}]},
  {name:"Merchant & Business Operations",short:"Ops-AI",icon:"◌",tone:"blue",description:"Track partner commitments, SLA risks and handoffs.",teams:[{name:"Merchant Operations",purpose:"Maintain partner commitments and SLA health",agents:[{name:"Pooja",title:"Operations Lead-AI",id:"OP-MGR-023",skin:"#efbd91",hair:"#20272b",shirt:"#4285aa",access:"SLA board · Partner data",context:90,rating:"4.8",status:"Working"}]}]},
  {name:"Human Resources & Administration",short:"HR-AI",icon:"☻",tone:"rose",description:"Guide onboarding, employee workflows and team escalations.",teams:[{name:"People Experience",purpose:"Support onboarding and employee journeys",agents:[{name:"Anaya",title:"People Manager-AI",id:"HR-MGR-008",skin:"#b96f51",hair:"#412727",shirt:"#c35d81",access:"HRIS · Restricted team data",context:87,rating:"4.8",status:"Online"}]}]}
];

const operations: Record<string, Operation> = {
  Aarav: { now: "Preparing POS Growth pipeline review", eta: "Ready in 8 min", tools: ["Salesforce", "Gmail", "Calendar"], schedule: ["09:30 pipeline risk scan", "11:00 leadership review prep", "15:30 follow-up approval queue"] },
  Tara: { now: "Drafting follow-ups for 14 warm leads", eta: "12 replies in 6 min", tools: ["Salesforce", "Gmail", "Slack"], schedule: ["10:00 lead follow-ups", "13:00 merchant demo prep", "16:00 CRM hygiene check"] },
  Kunal: { now: "Watching new POS lead assignments", eta: "Next check in 4 min", tools: ["Salesforce", "Slack"], schedule: ["09:15 lead assignment review", "12:30 prospect research", "17:00 daily handover"] },
  Ishita: { now: "Building partnership meeting brief", eta: "Ready in 11 min", tools: ["Salesforce", "Google Drive", "Calendar"], schedule: ["10:30 partner meeting prep", "14:00 contract change watch", "17:30 opportunity summary"] },
  Nisha: { now: "Monitoring QR activation SLA risks", eta: "2 merchants flagged", tools: ["Internal Ops", "Salesforce", "Slack"], schedule: ["09:00 activation report", "12:00 SLA risk scan", "16:30 escalation review"] },
  Meera: { now: "Classifying merchant payment issue", eta: "Draft reply in 3 min", tools: ["Zendesk", "Slack", "Internal Ops"], schedule: ["09:00 priority case triage", "13:30 issue trend brief", "18:00 shift handover"] },
  Rohan: { now: "Waiting for assigned customer case", eta: "On standby", tools: ["Zendesk", "Gmail"], schedule: ["10:00 reply quality scan", "14:00 customer follow-ups", "17:45 case notes"] },
  Kabir: { now: "Reconciling yesterday’s settlements", eta: "Variance report in 14 min", tools: ["Finance Ledger", "Google Sheets", "Internal Ops"], schedule: ["09:30 settlement reconciliation", "13:00 variance review", "17:00 approval summary"] },
  Pooja: { now: "Tracking merchant partner SLA commitments", eta: "3 risks need review", tools: ["Internal Ops", "Slack", "Calendar"], schedule: ["09:00 SLA monitor", "12:45 partner check-in prep", "16:00 handover review"] },
  Anaya: { now: "Preparing an onboarding journey", eta: "Ready in 9 min", tools: ["Google Workspace", "HRIS", "Slack"], schedule: ["10:00 onboarding checklist", "13:00 policy Q&A queue", "16:30 manager escalation review"] }
};

function Face({agent,size=60}:{agent:Agent;size?:number}) { return <span className="face" style={{width:size,height:size,background:agent.shirt}}><svg viewBox="0 0 100 100"><path d="M17 100c4-22 18-31 33-31s29 9 33 31" fill={agent.shirt}/><circle cx="50" cy="43" r="25" fill={agent.skin}/><path d="M25 43c0-21 10-30 27-30 15 0 25 11 24 29-9-8-19-10-30-7-6 2-12 6-21 8z" fill={agent.hair}/><circle cx="40" cy="47" r="2.4" fill="#29201d"/><circle cx="60" cy="47" r="2.4" fill="#29201d"/><path d="M43 58c4 4 10 4 14 0" fill="none" stroke="#8f5041" strokeWidth="2.2" strokeLinecap="round"/></svg></span> }

function SalesStudio({active,onChoose}:{active:string;onChoose:(tool:string)=>void}) { const tools=[
  ["leads","Lead Scout","Find public, permissioned business prospects and build a review queue."], ["qualify","Lead Qualifier","Suggest eligibility questions and flag incomplete or suspicious information."], ["growth","Growth Finder","Identify existing merchants who may benefit from another Paytm product."], ["pitch","Pitch Copilot","Create a merchant-specific pitch, meeting brief and objection responses."], ["territory","Territory Planner","Prioritise field visits by potential, proximity and follow-up urgency."], ["meetings","Meeting Intelligence","Prepare agendas, capture notes and create approved CRM follow-ups."]
 ]; return <motion.section initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="sales-studio"><div><p className="eyebrow">SALES-AI COMMAND CENTRE</p><h3>From prospect signal to approved next action.</h3></div><div className="sales-tool-grid">{tools.map(([id,name,description])=><button key={id} className={active===id?"selected":""} onClick={()=>onChoose(id)}><b>{name}</b><small>{description}</small></button>)}</div>{active&&<div className="sales-output">{active==="leads"&&<><div><p className="eyebrow">LEAD SCOUT · REVIEW BEFORE CRM CREATION</p><h3>12 merchants found for POS Growth</h3></div><table><thead><tr><th>Merchant</th><th>Signal</th><th>Fit</th><th>Status</th></tr></thead><tbody><tr><td>Green Basket Mart</td><td>New second store</td><td>POS + Soundbox</td><td><span className="status-tag">Needs review</span></td></tr><tr><td>Urban Brew Café</td><td>Hiring cashier staff</td><td>QR + POS</td><td><span className="status-tag">Ready to qualify</span></td></tr><tr><td>Medico Plus</td><td>Growing delivery orders</td><td>Payment Links</td><td><span className="status-tag">Researching</span></td></tr></tbody></table><button className="primary studio-action">Send selected leads for human review →</button></>}{active==="qualify"&&<><p className="eyebrow">LEAD QUALIFIER · NO AUTO-APPROVAL</p><h3>Suggested qualification questions</h3><ol><li>Which payment acceptance method do you use today, and at how many outlets?</li><li>Who is authorised to evaluate devices or payment solutions?</li><li>What is your approximate monthly transaction volume and peak period?</li><li>Can the business identity, location and contact details be verified?</li></ol><div className="risk-note">⚠ Flag for human review when identity details conflict, documentation is incomplete, or a request changes settlement information.</div></>}{active==="growth"&&<><p className="eyebrow">GROWTH FINDER · EXISTING MERCHANTS</p><h3>3 permissioned cross-sell opportunities</h3><div className="opportunity"><b>Green Basket Mart</b><span>Uses QR only</span><em>Recommend: POS for multi-counter billing</em></div><div className="opportunity"><b>Urban Brew Café</b><span>Uses Soundbox + QR</span><em>Recommend: Payment Links for catering deposits</em></div><div className="opportunity"><b>Medico Plus</b><span>Uses in-store payments</span><em>Recommend: Payment Gateway for delivery site</em></div></>}{active==="pitch"&&<><p className="eyebrow">PITCH COPILOT · HUMAN REVIEW REQUIRED</p><h3>Merchant brief: Green Basket Mart</h3><p>Two outlets, growing footfall, currently QR-only. Lead with faster multi-counter billing and unified reconciliation; avoid unverified pricing or promises.</p><div className="pitch-lines"><span>Opening: “I noticed your new outlet—can I show how checkout can stay quick at both counters?”</span><span>Evidence: QR acceptance plus POS and payment reconciliation capabilities.</span><span>Next action: Book a 15-minute demo, subject to merchant consent.</span></div></>}{["territory","meetings"].includes(active)&&<><p className="eyebrow">{active==="territory"?"TERRITORY PLANNER":"MEETING INTELLIGENCE"} · PLANNED</p><h3>This workflow is ready to connect.</h3><p>It will use approved calendar, CRM and field-visit data, then present recommendations for a sales manager to approve before any action is taken.</p></>}</div>}</motion.section> }

function SupportStudio({active,onChoose}:{active:string;onChoose:(tool:string)=>void}) { const tools=[["inbox","Omnichannel Triage","Classify email, social DMs, chat and call notes by intent, urgency and tier."],["resolve","Multilingual Resolver","Respond in English, Hinglish or regional languages using approved knowledge."],["route","Smart Routing","Route to the best available agent and attach a concise handoff summary."],["guardrails","Resolution Guardrails","Check policy, confidence and latency before an automated action."]];return <motion.section initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="sales-studio support-studio"><div><p className="eyebrow">SUPPORT-AI COMMAND CENTRE</p><h3>Fast, accurate resolution—with a human always in control.</h3></div><div className="sales-tool-grid">{tools.map(([id,name,description])=><button key={id} className={active===id?"selected":""} onClick={()=>onChoose(id)}><b>{name}</b><small>{description}</small></button>)}</div>{active&&<div className="sales-output">{active==="inbox"&&<><p className="eyebrow">LIVE INBOX · ROUTING PREVIEW</p><h3>Incoming conversations</h3><div className="opportunity"><b>Email · Merchant settlement delayed</b><span>High urgency · frustrated</span><em>Route: Settlement specialist</em></div><div className="opportunity"><b>Instagram DM · Soundbox language</b><span>Medium · Hindi</span><em>Route: Device support</em></div><div className="opportunity"><b>Chat · Password reset</b><span>Low · neutral</span><em>Safe auto-resolution</em></div></>}{active==="resolve"&&<><p className="eyebrow">MULTILINGUAL RESOLVER · APPROVED KNOWLEDGE ONLY</p><h3>Hinglish reply draft</h3><div className="pitch-lines"><span>“Aapka concern samajh gaya. Main aapke settlement status ko check kar raha hoon.”</span><span>Policy answer is retrieved from the current approved source—not generated pricing or discount information.</span><span>If the policy is missing or the confidence is low, it asks a clarifying question or escalates.</span></div></>}{active==="route"&&<><p className="eyebrow">HANDOFF QUALITY</p><h3>Escalation summary prepared</h3><p>Merchant: Urban Brew Café · Issue: settlement delay · Sentiment: frustrated · What was checked: transaction reference and expected window · Next owner: Settlement specialist.</p><div className="risk-note">Human handoff is triggered when the agent cannot resolve the issue, detects risk, or the customer explicitly requests a person.</div></>}{active==="guardrails"&&<><p className="eyebrow">SERVICE OBJECTIVES</p><h3>Resolution quality controls</h3><div className="support-metrics"><span><b>60%+</b> eligible issues auto-resolved</span><span><b>&lt; 3 sec</b> response target</span><span><b>0</b> unsupported policy/pricing claims</span><span><b>100%</b> handoff summaries attached</span></div><p>Every reply is grounded in approved policy and similar resolved cases; actions that change money, access or account details require the right tool and policy check.</p></>}</div>}</motion.section> }

export default function Home(){

  const [verticalsState, setVerticalsState] = useState<Vertical[]>(verticals);
  const [agentsByTeam, setAgentsByTeam] = useState<Record<string,Agent[]>>({});

  useEffect(() => {
    async function load() {
      try {
        const t_res = await fetch("http://localhost:8000/api/teams");
        const t_data = await t_res.json();
        const a_res = await fetch("http://localhost:8000/api/agents");
        const a_data = await a_res.json();

        const dbTeams = t_data.teams || [];
        const dbAgents = a_data.agents || [];

        // group dbAgents by team_id
        const agentsMap: Record<string, Agent[]> = {};
        dbAgents.forEach((a: any) => {
           const uiAgent: Agent = {
             id: a.id,
             name: a.name,
             title: a.title,
             role: a.role,
             skin: a.avatar_skin || "#f1c198",
             hair: a.avatar_hair || "#38291e",
             shirt: a.avatar_shirt || "#7057c8",
             access: a.role_based_access || "",
             context: a.context_score || 0,
             rating: a.rating || "5.0",
             status: a.status || "Online",
             reports: a.reports_to || undefined,
             shared_memory_agent_ids: (a.agent_shared_memory || []).map((x: any) => x.target_agent_id)
           };
           // map team_id to team name for grouping
           const t = dbTeams.find((t: any) => t.id === a.team_id);
           if (t) {
             if (!agentsMap[t.name]) agentsMap[t.name] = [];
             agentsMap[t.name].push(uiAgent);
           }
        });
        setAgentsByTeam(agentsMap);

        // merge dbTeams into verticals
        const newVerts = verticals.map(v => {
           const vTeams = dbTeams.filter((t: any) => t.functional_vertical === v.name).map((t: any) => ({
              name: t.name,
              purpose: t.purpose,
              agents: agentsMap[t.name] || []
           }));
           return { ...v, teams: vTeams };
        });
        setVerticalsState(newVerts);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  const currentVerticals = verticalsState.length ? verticalsState : verticals;
 const [tab,setTab]=useState<"home"|"sahyogis"|"roi">("home"); const [view,setView]=useState<"verticals"|"teams"|"agents">("verticals"); const [vertical,setVertical]=useState(verticals[0]); /* will be updated if needed */ const [team,setTeam]=useState(verticals[0].teams[0]); const [prompt,setPrompt]=useState(""); const [answer,setAnswer]=useState("Ask about a project, a teammate’s context, or a continuity handover.");
 const [isAsking,setIsAsking]=useState(false); const [askError,setAskError]=useState<string|null>(null); const [sources,setSources]=useState<any[]>([]); const [confidence,setConfidence]=useState<number|null>(null); const [mode,setMode]=useState<string|null>(null);
 
 const [agentOps,setAgentOps]=useState<Record<string,Operation>>(()=>Object.fromEntries(currentVerticals.flatMap(v=>v.teams.flatMap(t=>t.agents.map(a=>[a.id,operations[a.name]])))));
 const [draft,setDraft]=useState<Draft|null>(null);
 const [salesTool,setSalesTool]=useState("");
 const [supportTool,setSupportTool]=useState("");
 const agentsFor=(t:Team)=>agentsByTeam[t.name]||[];
 const defaultOperation:Operation={now:"Waiting for a scheduled task",eta:"On standby",tools:["Slack"],schedule:["09:30 daily check-in","13:00 task review","17:30 handover summary"]};
 const openProfile=(agent:Agent)=>setDraft({agent:{...agent,skills:agent.skills||["Knowledge retrieval","Task drafting"],contextNote:agent.contextNote||"Approved team context, active responsibilities and prior outcomes."},operation:{...(agentOps[agent.id]||defaultOperation),tools:[...(agentOps[agent.id]?.tools||defaultOperation.tools),],schedule:[...(agentOps[agent.id]?.schedule||defaultOperation.schedule)]},isNew:false});
 const openAdd=()=>setDraft({agent:{name:"New Sahyogi",title:"Associate-AI",id:`AGT-${String(Date.now()).slice(-6)}`,skin:"#e0a175",hair:"#34251e",shirt:"#5e91bd",access:"Draft only",context:60,rating:"New",status:"Online",skills:["Knowledge retrieval"],contextNote:"No approved context captured yet."},operation:{...defaultOperation,tools:[...defaultOperation.tools],schedule:[...defaultOperation.schedule]},isNew:true});
 const saveDraft = async () => {
    if (!draft) return;
    try {
      const payload = {
        name: draft.agent.name,
        title: draft.agent.title,
        role: draft.agent.role || draft.agent.title,
        status: draft.agent.status,
        avatar_skin: draft.agent.skin,
        avatar_hair: draft.agent.hair,
        avatar_shirt: draft.agent.shirt,
        role_based_access: draft.agent.access,
        shared_memory_agent_ids: draft.agent.shared_memory_agent_ids || []
      };
      
      if (draft.isNew) {
        const t_res = await fetch("http://localhost:8000/api/teams");
        const t_data = await t_res.json();
        const t = (t_data.teams || []).find((x:any) => x.name === team.name);
        if (t) {
            await fetch("http://localhost:8000/api/agents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...payload, team_id: t.id })
            });
        }
      } else {
        await fetch(`http://localhost:8000/api/agents/${draft.agent.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }
      window.location.reload();
    } catch(e) {
      console.error(e);
    }
  };
 const removeAgent = async (id: string) => {    try {      await fetch(`http://localhost:8000/api/agents/${id}`, { method: "DELETE" });      window.location.reload();    } catch(e) {      console.error(e);    }  };
 const applyRoute=()=>{const p=new URLSearchParams(window.location.search);const nextTab=p.get("tab") as "home"|"sahyogis"|"roi"|null;const nextVertical=verticals.find(v=>v.short===p.get("vertical"))||verticals[0];const nextTeam=nextVertical.teams.find(t=>t.name===p.get("team"))||nextVertical.teams[0];setTab(nextTab||"home");setVertical(nextVertical);setTeam(nextTeam);setView((p.get("view") as "verticals"|"teams"|"agents")||"verticals")};
 useEffect(()=>{applyRoute();window.addEventListener("popstate",applyRoute);return()=>window.removeEventListener("popstate",applyRoute)},[]);
 const navigate=(nextTab:"home"|"sahyogis"|"roi",nextView:"verticals"|"teams"|"agents"="verticals",nextVertical=vertical,nextTeam=team)=>{setTab(nextTab);setView(nextView);setVertical(nextVertical);setTeam(nextTeam);const p=new URLSearchParams();if(nextTab!=="home")p.set("tab",nextTab);if(nextTab==="sahyogis"){p.set("view",nextView);p.set("vertical",nextVertical.short);if(nextView==="agents")p.set("team",nextTeam.name)}window.history.pushState({},"",p.toString()?`?${p}`:"/")};
 const openVertical=(v:Vertical)=>navigate("sahyogis","teams",v,v.teams[0]); const openTeam=(t:Team)=>navigate("sahyogis","agents",vertical,t);
 const askFastAPI = async () => {
    if (!prompt.trim()) return;
    setIsAsking(true); setAskError(null); setAnswer(""); setSources([]); setConfidence(null); setMode(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/ask`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: prompt, sahyogi_id: "raj" })
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setAnswer(data.answer || ""); setSources(data.sources || []); setConfidence(data.confidence ?? null); setMode(data.mode || null);
    } catch (err: any) {
      setAskError(err.message || "Failed to reach FastAPI.");
    } finally {
      setIsAsking(false);
    }
 };
 return <main className="shell"><aside className="sidebar"><div className="brand"><span className="brand-mark">S</span>SAHYOGI</div><div className="workspace"><span className="dot"/>Paytm Innovation Lab</div><nav><button className={tab==="home"?"active":""} onClick={()=>navigate("home")}>⌂ Home</button><button className={tab==="sahyogis"?"active":""} onClick={()=>navigate("sahyogis")}>◉ Sahyogis</button><button>↹ Continuity</button><button>✦ Collective</button><button className={tab==="roi"?"active":""} onClick={()=>navigate("roi")}>↗ ROI dashboard</button></nav><div className="sidebar-bottom"><div className="you"><span className="avatar small">RM</span><div><b>Raj Motwani</b><small>Product team</small></div></div></div></aside><section className="content"><header><div><p className="eyebrow">PAYTM INNOVATION LAB</p><h1>{tab==="sahyogis"?"Your Sahyogi organisation":tab==="roi"?"Business impact":"Good morning, Raj."}</h1></div><button className="new-button">+ Hire Sahyogi</button></header>
 {tab==="home"&&<><section className="hero"><div className="hero-copy"><span className="pill">✦ YOUR DIGITAL TEAMMATE</span><h2>Work never loses its <em>context.</em></h2><p>Capture what matters today, so your team can move confidently tomorrow.</p><div className="ask"><span>✦</span><input value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&askFastAPI()} placeholder="Ask your Sahyogi anything…" disabled={isAsking}/><button onClick={askFastAPI} disabled={isAsking}>↑</button></div>
 {isAsking && <p className="reply loading"><i className="agent-loader" style={{display:'inline-block'}}><b/><b/><b/></i> Searching knowledge...</p>}
 {askError && <p className="reply error" style={{color:'#d9534f'}}>⚠ {askError}</p>}
 {!isAsking && !askError && answer && (
   <div className="reply-card" style={{marginTop:'1.5rem', background:'rgba(255,255,255,0.05)', padding:'1rem', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.1)'}}>
     <p className="reply">{answer}</p>
     {sources.length > 0 && (
       <div className="reply-sources" style={{marginTop:'1rem'}}>
         <p className="eyebrow" style={{marginBottom:'0.5rem'}}>SOURCES</p>
         <div className="source-list" style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
           {sources.map((s, i) => (
             <span key={i} className="source-chip" style={{fontSize:'0.75rem', padding:'0.25rem 0.5rem', background:'rgba(255,255,255,0.1)', borderRadius:'4px'}}>📄 {typeof s === 'string' ? s : s.title || JSON.stringify(s)}</span>
           ))}
         </div>
       </div>
     )}
     {confidence !== null && <p className="reply-meta" style={{marginTop:'1rem', fontSize:'0.75rem', opacity:0.7}}>Confidence: {Math.round(confidence * 100)}% {mode ? `· Mode: ${mode}` : ''}</p>}
   </div>
 )}
 </div><div className="orb-wrap"><div className="orb glow-one"/><div className="orb glow-two"/><div className="orb-core">S</div></div></section><section className="metrics"><div><span>▣</span><p>Context captured</p><b>24 <small>items this week</small></b></div><div><span>↝</span><p>Active handovers</p><b>1 <small>needs attention</small></b></div><div><span>✦</span><p>Team readiness</p><b>91% <small>↑ 6% this month</small></b></div></section><section className="grid"><div className="panel"><p className="eyebrow">KNOWLEDGE CONTINUITY</p><h3>Meera is away next week</h3><p>Her Sahyogi has prepared a permissioned handover for Payments reliability, with two decisions awaiting review.</p><button className="primary">Review handover →</button></div><div className="panel"><p className="eyebrow">AGENTIC WORK</p><h3>12 tasks completed safely</h3><p>Every CRM update and follow-up has a KYA identity, confidence score and immutable audit record.</p><button className="secondary">Open audit trail →</button></div></section></>}
 {tab==="sahyogis"&&<section className="org-page"><div className="org-heading"><div><p className="eyebrow">PAYTM FUNCTIONAL AI WORKFORCE</p><h2>Teams that keep their context.</h2><p className="sub">Every Sahyogi has a role, individual identity, permission boundary, memory and feedback record.</p></div><div className="kya"><b>✓ KYA verified</b><span>Registered · scoped · auditable</span></div></div>{view!=="verticals"&&<div className="breadcrumbs"><button onClick={()=>navigate("sahyogis")}>All verticals</button><span>/</span><button onClick={()=>navigate("sahyogis","teams",vertical,team)}>{vertical.short}</button>{view==="agents"&&<><span>/</span><b>{team.name}</b></>}</div>}
 {view==="verticals"&&<div className="vertical-grid">{currentVerticals.map(v=><button className="vertical-card" onClick={()=>openVertical(v)} key={v.short}><span className={`vertical-icon ${v.tone}`}>{v.icon}</span><span><b>{v.name}</b><small>{v.description}</small><em>{v.teams.length} teams · {v.teams.reduce((n,t)=>n+t.agents.length,0)} Sahyogis</em></span><strong>→</strong></button>)}</div>}
 {view==="teams"&&<><div className={`division-banner ${vertical.tone}`}><span>{vertical.icon}</span><div><p>{vertical.short}</p><h2>{vertical.name}</h2><small>{vertical.description}</small></div></div><div className="agentic-heading"><div><p className="eyebrow">AGENTIC TEAMS</p><h3>Choose a team and inspect its live workforce.</h3></div><span>Role-scoped · permissioned · monitored</span></div><div className="team-grid">{vertical.teams.map(t=>{const agents=agentsFor(t);return <motion.button initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="team-card" onClick={()=>openTeam(t)} key={t.name}><div className="face-stack">{agents.slice(0,3).map(a=><Face agent={a} size={42} key={a.id}/>)}</div><h3>{t.name}</h3><p>{t.purpose}</p><small>{agents.length} agents · live work coverage {agents.length?Math.round(agents.reduce((n,a)=>n+a.context,0)/agents.length):0}%</small><span>View hierarchy →</span></motion.button>})}</div>{vertical.short==="Sales-AI"&&<SalesStudio active={salesTool} onChoose={setSalesTool}/>} {vertical.short==="Support-AI"&&<SupportStudio active={supportTool} onChoose={setSupportTool}/>}</>}
 {view==="agents"&&<><div className="team-top"><div><p className="eyebrow">{vertical.short} / TEAM DIRECTORY</p><h2>{team.name}</h2><p className="sub">{team.purpose}</p></div><button className="new-button" onClick={openAdd}>+ Add agent</button></div><div className="hierarchy-note">✦ <span><b>Live operations view</b> — every agent shows its active task, connected work platforms, ETA and upcoming schedule. Sensitive, low-confidence and irreversible actions always escalate.</span></div><div className="agent-list">{agentsFor(team).map((a,i)=>{const op=agentOps[a.id]||defaultOperation;return <motion.article initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.06}} className={`agent-card ${i?"reports":""}`} key={a.id}>{i>0&&<span className="connector"/>}<Face agent={a} size={86}/><div className="agent-main"><h3>{a.name} <span className="agent-status"><i className="live-dot"/> {a.status}<i className="agent-loader"><b/><b/><b/></i></span></h3><p>{a.title}</p><div className="agent-tags"><span>{a.id}</span><span>★ {a.rating} review score</span>{a.reports&&<span>Reports to {a.reports}</span>}</div><div className="live-task"><span><i className="live-dot"/> LIVE NOW</span><b>{op.now}</b><em>{op.eta}</em></div><div className="agent-tools">{op.tools.map(tool=><span key={tool}>◉ {tool}</span>)}</div></div><div className="schedule"><p>TODAY’S SCHEDULE</p>{op.schedule.map(item=><span key={item}>{item}</span>)}</div><div className="access"><p>ROLE-BASED ACCESS</p><b>{a.access}</b><small>Human approval required for sensitive actions.</small></div><div className="agent-actions"><button className="profile-button" onClick={()=>openProfile(a)}>View profile →</button><button className="remove-button" onClick={()=>removeAgent(a.id)}>Remove</button></div></motion.article>})}</div></>}</section>}
 {tab==="roi"&&<section className="org-page"><p className="eyebrow">LIVE ROI DASHBOARD</p><h2>Value created, with every action traceable.</h2><p className="sub">Demo metrics become live once task, outcome and feedback events are stored.</p><div className="roi-grid"><div><span>Autonomous tasks completed</span><b>1,284</b><small>↑ 18% this month</small></div><div><span>Human hours saved</span><b>214 h</b><small>Across 5 functional verticals</small></div><div><span>Actions escalated</span><b>7.2%</b><small>Low confidence or sensitive work</small></div></div></section>}</section>{draft&&<div className="modal-backdrop" onMouseDown={()=>setDraft(null)}><section className="agent-modal" onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><div><p className="eyebrow">{draft.isNew?"HIRE SAHYOGI":"AGENT PROFILE"}</p><h2>{draft.isNew?"Create a new agent":`Edit ${draft.agent.name}`}</h2></div><button onClick={()=>setDraft(null)}>×</button></div><div className="form-grid"><label>Name<input value={draft.agent.name} onChange={e=>setDraft({...draft,agent:{...draft.agent,name:e.target.value}})}/></label><label>Role / title<input value={draft.agent.title} onChange={e=>setDraft({...draft,agent:{...draft.agent,title:e.target.value}})}/></label><label>Agent ID<input value={draft.agent.id} disabled={!draft.isNew} onChange={e=>setDraft({...draft,agent:{...draft.agent,id:e.target.value}})}/></label><label>Status<select value={draft.agent.status} onChange={e=>setDraft({...draft,agent:{...draft.agent,status:e.target.value}})}><option>Online</option><option>Working</option><option>Away</option><option>On standby</option></select></label><label className="full">Role-based access<input value={draft.agent.access} onChange={e=>setDraft({...draft,agent:{...draft.agent,access:e.target.value}})}/></label><label className="full">Skills <small>comma separated</small><input value={(draft.agent.skills||[]).join(", ")} onChange={e=>setDraft({...draft,agent:{...draft.agent,skills:e.target.value.split(",").map(s=>s.trim())}})}/></label><label className="full">Share Context With <small>(Cmd/Ctrl+Click for multiple)</small><select multiple style={{minHeight:"100px", padding:"8px", background:"rgba(0,0,0,0.2)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"6px", color:"#fff"}} value={draft.agent.shared_memory_agent_ids || []} onChange={e=>setDraft({...draft,agent:{...draft.agent,shared_memory_agent_ids:Array.from(e.target.selectedOptions, option => option.value)}})}>{Object.values(agentsByTeam).flat().filter(a => a.id !== draft.agent.id).map(a => (<option key={a.id} value={a.id}>{a.name} ({a.title})</option>))}</select></label><label className="full">Approved context<textarea value={draft.agent.contextNote||""} onChange={e=>setDraft({...draft,agent:{...draft.agent,contextNote:e.target.value}})}/></label><label className="full">Current task<input value={draft.operation.now} onChange={e=>setDraft({...draft,operation:{...draft.operation,now:e.target.value}})}/></label><label>ETA<input value={draft.operation.eta} onChange={e=>setDraft({...draft,operation:{...draft.operation,eta:e.target.value}})}/></label><label>Connections <small>comma separated</small><input value={draft.operation.tools.join(", ")} onChange={e=>setDraft({...draft,operation:{...draft.operation,tools:e.target.value.split(",").map(s=>s.trim()).filter(Boolean)}})}/></label><label className="full">Today’s schedule <small>one task per line</small><textarea value={draft.operation.schedule.join("\n")} onChange={e=>setDraft({...draft,operation:{...draft.operation,schedule:e.target.value.split("\n").filter(Boolean)}})}/></label></div><div className="modal-actions"><button className="secondary" onClick={()=>setDraft(null)}>Cancel</button><button className="primary save-agent" onClick={saveDraft}>{draft.isNew?"Create Sahyogi":"Save changes"} →</button></div></section></div>}</main>
}
