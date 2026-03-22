import { useState, useRef, useEffect } from "react";
import type { CSSProperties, ReactNode, KeyboardEvent } from "react";

/* ─── types ─── */
interface Link { label: string; url: string; icon: string; }
interface Publication { authors: string; year: number; title: string; journal: string; details: string; url: string; }
interface ReviewItem { title: string; journal: string; }
interface WorkingPaper { title: string; role: string; }
interface Project { period: string; title: string; funder: string; bullets: string[]; }
interface ResearchBlock { role: string; color: string; dept: string; projects: Project[]; }
interface Conference { type: string; event: string; location: string; date: string; note: string; }
interface ExperienceItem { role: string; org: string; location: string; period: string; bullets: string[]; award: string; }
interface LeadershipItem { role: string; org: string; period: string; icon: string; }
interface Training { title: string; period: string; }
interface EducationItem { degree: string; school: string; location: string; year: string; }
interface TestItem { name: string; score: string; }

/* ─── REFINED COLOR PALETTE ─── */
/* Deep Forest Green + Crisp White + Sage + Mint */
const C: Record<string, string> = {
  // Base — deep forest green (replaces navy)
  navy:    "#0e3d2f",   // deep forest green
  navy2:   "#145c44",
  navy3:   "#1a7050",
  navyMid: "#1b6645",

  // Surface — pure crisp whites with faint green tint
  surface:     "#f4faf7",   // barely-there green white
  surfaceCard: "#ffffff",
  surfaceAlt:  "#eaf5ef",
  border:      "#d1e8dc",
  borderLight: "#e4f2eb",

  // Text — dark green-tinted ink
  ink:  "#0e2a1e",
  ink2: "#2d5243",
  muted:"#6b9980",

  // Primary accent — vivid emerald
  amber:     "#0d9e72",   // renamed for code reuse; this is now emerald
  amberBold: "#0a7d5a",
  amberDim:  "rgba(13,158,114,0.10)",
  amberGlow: "rgba(13,158,114,0.18)",

  // Secondary accent — sage / mid green
  teal:     "#2e8b6b",
  tealLight:"#38a882",
  tealDim:  "rgba(46,139,107,0.10)",
  tealGlow: "rgba(46,139,107,0.18)",

  // Tertiary — muted slate-green for "under review"
  terra:    "#4a7c6a",
  terraDim: "rgba(74,124,106,0.12)",

  // Gold for awards — warm contrast pop
  gold:    "#b08c1a",
  goldDim: "rgba(176,140,26,0.10)",

  // Gradient helpers
  heroGrad: "linear-gradient(135deg,#e8f5ef 0%,#d4ede0 50%,#e0f5ea 100%)",
  cardGrad: "linear-gradient(135deg,#f4faf7,#ffffff)",
};

const NAV = ["About","Education","Research","Publications","Conferences","Experience","Skills"];

/* ─── initial data ─── */
const INIT_PERSON = {
  name:"Tanmay Datta", title:"Agricultural Economist",
  institution:"Sher-e-Bangla Agricultural University", location:"Dhaka-1207, Bangladesh",
  email:"tanmaydatta67@gmail.com", phone:"(+880) 1758279651",
  about:`Agricultural Economics researcher with a deep interest in Development Economics — specifically how economic and policy factors shape household welfare, rural livelihoods, and food and nutrition security in developing-country contexts. I gravitate toward research that connects real-world development challenges with rigorous empirical evidence: improving agricultural productivity, strengthening resilience to climate shocks, and designing policies that reduce vulnerability and inequality.`,
  interests:["Development Economics","Agricultural Productivity","Climate Resilience","Food & Nutrition Security","Household Welfare","Econometrics","Machine Learning in Agriculture"],
  links:[
    {label:"LinkedIn",url:"https://linkedin.com/in/tanmay-datta-a7a23719b",icon:"in"},
    {label:"Google Scholar",url:"https://scholar.google.com/citations?user=fNbF88wAAAAJ&hl=en",icon:"gs"},
    {label:"ResearchGate",url:"https://www.researchgate.net/profile/Tanmay-Datta-3",icon:"rg"},
    {label:"ORCID",url:"https://orcid.org/0009-0000-5548-4426",icon:"or"},
  ] as Link[],
};

const INIT_PUBLICATIONS: Publication[] = [
  {authors:"Sarker, M.M.R., Aleen, M.J. & Datta, T.",year:2025,title:"Productivity of Food and Self-Sufficiency in Rice Production in Bangladesh",journal:"Economics",details:"12(3), pp. 214–226",url:"https://www.davidpublisher.com/index.php/Home/Article/index?id=52177.html"},
  {authors:"Sarker, M.M.R., Aleen, M.J. & Datta, T.",year:2025,title:"Agricultural Transformation and Its Contribution to Economic Development in South Asian and African Countries",journal:"Asian Journal of Advances in Agricultural Research",details:"25(1), pp. 19–31",url:"https://journalajaar.com/index.php/AJAAR/article/view/577"},
];

const INIT_UNDER_REVIEW: ReviewItem[] = [
  {title:"Determinants of Climate-Smart Agriculture (CSA) in Mushroom Farming: Dual Application of Bayesian and Machine Learning Approach",journal:"Scientific Reports"},
  {title:"Multilevel Model Assessing Women's ICT Adoption in Bangladesh",journal:"Social Sciences & Humanities"},
  {title:"Evaluating Machine Learning Models for Intimate Partner Violence Detection in Bangladesh",journal:"Sociology"},
  {title:"The Impact of Climate Change and Renewable Energy on Agricultural Productivity in Bangladesh: An Empirical Assessment Using ARDL Approach",journal:"Discover Sustainability"},
];

const INIT_WORKING_PAPERS: WorkingPaper[] = [
  {title:"Pathways from Household Food Insecurity and Undernutrition to Under-Five Mortality: Systematic Evidence from Asian Countries",role:"First Author"},
  {title:"Child Education in Indigenous Communities: Barriers, Enablers and Policy Responses Across South Asian Countries",role:"First Author"},
  {title:"Climate-Smart Agriculture and Household Well-Being: Food Security, Poverty and Resilience Outcomes in Asia and Africa",role:"First Author"},
  {title:"Crop Insurance: Why Are Farmers Reluctant to Adopt Crop Insurance Over Traditional Risk Management Strategies?",role:"Co-Author"},
  {title:"The U.S. Withdrawal from the Paris Agreement: Implications for Global Climate Finance and Carbon Emission Space",role:"Co-Author"},
  {title:"The Role of Women's Asset Ownership in Child Health and Nutrition",role:"Co-Author"},
  {title:"Household Food Security, Determinants and Coping Strategies Among Smallholder Farmers in Riverbank and Haor Areas of Bangladesh",role:"Co-Author"},
  {title:"Data-Driven IoT Applications in Livestock Farming: Evolution, Adoption, and Economic Impact",role:"Co-Author"},
  {title:"Transboundary Animal Diseases and Their Economic Impact on Smallholder Livestock Systems",role:"Co-Author"},
];

