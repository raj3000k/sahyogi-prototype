import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

# Replace the static verticals initialization with a state variable and fetch logic
# We need to add fetching logic inside Home.

# We'll inject a useEffect inside Home()
# Find `export default function Home(){`
start_idx = content.find('export default function Home(){')

injection = """
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
             reports: a.reports_to || undefined
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
"""

# Replace the agentsByTeam useState
content = content.replace('const [agentsByTeam,setAgentsByTeam]=useState<Record<string,Agent[]>>(()=>Object.fromEntries(verticals.flatMap(v=>v.teams.map(t=>[t.name,t.agents]))));', '')

# Insert the injection
content = content[:start_idx + len('export default function Home(){\n')] + injection + content[start_idx + len('export default function Home(){\n'):]

# Replace usages of `verticals` inside Home with `currentVerticals`, except where we map initial state
content = content.replace('const [vertical,setVertical]=useState(verticals[0]);', 'const [vertical,setVertical]=useState(verticals[0]); // will be updated if needed')
content = content.replace('verticals.map(v=>', 'currentVerticals.map(v=>')
content = content.replace('Object.fromEntries(verticals.flatMap', 'Object.fromEntries(currentVerticals.flatMap')

# Update saveDraft and removeAgent to hit API
save_draft = """
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
        role_based_access: draft.agent.access
      };
      
      if (draft.isNew) {
        // Need to find team_id for draft.agent.team (assuming team.name maps to team_id)
        // Hardcoding to current team id for simplicity since we don't have it in UI state easily
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
      // reload
      window.location.reload();
    } catch(e) {
      console.error(e);
    }
  };
"""

remove_agent = """
  const removeAgent = async (id: string) => {
    try {
      await fetch(`http://localhost:8000/api/agents/${id}`, { method: "DELETE" });
      window.location.reload();
    } catch(e) {
      console.error(e);
    }
  };
"""

content = re.sub(r'const saveDraft=.*?setDraft\(null\);\}', save_draft.strip().replace('\n', ''), content)
content = re.sub(r'const removeAgent=\(id:string\)=>\{.*?\}', remove_agent.strip().replace('\n', ''), content)

with open('app/page.tsx', 'w') as f:
    f.write(content)
