"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Playground() {
  const params = useParams();
  const [agent, setAgent] = useState<any>(null);
  const searchParams = useSearchParams();
  const vertical = searchParams.get("vertical") || "Sales-AI";

  useEffect(() => {
    if (!params?.id) return;
    fetch(`http://localhost:8000/api/agents`)
      .then(res => res.json())
      .then(data => {
        const found = data.agents.find((a: any) => a.id === params.id);
        setAgent(found);
      });
  }, [params?.id]);

  if (!agent) {
    return <div className="shell"><div className="pg-loading">Booting Agent Engine...</div></div>;
  }

  return (
    <main className="playground-shell">
      <header className="pg-header">
        <a href="/" className="pg-back">← Back to Command Center</a>
        <div className="pg-agent-info">
          <div className="pg-avatar" style={{backgroundColor: agent.avatar_shirt}}>{agent.name.charAt(0)}</div>
          <div>
            <h3>{agent.name} <span className="live-badge"><i className="live-dot" /> LIVE</span></h3>
            <p>{agent.title}</p>
          </div>
        </div>
        <div className="pg-metrics">
          <span><b>100%</b><br/>Autonomy</span>
        </div>
      </header>
      
      <div className="pg-workspace">
        {vertical === "Sales-AI" ? <SalesPlayground agent={agent} /> : <SupportPlayground agent={agent} />}
      </div>
    </main>
  );
}

function SalesPlayground({ agent }: { agent: any }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStage(s => (s < 5 ? s + 1 : 0));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const logs = [
    "Scanning assigned CRM leads for Q3.",
    "Found prospect: Acme Corp. Deal size: $15,000.",
    "Researching Acme Corp's recent product launch...",
    "Drafting personalized outbound email...",
    "Email drafted. Checking policy guardrails...",
    "Policy check passed (99% confidence). Sending email."
  ];

  return (
    <div className="pg-split">
      <div className="pg-panel">
        <div className="pg-panel-head">CRM / Lead Pipeline</div>
        <div className="pg-crm-card">
          <h4>Acme Corp</h4>
          <p>Contact: jane@acmecorp.com</p>
          <div className="pg-tags"><span className="pg-tag-blue">Enterprise</span><span className="pg-tag-green">$15,000</span></div>
          <div className="pg-pipeline">
            <div className={`pipe-step ${stage >= 0 ? 'active' : ''}`}>Prospecting</div>
            <div className={`pipe-step ${stage >= 2 ? 'active' : ''}`}>Researching</div>
            <div className={`pipe-step ${stage >= 4 ? 'active' : ''}`}>Outbound</div>
          </div>
        </div>
      </div>
      <div className="pg-panel">
        <div className="pg-panel-head">Live Communication Thread</div>
        <div className="pg-thought-log">
           <AnimatePresence>
             {logs.slice(0, stage + 1).map((log, i) => (
                <motion.div key={i} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="pg-thought">
                  <span className="pg-thought-icon">⚡</span> {log}
                </motion.div>
             ))}
           </AnimatePresence>
        </div>
        {stage >= 5 && (
          <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="pg-email">
            <p><b>To:</b> jane@acmecorp.com</p>
            <p><b>Subject:</b> POS Growth & Acme's new launch</p>
            <hr />
            <p>Hi Jane,</p>
            <p>I noticed Acme Corp just launched the new retail line. Our POS solution is perfectly designed for high-volume foot traffic...</p>
            <p>Best,<br/>{agent.name}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function SupportPlayground({ agent }: { agent: any }) {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIdx(s => (s < 4 ? s + 1 : 0));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const messages = [
    { sender: "Customer", text: "Where is my refund? It's been 5 days.", time: "10:41 AM" },
    { sender: "Agent", thought: "Analyzing intent... Customer asking about refund delay.", time: "10:41 AM" },
    { sender: "Agent", thought: "Customer tier is Platinum. Escalating priority. Checking payment gateway API...", time: "10:41 AM" },
    { sender: "Agent", thought: "Gateway shows refund processed, banking delay likely. Drafting response...", time: "10:42 AM" },
    { sender: "Agent", text: "Hi there! I've checked your account and your refund was prioritized and processed on our end 4 days ago. Bank transfers can take up to 7 business days. It should arrive by Friday!", time: "10:42 AM" }
  ];

  return (
    <div className="pg-split">
      <div className="pg-panel pg-sidebar">
        <div className="pg-panel-head">Active Ticket Queue</div>
        <div className="pg-ticket active">
          <b>#TKT-8992</b>
          <p>Refund delay inquiry</p>
          <span className="pg-tag-gold">Platinum Tier</span>
        </div>
        <div className="pg-ticket">
          <b>#TKT-8993</b>
          <p>Login issues</p>
          <span className="pg-tag-gray">Standard</span>
        </div>
      </div>
      <div className="pg-panel pg-chat-panel">
        <div className="pg-panel-head">Customer Resolution Chat</div>
        <div className="pg-chat">
          <AnimatePresence>
            {messages.slice(0, msgIdx + 1).map((m, i) => (
              <motion.div key={i} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className={`pg-bubble-wrap ${m.sender === "Agent" ? (m.thought ? "thought" : "agent") : "user"}`}>
                <div className="pg-bubble">
                  {m.thought && <small>🤖 Internal Thought:</small>}
                  {m.thought || m.text}
                </div>
                <div className="pg-time">{m.time}</div>
              </motion.div>
            ))}
          </AnimatePresence>
          {msgIdx < 4 && (
            <div className="pg-typing"><i className="agent-loader"><b/><b/><b/></i> {agent.name} is working...</div>
          )}
        </div>
      </div>
    </div>
  );
}