const INIT_RESEARCH: ResearchBlock[] = [
  {
    role:"Research Associate", color:C.teal,
    dept:"Dept. of Agricultural Statistics, Faculty of Agribusiness Management, SAU",
    projects:[
      {period:"Sep–Nov 2024",title:"2024 Bangladesh Shrimp Survey",funder:"ADB Institute / University of Tokyo",bullets:["Primary data collection from shrimp-farming households and stakeholders","Structured data entry and dataset cleaning for subsequent analysis","Fieldwork coordination under Prof. Dr. Md. Mizanur Rahman Sarker"]},
      {period:"Jul 2024–Jan 2025",title:"Impact of CSA Technologies on Food Security in Haor Area, Sunamganj",funder:"SAURES",bullets:["Farm-level data collection on CSA technologies and household food security","Research report writing and final project documentation"]},
      {period:"Jan–Jun 2023",title:"Validation and Adoption of CSTs for Shrimp Farming in Coastal Ecosystems",funder:"Ministry of Science & Technology, Bangladesh",bullets:["Field implementation and data collection in coastal shrimp-farming areas","Prepared summary documents for ministry submission"]},
    ],
  },
  {
    role:"Research Assistant", color:C.amber,
    dept:"Dept. of Agricultural Statistics, Faculty of Agribusiness Management, SAU",
    projects:[
      {period:"Jun 2023–Jun 2024",title:"Impact of CSA in Mushroom Farming: Classical & Machine Learning Approaches",funder:"SAURES",bullets:["Data entry, cleaning and organisation for farm-level survey data","Contributed to manuscript preparation and report writing"]},
      {period:"Apr 2023–Jun 2024",title:"ML Algorithms to Predict Depression & Suicidal Behaviours Among University Students",funder:"University Grants Commission (UGC), Bangladesh",bullets:["Data entry, coding and statistical/ML analysis using R and SPSS","Drafted analytical sections of project reports and manuscripts"]},
      {period:"Jun 2023–Jun 2024",title:"Impact of CSA in Rice Farming in Coastal Ecosystems",funder:"Ministry of Science & Technology, Bangladesh",bullets:["Data entry and database management for coastal rice-farming surveys"]},
      {period:"Dec 2022–Jun 2023",title:"KAP Toward Environmental Education: Secondary-Level Students in Bangladesh",funder:"Ministry of Science & Technology, Bangladesh",bullets:["Data entry, cleaning and preliminary statistical analysis","Assisted in preparing research reports and presentations"]},
    ],
  },
];

const INIT_CONFERENCES: Conference[] = [
  {type:"Oral Presentation",event:"CUKUROVA 16th International Scientific Research Conference",location:"Adana, Türkiye (Online)",date:"Nov 2025",note:"Household food security & climate change adaptation in haor and riverbank areas of Bangladesh"},
  {type:"Poster Presentation",event:"7th International Scientific Conference on Food Safety and Health (ISCFSH)",location:"Bangladesh",date:"May 2025",note:"Organised by Bangladesh Society for Safe Food (BSSF)"},
  {type:"Abstract Accepted",event:"6th International Conference on Agriculture, Food Security and Safety 2025 (Hybrid)",location:"Kuala Lumpur, Malaysia",date:"Aug 2025",note:""},
  {type:"Abstract Accepted",event:"International Conference on Smart Agriculture, Environment and Global Warming (SAEGW-2025)",location:"Daegu, South Korea (Hybrid)",date:"May 2025",note:"International Society for Research (ISR)"},
];

const INIT_EXPERIENCE: ExperienceItem[] = [{
  role:"Junior Executive — Communication & Public Relations",
  org:"Greeniculture Agrotech Limited",location:"Dhaka, Bangladesh",
  period:"May 2021 – March 2023",
  bullets:["Supported corporate communication and public relations activities","Prepared notices, content, and stakeholder communications","Coordinated with internal teams to maintain professional relationships"],
  award:"Best Employee of the Month — September 2021",
}];

const INIT_LEADERSHIP: LeadershipItem[] = [
  {role:"Club Development Adviser",org:"ICT & Career Development Club, SAU",period:"Feb 2025 – Present",icon:"🏛"},
  {role:"President",org:"BADHAN Voluntary Blood Donors' Organisation, SAU Unit",period:"Jan 2023 – Dec 2023",icon:"🩸"},
  {role:"Secretary",org:"Rotaract Club of Dhaka Mid City Green",period:"Jul 2023 – Jun 2024",icon:"🔄"},
  {role:"Zonal Secretary, Zone 3A",org:"Rotaract District Organisation 3281, Bangladesh",period:"May 2023 – May 2024",icon:"🌐"},
  {role:"Vice-President",org:"Entrepreneurship Development Club, SAU",period:"May 2023 – Feb 2025",icon:"💡"},
  {role:"Head of Event Management",org:"Hult Prize at SAU",period:"Aug 2020 – Jul 2021",icon:"🏆"},
];

const INIT_SKILLS: string[] = ["R (R Programming)","Stata","SPSS","MS Word / Excel / PowerPoint"];
const INIT_COMPETENCIES: string[] = ["Econometric Analysis","Survey Design","Data Cleaning","Academic Writing","Policy Writing","Machine Learning","R Programming","SPSS Modelling"];
const INIT_TRAININGS: Training[] = [
  {title:"Agri-Science Leadership Development Training (Virtual)",period:"Nov–Dec 2020"},
  {title:"SPSS Training for Agricultural Experiments and Research",period:"Nov 2024 – Jan 2025"},
  {title:"Training on Data Analysis (R and SPSS)",period:"May 7–8, 2025"},
];

const INIT_EDUCATION: EducationItem[] = [
  { degree: "B.Sc. (Hons.) in Agricultural Economics", school: "Sher-e-Bangla Agricultural University", location: "Dhaka 1207, Bangladesh",  year: "Passing year: 2022; Result Published: 2024" },
  { degree: "Higher Secondary Certificate (HSC), Science", school: "Notre Dame College", location: "Dhaka, Bangladesh", year: "Passing year: 2017" },
  { degree: "Secondary School Certificate (SSC), Science", school: "Comilla Zilla School", location: "Cumilla, Bangladesh",  year: "Passing year: 2015" },
];

const INIT_TESTS: TestItem[] = [
  { name: "GRE General Test", score: "" },
  { name: "IELTS", score: "" },
];

/* ─── editable text component ─── */
function EditableText({ value, onChange, tag: Tag = "span", style, editMode, multiline, placeholder }: {
  value: string; onChange: (v: string) => void; tag?: any; style?: CSSProperties; editMode: boolean; multiline?: boolean; placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing && ref.current) ref.current.focus(); }, [editing]);

  if (editing && editMode) {
    const sharedStyle: CSSProperties = {
      ...style, background: C.amberDim, border: `1.5px solid ${C.amber}`,
      borderRadius: 6, padding: "4px 8px", width: "100%", boxSizing: "border-box" as const,
      color: C.ink, fontFamily: "inherit", fontSize: "inherit", fontWeight: "inherit",
      outline: "none", resize: multiline ? "vertical" as const : "none" as const,
    };
    const save = () => { onChange(draft); setEditing(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Enter" && !multiline) save(); if (e.key === "Escape") { setDraft(value); setEditing(false); } };
    return multiline
      ? <textarea ref={ref as any} value={draft} onChange={e => setDraft(e.target.value)} onBlur={save} onKeyDown={onKey} style={{ ...sharedStyle, minHeight: 80 }} />
      : <input ref={ref as any} value={draft} onChange={e => setDraft(e.target.value)} onBlur={save} onKeyDown={onKey} style={sharedStyle} />;
  }

  return (
    <Tag
      style={{ ...style, cursor: editMode ? "pointer" : "default", borderBottom: editMode ? `1px dashed ${C.amber}60` : "none", transition: "border-color 0.2s" }}
      onClick={() => editMode && setEditing(true)}
      title={editMode ? "Click to edit" : undefined}
    >
      {value || placeholder || "Click to edit"}
    </Tag>
  );
}

/* ─── section heading ─── */
function SecHead({ children, id }: { children: ReactNode; id: string }) {
  return (
    <div id={id} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 30, scrollMarginTop: 80 }}>
      <div style={{ width: 3, height: 30, background: `linear-gradient(180deg,${C.amber},${C.teal})`, borderRadius: 2, flexShrink: 0 }} />
      <h2 style={{ fontFamily: "'Roboto', sans-serif", fontSize: 22, fontWeight: 800, color: C.navy, margin: 0, letterSpacing: "-0.01em" }}>{children}</h2>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${C.border},transparent)` }} />
    </div>
  );
}

function Hr() { return <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${C.border},transparent)`, margin: "3.2rem 0" }} />; }

/* ─── tag ─── */
function Tag({ children, color = C.teal, bg = C.tealDim }: { children: ReactNode; color?: string; bg?: string }) {
  return <span style={{ display: "inline-block", padding: "4px 13px", borderRadius: 4, fontSize: 12, fontWeight: 600, color, background: bg, margin: "3px 3px 3px 0", fontFamily: "'Roboto', sans-serif", letterSpacing: "0.02em", border: `1px solid ${color}25` }}>{children}</span>;
}

/* ═══════════════════════════════════════════ */
export default function Portfolio() {
  const [active, setActive] = useState("about");
  const [editMode, setEditMode] = useState(false);

  const [person, setPerson] = useState(INIT_PERSON);
  const [publications, setPublications] = useState(INIT_PUBLICATIONS);
  const [underReview, setUnderReview] = useState(INIT_UNDER_REVIEW);
  const [workingPapers, setWorkingPapers] = useState(INIT_WORKING_PAPERS);
  const [research, setResearch] = useState(INIT_RESEARCH);
  const [conferences, setConferences] = useState(INIT_CONFERENCES);
  const [experience, setExperience] = useState(INIT_EXPERIENCE);
  const [leadership, setLeadership] = useState(INIT_LEADERSHIP);
  const [skills, setSkills] = useState(INIT_SKILLS);
  const [competencies, setCompetencies] = useState(INIT_COMPETENCIES);
  const [trainings, setTrainings] = useState(INIT_TRAININGS);
  const [education, setEducation] = useState(INIT_EDUCATION);
  const [tests, setTests] = useState(INIT_TESTS);

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: "-30% 0px -65% 0px" }
    );
    NAV.forEach(n => { const el = document.getElementById(n.toLowerCase()); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const [openProj, setOpenProj] = useState<Record<string, boolean>>({});
  const [pubTab, setPubTab] = useState("published");

  const updatePerson = (key: string, val: any) => setPerson(p => ({ ...p, [key]: val }));

  const cardStyle: CSSProperties = {
    background: C.surfaceCard,
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    padding: "22px 26px",
    transition: "all 0.25s ease",
    boxShadow: "0 1px 2px rgba(13,27,42,0.04), 0 4px 16px rgba(13,27,42,0.06)",
  };

  return (
    <div style={{ fontFamily: "'Roboto', sans-serif", background: C.surface, minHeight: "100vh", color: C.ink }}>

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap');
        * { box-sizing: border-box; }
        a:hover { opacity: 0.82; }
        button { font-family: 'Roboto', sans-serif; } * { font-family: 'Roboto', sans-serif; }
      `}</style>

      {/* ═══ TOP BAR ═══ */}
      <header style={{
        position: "sticky", top: 0, zIndex: 300,
        background: "rgba(247,244,239,0.88)", backdropFilter: "blur(20px) saturate(160%)",
        borderBottom: `1px solid ${C.border}`, height: 62,
        display: "flex", alignItems: "center", padding: "0 2.5rem", justifyContent: "space-between", gap: "1rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: C.navy,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 13, color: C.amber, flexShrink: 0,
            fontFamily: "'Roboto', sans-serif", letterSpacing: "0.03em",
          }}>TD</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, lineHeight: 1.2, fontFamily: "'Roboto', sans-serif" }}>Tanmay Datta</div>
            <div style={{ fontSize: 10.5, color: C.muted, lineHeight: 1, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>Agricultural Economist</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {NAV.map(n => (
            <button key={n} onClick={() => scrollTo(n.toLowerCase())} style={{
              padding: "6px 14px", borderRadius: 6, fontSize: 12.5, border: "none", cursor: "pointer",
              background: active === n.toLowerCase() ? C.navy : "transparent",
              color: active === n.toLowerCase() ? C.amber : C.muted,
              fontWeight: active === n.toLowerCase() ? 600 : 400,
              transition: "all 0.18s",
            }}>{n}</button>
          ))}
          <button onClick={() => setEditMode(!editMode)} style={{
            marginLeft: 10, padding: "7px 16px", borderRadius: 6, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
            border: editMode ? `1.5px solid ${C.amber}` : `1.5px solid ${C.border}`,
            background: editMode ? C.amberDim : "transparent",
            color: editMode ? C.amber : C.muted,
            transition: "all 0.2s",
          }}>
            {editMode ? "✏️ Editing" : "✏️ Edit"}
          </button>
        </div>
      </header>

      {/* ═══ HERO ═══ */}
      <div style={{
        background: C.heroGrad,
        padding: "5rem 2.5rem 4.5rem",
        position: "relative", overflow: "hidden",
      }}>
        {/* decorative geometric accents */}
        <div style={{ position: "absolute", right: -60, top: -60, width: 320, height: 320, borderRadius: "50%", border: `1px solid rgba(200,133,26,0.15)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 20, top: 20, width: 200, height: 200, borderRadius: "50%", border: `1px solid rgba(26,127,114,0.15)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "35%", bottom: -120, width: 360, height: 360, borderRadius: "50%", background: `radial-gradient(circle,rgba(13,158,114,0.12),transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: -80, top: "20%", width: 280, height: 280, borderRadius: "50%", background: `radial-gradient(circle,rgba(13,158,114,0.08),transparent 70%)`, pointerEvents: "none" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: "3rem", position: "relative", zIndex: 1, flexWrap: "wrap" }}>
          {/* Avatar */}
          <div style={{
            width: 96, height: 96, borderRadius: 16,
            background: "rgba(13,158,114,0.12)",
            border: `2px solid rgba(13,158,114,0.30)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 700, color: C.navy, flexShrink: 0,
            fontFamily: "'Roboto', sans-serif",
          }}>TD</div>

          <div style={{ flex: 1, minWidth: 260 }}>
            {/* Name */}
            <EditableText editMode={editMode} value={person.name} onChange={v => updatePerson("name", v)}
              tag="h1" style={{
                fontFamily: "'Roboto', sans-serif",
                fontSize: "clamp(2rem,4.5vw,2.75rem)",
                fontWeight: 900, color: C.navy, margin: "0 0 8px",
                letterSpacing: "-0.02em", display: "block", lineHeight: 1.15,
              }} />
            {/* Title */}
            <EditableText editMode={editMode} value={`${person.title} · Development Researcher`} onChange={v => updatePerson("title", v.split(" · ")[0])}
              tag="div" style={{ fontSize: 15, color: C.teal, fontWeight: 500, marginBottom: 5, fontFamily: "'Roboto', sans-serif" }} />
            {/* Institution */}
            <EditableText editMode={editMode} value={`${person.institution}, ${person.location}`} onChange={v => {
              const parts = v.split(","); updatePerson("institution", parts[0]?.trim() || ""); updatePerson("location", parts.slice(1).join(",").trim() || "");
            }} tag="div" style={{ fontSize: 12.5, color: C.ink2, marginBottom: 24, letterSpacing: "0.02em" }} />

            {/* Links */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <a href={`mailto:${person.email}`} style={{
                padding: "8px 18px", borderRadius: 6,
                border: `1px solid ${C.amber}50`,
                color: C.navy, fontSize: 12.5, textDecoration: "none",
                background: "rgba(13,158,114,0.12)", fontWeight: 600, letterSpacing: "0.01em",
              }}>{person.email}</a>
              {person.links.map(l => (
                <a key={l.label} href={l.url} target="_blank" rel="noreferrer" style={{
                  padding: "8px 18px", borderRadius: 6,
                  border: `1px solid ${C.border}`,
                  color: C.ink2, fontSize: 12.5, textDecoration: "none",
                  background: "rgba(255,255,255,0.60)", transition: "all 0.2s",
                }}>{l.label}</a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "3.5rem 2.5rem 5rem" }}>

        {/* ─── ABOUT ─── */}
        <SecHead id="about">About</SecHead>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12, marginBottom: 30 }}>
          {[
            [String(publications.length), "Publications", C.teal, C.tealDim],
            [String(underReview.length), "Under Review", C.terra, C.terraDim],
            [String(workingPapers.length), "Working Papers", C.amber, C.amberDim],
            [String(conferences.length), "Conferences", C.navy, "rgba(13,27,42,0.07)"],
          ].map(([n, l, col, bg]) => (
            <div key={l} style={{ background: bg, border: `1px solid ${col}25`, borderRadius: 12, textAlign: "center", padding: "20px 14px" }}>
              <div style={{ fontSize: 34, fontWeight: 900, color: col, lineHeight: 1, fontFamily: "'Roboto', sans-serif" }}>{n}</div>
              <div style={{ fontSize: 10.5, color: C.muted, marginTop: 7, letterSpacing: "0.07em", textTransform: "uppercase", lineHeight: 1.3, fontWeight: 600 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* About paragraph */}
        <EditableText editMode={editMode} value={person.about} onChange={v => updatePerson("about", v)} multiline
          tag="p" style={{ fontFamily: "'Roboto', sans-serif", fontSize: 15.5, lineHeight: 1.9, color: C.ink, margin: "0 0 26px", display: "block", fontWeight: 400 }} />

        {/* Research interests */}
        <div style={{ marginBottom: 26 }}>
          <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, fontWeight: 700 }}>Research Interests</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {person.interests.map((t, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                {editMode ? (
                  <input value={t} onChange={e => { const ni = [...person.interests]; ni[i] = e.target.value; updatePerson("interests", ni); }}
                    style={{ background: C.tealDim, border: `1px solid ${C.teal}50`, borderRadius: 4, padding: "4px 12px", fontSize: 12, fontWeight: 600, color: C.teal, outline: "none", fontFamily: "'Roboto', sans-serif", width: Math.max(80, t.length * 8) }}
                  />
                ) : <Tag>{t}</Tag>}
                {editMode && <button onClick={() => updatePerson("interests", person.interests.filter((_: string, j: number) => j !== i))} style={{ background: "none", border: "none", color: C.terra, cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>}
              </span>
            ))}
            {editMode && <button onClick={() => updatePerson("interests", [...person.interests, "New Interest"])} style={{ background: C.tealDim, border: `1px dashed ${C.teal}`, borderRadius: 4, padding: "4px 14px", fontSize: 12, color: C.teal, cursor: "pointer", fontWeight: 600 }}>+ Add</button>}
          </div>
        </div>

        {/* ─── EDUCATION ─── */}
        <SecHead id="education">Education</SecHead>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 30 }}>
          {education.map((edu, i) => (
            <div key={i} style={{ ...cardStyle, borderLeft: `4px solid ${i === 0 ? C.navy : i === 1 ? C.teal : C.amber}`, position: "relative" }}>
              {editMode && <button onClick={() => setEducation(education.filter((_, j) => j !== i))} style={{ position: "absolute", top: 8, right: 8, background: C.terraDim, border: `1px solid ${C.terra}40`, borderRadius: 6, color: C.terra, cursor: "pointer", fontSize: 12, padding: "3px 8px", fontWeight: 700 }}>×</button>}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <EditableText editMode={editMode} value={edu.degree} onChange={v => { const ne = [...education]; ne[i].degree = v; setEducation(ne); }}
                    tag="div" style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 4 }} />
                  <EditableText editMode={editMode} value={edu.school} onChange={v => { const ne = [...education]; ne[i].school = v; setEducation(ne); }}
                    tag="div" style={{ fontSize: 14, fontWeight: 600, color: C.teal, marginBottom: 2 }} />
                  <EditableText editMode={editMode} value={edu.location} onChange={v => { const ne = [...education]; ne[i].location = v; setEducation(ne); }}
                    tag="div" style={{ fontSize: 13, color: C.muted, marginBottom: 8 }} />
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, color: C.muted }}>{edu.year}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {editMode && <button onClick={() => setEducation([...education, { degree: "Degree Name", school: "University", location: "Location",  year: "Year" }])} style={{ background: C.tealDim, border: `2px dashed ${C.teal}40`, borderRadius: 12, padding: "16px", fontSize: 14, color: C.teal, cursor: "pointer", fontWeight: 700, textAlign: "center" }}>+ Add Education</button>}
        </div>
'['
        {/* ─── STANDARDIZED TESTS ─── */}
        <div style={{ marginBottom: 34 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div style={{ width: 3, height: 24, background: `linear-gradient(180deg,${C.amber},${C.teal})`, borderRadius: 2 }} />
            <h3 style={{ fontSize: 18, fontWeight: 800, color: C.navy, margin: 0 }}>Standardized Test</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
            {tests.map((t, i) => (
              <div key={i} style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", position: "relative" }}>
                {editMode && <button onClick={() => setTests(tests.filter((_, j) => j !== i))} style={{ position: "absolute", top: -8, right: -8, background: C.terra, color: "white", borderRadius: "50%", width: 20, height: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>}
                <div>
                  <EditableText editMode={editMode} value={t.name} onChange={v => { const nt = [...tests]; nt[i].name = v; setTests(nt); }}
                    tag="div" style={{ fontSize: 14, fontWeight: 700, color: C.navy }} />
                  {t.score && <EditableText editMode={editMode} value={t.score} onChange={v => { const nt = [...tests]; nt[i].score = v; setTests(nt); }}
                    tag="div" style={{ fontSize: 13, color: C.teal, marginTop: 2 }} />}
                </div>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: C.amberDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📝</div>
              </div>
            ))}
            {editMode && <button onClick={() => setTests([...tests, { name: "Test Name", score: "" }])} style={{ background: C.amberDim, border: `2px dashed ${C.amber}40`, borderRadius: 12, padding: "16px", fontSize: 14, color: C.amber, cursor: "pointer", fontWeight: 700, textAlign: "center" }}>+ Add Test</button>}
          </div>
        </div>

        <Hr />
       <div style={{ marginBottom: 26}}>
         <div style={{ display: "flex", gap: 3, marginBottom: 26, background: C.borderLight, padding: 5, borderRadius: 10, width: "fit-content" }}>
          {([["published", "Published", String(publications.length), C.teal], ["review", "Under Review", String(underReview.length), C.terra], ["working", "Working Papers", String(workingPapers.length), C.amber]] as [string, string, string, string][]).map(([k, v, count, col]) => (
            <button key={k} onClick={() => setPubTab(k)} style={{
              padding: "8px 16px", borderRadius: 7, fontSize: 12.5, cursor: "pointer", border: "none",
              background: pubTab === k ? C.surfaceCard : "transparent",
              color: pubTab === k ? col : C.muted,
              fontWeight: pubTab === k ? 700 : 400,
              boxShadow: pubTab === k ? "0 2px 8px rgba(13,27,42,0.08)" : "none",
              transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              {v}
              <span style={{ background: pubTab === k ? col + "18" : "transparent", color: pubTab === k ? col : C.muted, padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700 }}>{count}</span>
            </button>
          ))}
        </div>

        {pubTab === "published" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {publications.map((p, i) => (
              <div key={i} style={{ ...cardStyle, position: "relative", overflow: "hidden", borderLeft: `3px solid ${C.teal}` }}>
                {editMode && <button onClick={() => setPublications(publications.filter((_, j) => j !== i))} style={{ position: "absolute", top: 8, right: 8, background: C.terraDim, border: `1px solid ${C.terra}40`, borderRadius: 6, color: C.terra, cursor: "pointer", fontSize: 12, padding: "3px 8px", fontWeight: 700, zIndex: 2 }}>×</button>}
                {/* Year badge */}
                <div style={{ position: "absolute", top: 0, right: editMode ? 48 : 0, background: C.navy, color: C.amber, fontSize: 11, fontWeight: 800, padding: "5px 16px", borderRadius: "0 12px 0 10px", letterSpacing: "0.05em" }}>{p.year}</div>
                <EditableText editMode={editMode} value={p.title} onChange={v => { const np = [...publications]; np[i] = { ...np[i], title: v }; setPublications(np); }}
                  tag="div" style={{ fontFamily: "'Roboto', sans-serif", fontSize: 15.5, fontWeight: 600, color: C.navy, lineHeight: 1.55, marginBottom: 8, paddingRight: 56 }} />
                <EditableText editMode={editMode} value={p.authors} onChange={v => { const np = [...publications]; np[i] = { ...np[i], authors: v }; setPublications(np); }}
                  tag="div" style={{ fontSize: 12.5, color: C.ink2, marginBottom: 14 }} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <span style={{ fontWeight: 700, color: C.teal, fontSize: 13 }}>{p.journal}</span>
                    <span style={{ fontSize: 13, color: C.muted }}> — {p.details}</span>
                  </div>
                  <a href={p.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: C.amber, border: `1px solid ${C.amber}40`, padding: "6px 16px", borderRadius: 6, textDecoration: "none", fontWeight: 700, background: C.amberDim, whiteSpace: "nowrap" }}>View Article →</a>
                </div>
              </div>
            ))}
            {editMode && <button onClick={() => setPublications([...publications, { authors: "Author Name", year: new Date().getFullYear(), title: "New Publication Title", journal: "Journal Name", details: "Volume, Pages", url: "#" }])} style={{ background: C.tealDim, border: `2px dashed ${C.teal}40`, borderRadius: 12, padding: "18px", fontSize: 14, color: C.teal, cursor: "pointer", fontWeight: 700, textAlign: "center" as const }}>+ Add Publication</button>}
          </div>
        )}

        {pubTab === "review" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {underReview.map((p, i) => (
              <div key={i} style={{ ...cardStyle, borderLeft: `3px solid ${C.terra}`, position: "relative" }}>
                {editMode && <button onClick={() => setUnderReview(underReview.filter((_, j) => j !== i))} style={{ position: "absolute", top: 8, right: 8, background: C.terraDim, border: `1px solid ${C.terra}40`, borderRadius: 6, color: C.terra, cursor: "pointer", fontSize: 12, padding: "3px 8px", fontWeight: 700 }}>×</button>}
                <span style={{ fontSize: 10.5, fontWeight: 700, background: C.terraDim, color: C.terra, padding: "3px 10px", borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Under Review</span>
                <EditableText editMode={editMode} value={p.title} onChange={v => { const nr = [...underReview]; nr[i] = { ...nr[i], title: v }; setUnderReview(nr); }}
                  tag="div" style={{ fontFamily: "'Roboto', sans-serif", fontSize: 14.5, fontWeight: 500, color: C.navy, lineHeight: 1.65, marginTop: 10, marginBottom: 6 }} />
                <EditableText editMode={editMode} value={p.journal} onChange={v => { const nr = [...underReview]; nr[i] = { ...nr[i], journal: v }; setUnderReview(nr); }}
                  tag="div" style={{ fontSize: 12, color: C.teal, fontWeight: 700 }} />
              </div>
            ))}
            {editMode && <button onClick={() => setUnderReview([...underReview, { title: "New Paper Title", journal: "Journal Name" }])} style={{ background: C.terraDim, border: `2px dashed ${C.terra}40`, borderRadius: 12, padding: "18px", fontSize: 14, color: C.terra, cursor: "pointer", fontWeight: 700, textAlign: "center" as const }}>+ Add Under Review Paper</button>}
          </div>
        )}

        {pubTab === "working" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {workingPapers.map((p, i) => (
              <div key={i} style={{ ...cardStyle, display: "flex", gap: 14, alignItems: "flex-start", position: "relative" }}>
                {editMode && <button onClick={() => setWorkingPapers(workingPapers.filter((_, j) => j !== i))} style={{ position: "absolute", top: 8, right: 8, background: C.terraDim, border: `1px solid ${C.terra}40`, borderRadius: 6, color: C.terra, cursor: "pointer", fontSize: 12, padding: "3px 8px", fontWeight: 700 }}>×</button>}
                <span style={{ fontSize: 11, fontWeight: 700, background: p.role === "First Author" ? C.tealDim : C.amberDim, color: p.role === "First Author" ? C.teal : C.amber, padding: "4px 10px", borderRadius: 4, flexShrink: 0, marginTop: 2, whiteSpace: "nowrap", border: `1px solid ${p.role === "First Author" ? C.teal : C.amber}25` }}>
                  {p.role === "First Author" ? "1st Author" : "Co-Author"}
                </span>
                <EditableText editMode={editMode} value={p.title} onChange={v => { const nw = [...workingPapers]; nw[i] = { ...nw[i], title: v }; setWorkingPapers(nw); }}
                  tag="div" style={{ fontFamily: "'Roboto', sans-serif", fontSize: 14, fontWeight: 400, color: C.ink2, lineHeight: 1.65 }} />
              </div>
            ))}
            {editMode && <button onClick={() => setWorkingPapers([...workingPapers, { title: "New Working Paper Title", role: "First Author" }])} style={{ background: C.amberDim, border: `2px dashed ${C.amber}40`, borderRadius: 12, padding: "18px", fontSize: 14, color: C.amber, cursor: "pointer", fontWeight: 700, textAlign: "center" as const }}>+ Add Working Paper</button>}
          </div>
        )}
       </div>
{/* publication end */}


        {/* ─── RESEARCH ─── */}
        <SecHead id="research">Research Experience</SecHead>
        {research.map((block, bi) => (
          <div key={bi} style={{ marginBottom: 34 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: bi === 0 ? C.navy : C.tealDim,
                border: `1px solid ${bi === 0 ? "transparent" : C.teal + "40"}`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0,
              }}>
                {bi === 0 ? "🔬" : "📋"}
              </div>
              <div>
                <EditableText editMode={editMode} value={block.role} onChange={v => { const nr = [...research]; nr[bi] = { ...nr[bi], role: v }; setResearch(nr); }}
                  tag="div" style={{ fontSize: 17, fontWeight: 800, color: C.navy, fontFamily: "'Roboto', sans-serif" }} />
                <EditableText editMode={editMode} value={block.dept} onChange={v => { const nr = [...research]; nr[bi] = { ...nr[bi], dept: v }; setResearch(nr); }}
                  tag="div" style={{ fontSize: 12, color: C.ink2, marginTop: 2 }} />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {block.projects.map((proj, pi) => {
                const k = `${bi}-${pi}`; const isOpen = openProj[k];
                return (
                  <div key={pi} style={{ ...cardStyle, borderColor: isOpen ? (bi === 0 ? C.teal + "50" : C.amber + "50") : C.border, padding: 0, overflow: "hidden", borderLeftWidth: isOpen ? 3 : 1, borderLeftColor: isOpen ? (bi === 0 ? C.teal : C.amber) : C.border }}>
                    <button onClick={() => setOpenProj(o => ({ ...o, [k]: !o[k] }))} style={{
                      width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "15px 20px", background: isOpen ? (bi === 0 ? C.tealDim : C.amberDim) : "transparent",
                      border: "none", cursor: "pointer", textAlign: "left", gap: 14, color: C.ink,
                      transition: "background 0.2s",
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, lineHeight: 1.5 }}>{proj.title}</div>
                        <div style={{ fontSize: 12, color: C.ink2, marginTop: 5, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ background: bi === 0 ? C.tealDim : C.amberDim, color: bi === 0 ? C.teal : C.amber, padding: "2px 9px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{proj.period}</span>
                          <span>{proj.funder}</span>
                        </div>
                      </div>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: isOpen ? (bi === 0 ? C.teal : C.amber) : C.border, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                        <span style={{ color: isOpen ? "#fff" : C.muted, fontSize: 14, lineHeight: 1, fontWeight: 700 }}>{isOpen ? "−" : "+"}</span>
                      </div>
                    </button>
                    {isOpen && (
                      <div style={{ padding: "0 20px 16px", borderTop: `1px solid ${C.border}` }}>
                        <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0" }}>
                          {proj.bullets.map((b, i) => (
                            <li key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: C.ink2, marginBottom: 8, lineHeight: 1.7, alignItems: "flex-start" }}>
                              <span style={{ color: bi === 0 ? C.teal : C.amber, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>›</span>
                              <EditableText editMode={editMode} value={b}
                                onChange={v => { const nr = [...research]; nr[bi].projects[pi].bullets[i] = v; setResearch([...nr]); }}
                                style={{ fontSize: 13, color: C.ink2, flex: 1 }} />
                              {editMode && <button onClick={() => { const nr = [...research]; nr[bi].projects[pi].bullets = nr[bi].projects[pi].bullets.filter((_: string, j: number) => j !== i); setResearch([...nr]); }} style={{ background: "none", border: "none", color: C.terra, cursor: "pointer", fontSize: 14, padding: 0, flexShrink: 0 }}>×</button>}
                            </li>
                          ))}
                        </ul>
                        {editMode && <button onClick={() => { const nr = [...research]; nr[bi].projects[pi].bullets = [...nr[bi].projects[pi].bullets, "New bullet point"]; setResearch([...nr]); }} style={{ background: C.amberDim, border: `1px dashed ${C.amber}`, borderRadius: 6, padding: "5px 14px", fontSize: 12, color: C.amber, cursor: "pointer", fontWeight: 600, marginTop: 4 }}>+ Add Bullet</button>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <Hr />


        <Hr />

        {/* ─── CONFERENCES ─── */}
        <SecHead id="conferences">Conferences</SecHead>
        <div style={{ position: "relative", paddingLeft: 32 }}>
          <div style={{ position: "absolute", left: 9, top: 10, bottom: 10, width: 2, background: `linear-gradient(180deg,${C.amber},${C.teal}30)`, borderRadius: 2 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {conferences.map((c, i) => {
              const typeMap: Record<string, [string, string]> = {
                "Oral Presentation": [C.teal, C.tealDim],
                "Poster Presentation": [C.amber, C.amberDim],
                "Abstract Accepted": [C.muted, "rgba(140,127,114,0.10)"],
              };
              const [col, bg] = typeMap[c.type] || [C.muted, C.borderLight];
              return (
                <div key={i} style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: -32, top: 20, width: 18, height: 18, borderRadius: "50%", background: col, border: `3px solid ${C.surface}`, zIndex: 1 }} />
                  <div style={{ ...cardStyle, position: "relative", borderLeft: `3px solid ${col}` }}>
                    {editMode && <button onClick={() => setConferences(conferences.filter((_, j) => j !== i))} style={{ position: "absolute", top: 8, right: 8, background: C.terraDim, border: `1px solid ${C.terra}40`, borderRadius: 6, color: C.terra, cursor: "pointer", fontSize: 12, padding: "3px 8px", fontWeight: 700, zIndex: 2 }}>×</button>}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: col, background: bg, border: `1px solid ${col}25`, padding: "3px 10px", borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{c.type}</span>
                      <span style={{ fontSize: 12, color: C.ink2, fontWeight: 500 }}>{c.date}</span>
                    </div>
                    <EditableText editMode={editMode} value={c.event} onChange={v => { const nc = [...conferences]; nc[i] = { ...nc[i], event: v }; setConferences(nc); }}
                      tag="div" style={{ fontSize: 15, fontWeight: 700, color: C.navy, lineHeight: 1.5, marginBottom: 5, fontFamily: "'Roboto', sans-serif" }} />
                    <div style={{ fontSize: 12.5, color: C.ink2 }}>📍 {c.location}</div>
                    {c.note && <EditableText editMode={editMode} value={c.note} onChange={v => { const nc = [...conferences]; nc[i] = { ...nc[i], note: v }; setConferences(nc); }}
                      tag="div" style={{ fontSize: 12.5, color: C.ink2, marginTop: 10, fontStyle: "italic", borderTop: `1px solid ${C.border}`, paddingTop: 10 }} />}
                  </div>
                </div>
              );
            })}
            {editMode && <div style={{ position: "relative" }}><div style={{ position: "absolute", left: -32, top: 18, width: 18, height: 18, borderRadius: "50%", background: C.amber, border: `3px solid ${C.surface}`, zIndex: 1, opacity: 0.4 }} /><button onClick={() => setConferences([...conferences, { type: "Oral Presentation", event: "New Conference Name", location: "Location", date: "Date", note: "" }])} style={{ background: C.amberDim, border: `2px dashed ${C.amber}40`, borderRadius: 12, padding: "18px", fontSize: 14, color: C.amber, cursor: "pointer", fontWeight: 700, textAlign: "center" as const, width: "100%" }}>+ Add Conference</button></div>}
          </div>
        </div>

        <Hr />

        {/* ─── EXPERIENCE ─── */}
        <SecHead id="experience">Professional Experience</SecHead>
        {experience.map((exp, i) => (
          <div key={i} style={{ ...cardStyle, padding: 0, overflow: "hidden", marginBottom: 32 }}>
            {/* Header band */}
            <div style={{ background: C.navy3,color:'white', padding: "22px 26px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
              <div>
                <EditableText editMode={editMode} value={exp.role} onChange={v => { const ne = [...experience]; ne[i] = { ...ne[i], role: v }; setExperience(ne); }}
                  tag="div" style={{ fontSize: 17, fontWeight: 800, color: C.navy, fontFamily: "'Roboto', sans-serif" }} />
                <div style={{ fontSize: 13, color: "rgba(200,240,220,0.60)", marginTop: 4 }}>{exp.org} · {exp.location}</div>
              </div>
              <span style={{ fontSize: 12, background: "rgba(13,158,114,0.14)", color: C.amber, padding: "5px 14px", borderRadius: 6, border: `1px solid ${C.amber}30`, whiteSpace: "nowrap", fontWeight: 600 }}>{exp.period}</span>
            </div>
            <div style={{ padding: "20px 26px" }}>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 18px" }}>
                {exp.bullets.map((b, j) => (
                  <li key={j} style={{ display: "flex", gap: 10, fontSize: 14, color: C.ink2, marginBottom: 9, lineHeight: 1.7, alignItems: "flex-start" }}>
                    <span style={{ color: C.teal, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>›</span>
                    <EditableText editMode={editMode} value={b} onChange={v => { const ne = [...experience]; ne[i].bullets[j] = v; setExperience([...ne]); }} style={{ fontSize: 14, color: C.ink2, flex: 1 }} />
                    {editMode && <button onClick={() => { const ne = [...experience]; ne[i].bullets = ne[i].bullets.filter((_: string, k: number) => k !== j); setExperience([...ne]); }} style={{ background: "none", border: "none", color: C.terra, cursor: "pointer", fontSize: 14, padding: 0, flexShrink: 0 }}>×</button>}
                  </li>
                ))}
              </ul>
              {editMode && <button onClick={() => { const ne = [...experience]; ne[i].bullets = [...ne[i].bullets, "New responsibility"]; setExperience([...ne]); }} style={{ background: C.tealDim, border: `1px dashed ${C.teal}`, borderRadius: 6, padding: "5px 14px", fontSize: 12, color: C.teal, cursor: "pointer", fontWeight: 600, marginBottom: 14 }}>+ Add Bullet</button>}
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.goldDim, border: `1px solid ${C.gold}30`, borderRadius: 8, padding: "10px 16px" }}>
                <span style={{ fontSize: 18 }}>🏅</span>
                <EditableText editMode={editMode} value={exp.award} onChange={v => { const ne = [...experience]; ne[i] = { ...ne[i], award: v }; setExperience(ne); }}
                  tag="span" style={{ fontSize: 13, color: C.gold, fontWeight: 700 }} />
              </div>
            </div>
          </div>
        ))}
        {editMode && <button onClick={() => setExperience([...experience, { role: "New Role", org: "Organization", location: "Location", period: "Period", bullets: ["Responsibility"], award: "" }])} style={{ background: C.amberDim, border: `2px dashed ${C.amber}40`, borderRadius: 12, padding: "18px", fontSize: 14, color: C.amber, cursor: "pointer", fontWeight: 700, textAlign: "center" as const, width: "100%", marginBottom: 32 }}>+ Add Experience</button>}

        {/* Leadership */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div style={{ width: 3, height: 24, background: `linear-gradient(180deg,${C.amber},${C.teal})`, borderRadius: 2 }} />
            <h3 style={{ fontSize: 18, fontWeight: 800, color: C.navy, margin: 0, fontFamily: "'Roboto', sans-serif" }}>Leadership & Extracurricular</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 }}>
            {leadership.map((l, i) => (
              <div key={i} style={{ ...cardStyle, display: "flex", gap: 14, padding: "16px 18px", position: "relative", borderTop: `2px solid ${i % 2 === 0 ? C.teal : C.amber}` }}>
                {editMode && <button onClick={() => setLeadership(leadership.filter((_, j) => j !== i))} style={{ position: "absolute", top: 6, right: 6, background: C.terraDim, border: `1px solid ${C.terra}40`, borderRadius: 6, color: C.terra, cursor: "pointer", fontSize: 12, padding: "2px 7px", fontWeight: 700 }}>×</button>}
                <div style={{ width: 38, height: 38, borderRadius: 8, background: i % 2 === 0 ? C.tealDim : C.amberDim, border: `1px solid ${i % 2 === 0 ? C.teal : C.amber}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 17 }}>{l.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <EditableText editMode={editMode} value={l.role} onChange={v => { const nl = [...leadership]; nl[i] = { ...nl[i], role: v }; setLeadership(nl); }}
                    tag="div" style={{ fontSize: 13, fontWeight: 700, color: C.navy, lineHeight: 1.4 }} />
                  <EditableText editMode={editMode} value={l.org} onChange={v => { const nl = [...leadership]; nl[i] = { ...nl[i], org: v }; setLeadership(nl); }}
                    tag="div" style={{ fontSize: 11.5, color: C.ink2, marginTop: 3, lineHeight: 1.35 }} />
                  <div style={{ fontSize: 11, color: i % 2 === 0 ? C.teal : C.amber, marginTop: 5, fontWeight: 700 }}>{l.period}</div>
                </div>
              </div>
            ))}
            {editMode && <button onClick={() => setLeadership([...leadership, { role: "New Role", org: "Organization", period: "Period", icon: "⭐" }])} style={{ background: C.amberDim, border: `2px dashed ${C.amber}40`, borderRadius: 12, padding: "18px", fontSize: 14, color: C.amber, cursor: "pointer", fontWeight: 700, textAlign: "center" as const }}>+ Add Leadership</button>}
          </div>
        </div>

        <Hr />

        {/* ─── SKILLS ─── */}
        <SecHead id="skills">Skills & Training</SecHead>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div style={{ ...cardStyle, borderTop: `3px solid ${C.navy}` }}>
            <div style={{ fontSize: 10, color: C.navy, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16, fontWeight: 700 }}>Statistical Software</div>
            {skills.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 11 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: i % 2 === 0 ? C.teal : C.amber, flexShrink: 0 }} />
                <EditableText editMode={editMode} value={s} onChange={v => { const ns = [...skills]; ns[i] = v; setSkills(ns); }}
                  style={{ fontSize: 14, color: C.ink2 }} />
              </div>
            ))}
            {editMode && <button onClick={() => setSkills([...skills, "New Skill"])} style={{ background: C.tealDim, border: `1px dashed ${C.teal}`, borderRadius: 6, padding: "6px 14px", fontSize: 12, color: C.teal, cursor: "pointer", fontWeight: 600, marginTop: 4 }}>+ Add Skill</button>}
          </div>
          <div style={{ ...cardStyle, borderTop: `3px solid ${C.amber}` }}>
            <div style={{ fontSize: 10, color: C.amber, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14, fontWeight: 700 }}>Competencies</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {competencies.map((s, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  {editMode ? (
                    <input value={s} onChange={e => { const nc = [...competencies]; nc[i] = e.target.value; setCompetencies(nc); }}
                      style={{ background: C.amberDim, border: `1px solid ${C.amber}50`, borderRadius: 4, padding: "4px 12px", fontSize: 12, fontWeight: 600, color: C.amber, outline: "none", fontFamily: "'Roboto', sans-serif", width: Math.max(80, s.length * 8) }} />
                  ) : <Tag color={i % 2 === 0 ? C.teal : C.amber} bg={i % 2 === 0 ? C.tealDim : C.amberDim}>{s}</Tag>}
                  {editMode && <button onClick={() => setCompetencies(competencies.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: C.terra, cursor: "pointer", fontSize: 14, padding: 0 }}>×</button>}
                </span>
              ))}
              {editMode && <button onClick={() => setCompetencies([...competencies, "New"])} style={{ background: C.amberDim, border: `1px dashed ${C.amber}`, borderRadius: 4, padding: "4px 14px", fontSize: 12, color: C.amber, cursor: "pointer", fontWeight: 600 }}>+ Add</button>}
            </div>
          </div>
        </div>

        {/* Trainings */}
        <div style={{ ...cardStyle, borderTop: `3px solid ${C.teal}` }}>
          <div style={{ fontSize: 10, color: C.teal, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 18, fontWeight: 700 }}>Training & Development</div>
          {trainings.map((t, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: i < trainings.length - 1 ? `1px solid ${C.border}` : "none", gap: 14, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 13, alignItems: "center", flex: 1 }}>
                <div style={{ width: 32, height: 32, borderRadius: 7, background: i % 2 === 0 ? C.tealDim : C.amberDim, border: `1px solid ${i % 2 === 0 ? C.teal : C.amber}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>📚</div>
                <EditableText editMode={editMode} value={t.title} onChange={v => { const nt = [...trainings]; nt[i] = { ...nt[i], title: v }; setTrainings(nt); }}
                  style={{ fontSize: 13, color: C.ink2 }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <span style={{ fontSize: 12, color: C.ink2, whiteSpace: "nowrap", fontWeight: 500, background: C.borderLight, padding: "3px 10px", borderRadius: 4 }}>{t.period}</span>
                {editMode && <button onClick={() => setTrainings(trainings.filter((_, j) => j !== i))} style={{ background: C.terraDim, border: `1px solid ${C.terra}40`, borderRadius: 6, color: C.terra, cursor: "pointer", fontSize: 12, padding: "2px 7px", fontWeight: 700 }}>×</button>}
              </div>
            </div>
          ))}
          {editMode && <button onClick={() => setTrainings([...trainings, { title: "New Training", period: "Period" }])} style={{ background: C.tealDim, border: `2px dashed ${C.teal}40`, borderRadius: 8, padding: "12px", fontSize: 13, color: C.teal, cursor: "pointer", fontWeight: 700, textAlign: "center" as const, width: "100%", marginTop: 14 }}>+ Add Training</button>}
        </div>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ textAlign: "center", padding: "2rem 2.5rem", borderTop: `1px solid ${C.border}`, color: C.muted, fontSize: 12.5, background: C.surfaceCard, letterSpacing: "0.02em" }}>
        © {new Date().getFullYear()} {person.name} · {person.title} · {person.location}
      </footer>
    </div>
  );
}