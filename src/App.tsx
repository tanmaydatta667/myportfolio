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
interface Workshop { title: string; description: string; organizer: string; date: string; mode: string; }
interface EducationItem { degree: string; school: string; location: string; year: string; }
interface TestItem { name: string; score: string; }

/* ─── REFINED COLOR PALETTE ─── */
/* Deep Forest Green + Crisp White + Sage + Mint */
const C: Record<string, string> = {
  // Base — deep forest green (replaces navy)
  navy: "#0e3d2f",   // deep forest green
  navy2: "#145c44",
  navy3: "#1a7050",
  navyMid: "#1b6645",

  // Surface — pure crisp whites with faint green tint
  surface: "#f4faf7",   // barely-there green white
  surfaceCard: "#ffffff",
  surfaceAlt: "#eaf5ef",
  border: "#d1e8dc",
  borderLight: "#e4f2eb",

  // Text — dark green-tinted ink
  ink: "#0e2a1e",
  ink2: "#2d5243",
  muted: "#6b9980",

  // Primary accent — vivid emerald
  amber: "#0d9e72",   // renamed for code reuse; this is now emerald
  amberBold: "#0a7d5a",
  amberDim: "rgba(13,158,114,0.10)",
  amberGlow: "rgba(13,158,114,0.18)",

  // Secondary accent — sage / mid green
  teal: "#2e8b6b",
  tealLight: "#38a882",
  tealDim: "rgba(46,139,107,0.10)",
  tealGlow: "rgba(46,139,107,0.18)",

  // Tertiary — muted slate-green for "under review"
  terra: "#4a7c6a",
  terraDim: "rgba(74,124,106,0.12)",

  // Gold for awards — warm contrast pop
  gold: "#b08c1a",
  goldDim: "rgba(176,140,26,0.10)",

  // Gradient helpers
  heroGrad: "linear-gradient(135deg,#e8f5ef 0%,#d4ede0 50%,#e0f5ea 100%)",
  cardGrad: "linear-gradient(135deg,#f4faf7,#ffffff)",
};

const NAV = ["About", "Education", "Research", "Publications", "Conferences", "Experience", "Skills", "Contact"];

/* ─── initial data ─── */
const INIT_PERSON = {
  name: "Tanmay Datta", title: "Agricultural Economist",
  institution: "Sher-e-Bangla Agricultural University", location: "Dhaka-1207, Bangladesh",
  email: "tanmaydatta67@gmail.com", phone: "(+880) 1758279651",
  about: `Agricultural Economics researcher with a deep interest in Development Economics — specifically how economic and policy factors shape household welfare, rural livelihoods, and food and nutrition security in developing-country contexts. I gravitate toward research that connects real-world development challenges with rigorous empirical evidence: improving agricultural productivity, strengthening resilience to climate shocks, and designing policies that reduce vulnerability and inequality.`,
  interests: ["Development Economics", "Agricultural Productivity", "Climate Resilience", "Food & Nutrition Security", "Household Welfare", "Econometrics", "Machine Learning in Agriculture"],
  links: [
    { label: "LinkedIn", url: "https://linkedin.com/in/tanmay-datta-a7a23719b", icon: "in" },
    { label: "Google Scholar", url: "https://scholar.google.com/citations?user=fNbF88wAAAAJ&hl=en", icon: "gs" },
    { label: "ResearchGate", url: "https://www.researchgate.net/profile/Tanmay-Datta-3", icon: "rg" },
    { label: "ORCID", url: "https://orcid.org/0009-0000-5548-4426", icon: "or" },
  ] as Link[],
  image: "https://i.ibb.co.com/0RcCkzb9/tanmaypic.png",
};

const INIT_PUBLICATIONS: Publication[] = [
  { authors: "Sarker, M.M.R., Aleen, M.J. & Datta, T.", year: 2025, title: "Productivity of Food and Self-Sufficiency in Rice Production in Bangladesh", journal: "Economics", details: "12(3), pp. 214–226", url: "https://www.davidpublisher.com/index.php/Home/Article/index?id=52177.html" },
  { authors: "Sarker, M.M.R., Aleen, M.J. & Datta, T.", year: 2025, title: "Agricultural Transformation and Its Contribution to Economic Development in South Asian and African Countries", journal: "Asian Journal of Advances in Agricultural Research", details: "25(1), pp. 19–31", url: "https://journalajaar.com/index.php/AJAAR/article/view/577" },
];

const INIT_UNDER_REVIEW: ReviewItem[] = [
  { title: "Determinants of Climate-Smart Agriculture (CSA) in Mushroom Farming: Dual Application of Bayesian and Machine Learning Approach", journal: "Scientific Reports" },
  { title: "Multilevel Model Assessing Women's ICT Adoption in Bangladesh", journal: "Social Sciences & Humanities" },
  { title: "Evaluating Machine Learning Models for Intimate Partner Violence Detection in Bangladesh", journal: "Sociology" },
  { title: "The Impact of Climate Change and Renewable Energy on Agricultural Productivity in Bangladesh: An Empirical Assessment Using ARDL Approach", journal: "Discover Sustainability" },
];

const INIT_WORKING_PAPERS: WorkingPaper[] = [
  { title: "Pathways from Household Food Insecurity and Undernutrition to Under-Five Mortality: Systematic Evidence from Asian Countries", role: "First Author" },
  { title: "Child Education in Indigenous Communities: Barriers, Enablers and Policy Responses Across South Asian Countries", role: "First Author" },
  { title: "Climate-Smart Agriculture and Household Well-Being: Food Security, Poverty and Resilience Outcomes in Asia and Africa", role: "First Author" },
  { title: "Crop Insurance: Why Are Farmers Reluctant to Adopt Crop Insurance Over Traditional Risk Management Strategies?", role: "Co-Author" },
  { title: "The U.S. Withdrawal from the Paris Agreement: Implications for Global Climate Finance and Carbon Emission Space", role: "Co-Author" },
  { title: "The Role of Women's Asset Ownership in Child Health and Nutrition", role: "Co-Author" },
  { title: "Household Food Security, Determinants and Coping Strategies Among Smallholder Farmers in Riverbank and Haor Areas of Bangladesh", role: "Co-Author" },
  { title: "Data-Driven IoT Applications in Livestock Farming: Evolution, Adoption, and Economic Impact", role: "Co-Author" },
  { title: "Transboundary Animal Diseases and Their Economic Impact on Smallholder Livestock Systems", role: "Co-Author" },
];

const INIT_RESEARCH: ResearchBlock[] = [
  {
    role: "Research Associate", color: C.teal,
    dept: "Dept. of Agricultural Statistics, Faculty of Agribusiness Management, SAU",
    projects: [
      { period: "Jul 2024–Jan 2025", title: "Impact of CSA Technologies on Food Security in Haor Area, Sunamganj", funder: "SAURES", bullets: ["Farm-level data collection on CSA technologies and household food security", "Research report writing and final project documentation"] },
      { period: "Sep–Nov 2024", title: "2024 Bangladesh Shrimp Survey", funder: "ADB Institute / University of Tokyo", bullets: ["Primary data collection from shrimp-farming households and stakeholders", "Structured data entry and dataset cleaning for subsequent analysis", "Fieldwork coordination under Prof. Dr. Md. Mizanur Rahman Sarker"] },
      { period: "Jan–Jun 2023", title: "Validation and Adoption of CSTs for Shrimp Farming in Coastal Ecosystems", funder: "Ministry of Science & Technology, Bangladesh", bullets: ["Field implementation and data collection in coastal shrimp-farming areas", "Prepared summary documents for ministry submission"] },
    ],
  },
  {
    role: "Research Assistant", color: C.amber,
    dept: "Dept. of Agricultural Statistics, Faculty of Agribusiness Management, SAU",
    projects: [
      { period: "Jun 2023–Jun 2024", title: "Impact of CSA in Mushroom Farming: Classical & Machine Learning Approaches", funder: "SAURES", bullets: ["Data entry, cleaning and organisation for farm-level survey data", "Contributed to manuscript preparation and report writing"] },
      { period: "Apr 2023–Jun 2024", title: "ML Algorithms to Predict Depression & Suicidal Behaviours Among University Students", funder: "University Grants Commission (UGC), Bangladesh", bullets: ["Data entry, coding and statistical/ML analysis using R and SPSS", "Drafted analytical sections of project reports and manuscripts"] },
      { period: "Jun 2023–Jun 2024", title: "Impact of CSA in Rice Farming in Coastal Ecosystems", funder: "Ministry of Science & Technology, Bangladesh", bullets: ["Data entry and database management for coastal rice-farming surveys"] },
      { period: "Dec 2022–Jun 2023", title: "KAP Toward Environmental Education: Secondary-Level Students in Bangladesh", funder: "Ministry of Science & Technology, Bangladesh", bullets: ["Data entry, cleaning and preliminary statistical analysis", "Assisted in preparing research reports and presentations"] },
    ],
  },
];

const INIT_CONFERENCES: Conference[] = [
  { type: "Oral Presentation", event: "CUKUROVA 16th International Scientific Research Conference", location: "Adana, Türkiye (Online)", date: "Nov 2025", note: "Household food security & climate change adaptation in haor and riverbank areas of Bangladesh" },
  { type: "Abstract Accepted", event: "6th International Conference on Agriculture, Food Security and Safety 2025 (Hybrid)", location: "Kuala Lumpur, Malaysia", date: "Aug 2025", note: "" },
  { type: "Poster Presentation", event: "7th International Scientific Conference on Food Safety and Health (ISCFSH)", location: "Bangladesh", date: "May 2025", note: "Organised by Bangladesh Society for Safe Food (BSSF)" },
  { type: "Abstract Accepted", event: "International Conference on Smart Agriculture, Environment and Global Warming (SAEGW-2025)", location: "Daegu, South Korea (Hybrid)", date: "May 2025", note: "International Society for Research (ISR)" },
];

const INIT_EXPERIENCE: ExperienceItem[] = [{
  role: "Junior Executive — Communication & Public Relations",
  org: "Greeniculture Agrotech Limited", location: "Dhaka, Bangladesh",
  period: "May 2021 – March 2023",
  bullets: ["Supported corporate communication and public relations activities", "Prepared notices, content, and stakeholder communications", "Coordinated with internal teams to maintain professional relationships"],
  award: "Best Employee of the Month — September 2021",
}];

const INIT_LEADERSHIP: LeadershipItem[] = [
  { role: "Club Development Adviser", org: "ICT & Career Development Club, SAU", period: "Feb 2025 – Present", icon: "🏛" },
  { role: "President", org: "BADHAN Voluntary Blood Donors' Organisation, SAU Unit", period: "Jan 2023 – Dec 2023", icon: "🩸" },
  { role: "Secretary", org: "Rotaract Club of Dhaka Mid City Green", period: "Jul 2023 – Jun 2024", icon: "🔄" },
  { role: "Zonal Secretary, Zone 3A", org: "Rotaract District Organisation 3281, Bangladesh", period: "May 2023 – May 2024", icon: "🌐" },
  { role: "Vice-President", org: "Entrepreneurship Development Club, SAU", period: "May 2023 – Feb 2025", icon: "💡" },
  { role: "Head of Event Management", org: "Hult Prize at SAU", period: "Aug 2020 – Jul 2021", icon: "🏆" },
];

const INIT_SKILLS: string[] = ["R (R Programming)", "Stata", "SPSS", "MS Word / Excel / PowerPoint"];
const INIT_COMPETENCIES: string[] = ["Econometric Analysis", "Survey Design", "Data Cleaning", "Academic Writing", "Policy Writing", "Machine Learning", "R Programming", "SPSS Modelling"];
const INIT_TRAININGS: Training[] = [
  { title: "Agri-Science Leadership Development Training (Virtual)", period: "Nov–Dec 2020" },
  { title: "SPSS Training for Agricultural Experiments and Research", period: "Nov 2024 – Jan 2025" },
  { title: "Training on Data Analysis (R and SPSS)", period: "May 7–8, 2025" },
];

const INIT_WORKSHOPS: Workshop[] = [
  { title: "Turning SDGs into Local Action: Lessons from University-Led Climate and Planetary Health Initiatives", description: "Pre-conference workshop exploring sustainable development goals and their local implementation through university-led climate and planetary health initiatives.", organizer: "International Conference on Sustainable Development Goals (ICSDG 2026)", date: "Feb 26, 2026", mode: "Online" },
];

const INIT_EDUCATION: EducationItem[] = [
  { degree: "B.Sc. (Hons.) in Agricultural Economics", school: "Sher-e-Bangla Agricultural University", location: "Dhaka 1207, Bangladesh", year: "Passing year: 2022; Result Published: 2024" },
  { degree: "Higher Secondary Certificate (HSC), Science", school: "Notre Dame College", location: "Dhaka, Bangladesh", year: "Passing year: 2017" },
  { degree: "Secondary School Certificate (SSC), Science", school: "Comilla Zilla School", location: "Cumilla, Bangladesh", year: "Passing year: 2015" },
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
function SecHead({ children, id }: { children: string; id: string }) {
  return (
    <div className="sec-head" id={id} style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28, marginTop: 10 }}>
      <h2 style={{ fontSize: "clamp(1.3rem,4vw,1.75rem)", fontWeight: 800, color: C.navy, margin: 0, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{children}</h2>
      <div style={{ flex: 1, height: 2, background: `linear-gradient(90deg,${C.teal},${C.teal}20,transparent)` }} />
    </div>
  );
}

function Hr() { return <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${C.border},transparent)`, margin: "3.2rem 0" }} />; }

/* ─── tag ─── */
function Tag({ children, color = C.teal, bg = C.tealDim }: { children: ReactNode; color?: string; bg?: string }) {
  return <span style={{ display: "inline-block", padding: "5px 14px", borderRadius: 6, fontSize: 12, fontWeight: 700, color, background: bg, margin: "4px 4px 4px 0", fontFamily: "'Roboto', sans-serif", letterSpacing: "0.03em", border: `1.5px solid ${color}30` }}>{children}</span>;
}

/* ═══════════════════════════════════════════ */
export default function Portfolio() {
  const [active, setActive] = useState("about");
  const [editMode, setEditMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
  const [workshops, setWorkshops] = useState(INIT_WORKSHOPS);
  const [education, setEducation] = useState(INIT_EDUCATION);
  const [tests, setTests] = useState(INIT_TESTS);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

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
    boxShadow: "0 2px 8px rgba(14,61,47,0.08), 0 8px 24px rgba(14,61,47,0.12)",
  };

  return (
    <div style={{ fontFamily: "'Roboto', sans-serif", background: C.surface, minHeight: "100vh", color: C.ink }}>

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        a:hover { opacity: 0.82; }
        button { font-family: 'Roboto', sans-serif; cursor: pointer; } * { font-family: 'Roboto', sans-serif; }
        
        /* Responsive scrollbar for nav */
        #header-nav::-webkit-scrollbar { display: none; }
        #header-nav { -ms-overflow-style: none; scrollbar-width: none; }

        @media (max-width: 768px) {
          header { padding: 0 1.25rem !important; height: 62px !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important; }
          #header-nav { 
            position: fixed; top: 62px; left: 0; width: 100%; 
            background: rgba(247,244,239,0.98); 
            flex-direction: column !important; 
            padding: 1.5rem !important; 
            gap: 0.75rem !important;
            border-bottom: 1px solid ${C.border};
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
            transform: translateY(${menuOpen ? "0" : "-120%"});
            opacity: ${menuOpen ? "1" : "0"};
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: ${menuOpen ? "all" : "none"};
            z-index: 299;
          }
          #menu-toggle { display: flex !important; }
          #hero-container { flex-direction: column; text-align: center; gap: 2rem !important; padding: 3.5rem 1.5rem !important; }
          #hero-text { align-items: center; }
          #hero-avatar { width: 140px !important; height: 140px !important; }
          .hero-links { justify-content: center !important; gap: 6px !important; }
          .hero-link { padding: 6px 12px !important; font-size: 11.5px !important; }
          main { padding: 2rem 1.25rem !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .sec-head { flex-direction: column; align-items: flex-start !important; gap: 10px !important; }
          .publication-tabs { width: 100% !important; flex-wrap: wrap !important; }
          .publication-tabs button { flex: 1; text-align: center; }
          .card-inner { padding: 16px !important; }
          #contact-form { grid-template-columns: 1fr !important; }
          #contact-form > div { grid-column: span 1 !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
          #header-nav { gap: 0 !important; }
          h1 { font-size: 2.1rem !important; }
          #hero-avatar { width: 120px !important; height: 120px !important; }
        }
      `}</style>

      {/* ═══ TOP BAR ═══ */}
      <header style={{
        position: "sticky", top: 0, zIndex: 300,
        background: "rgba(247,244,239,0.88)", backdropFilter: "blur(20px) saturate(160%)",
        borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", padding: "0 2.5rem", justifyContent: "space-between", gap: "1rem",
        minHeight: 62
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: C.navy,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 13, color: C.amber, flexShrink: 0,
            fontFamily: "'Roboto', sans-serif", letterSpacing: "0.04em",
          }}>TD</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, lineHeight: 1.2, fontFamily: "'Roboto', sans-serif" }}>Tanmay Datta</div>
            <div style={{ fontSize: 11, color: C.muted, lineHeight: 1, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Agricultural Economist</div>
          </div>
        </div>

        {/* Mobile menu toggle */}
        <button id="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} style={{
          display: "none", alignItems: "center", justifyContent: "center",
          width: 40, height: 40, borderRadius: 8, border: `1.5px solid ${C.border}`,
          background: menuOpen ? C.navy : "white", color: menuOpen ? C.amber : C.navy,
          cursor: "pointer", transition: "all 0.2s"
        }}>
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          )}
        </button>

        <div id="header-nav" style={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "nowrap", justifyContent: "flex-end" }}>
          {NAV.map(n => (
            <button key={n} onClick={() => { scrollTo(n.toLowerCase()); setMenuOpen(false); }} style={{
              padding: "7px 16px", borderRadius: 7, fontSize: 13, border: "none", cursor: "pointer",
              background: active === n.toLowerCase() ? C.navy : "transparent",
              color: active === n.toLowerCase() ? C.amber : C.muted,
              fontWeight: active === n.toLowerCase() ? 700 : 500,
              transition: "all 0.18s",
              width: "auto",
              textAlign: "center", letterSpacing: "0.01em"
            }}>{n}</button>
          ))}
          <button onClick={() => { setEditMode(!editMode); setMenuOpen(false); }} style={{
            marginLeft: 12, padding: "8px 18px", borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: "pointer",
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

        <div id="hero-container" style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: "3rem", position: "relative", zIndex: 1, flexWrap: "nowrap" }}>
          <div id="hero-avatar" style={{
            width: 150, height: 150, borderRadius: 16,
            background: "rgba(13,158,114,0.12)",
            border: `2px solid rgba(13,158,114,0.30)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 700, color: C.navy, flexShrink: 0,
            fontFamily: "'Roboto', sans-serif",
            overflow: "hidden", position: "relative"
          }}>
            {person.image ? (
              <img src={person.image} alt={person.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : "TD"}
            {editMode && (
              <div style={{ position: "absolute", bottom: 0, width: "100%", background: "rgba(0,0,0,0.6)", padding: 4, textAlign: "center" }}>
                <input
                  type="text"
                  placeholder="Image URL"
                  value={person.image || ""}
                  onChange={e => updatePerson("image", e.target.value)}
                  style={{ width: "90%", fontSize: 10, background: "transparent", color: "white", border: "none", outline: "none" }}
                />
              </div>
            )}
          </div>

          <div id="hero-text" style={{ flex: 1, minWidth: 260 }}>
            {/* Name */}
            <EditableText editMode={editMode} value={person.name} onChange={v => updatePerson("name", v)}
              tag="h1" style={{
                fontFamily: "'Roboto', sans-serif",
                fontSize: "clamp(2.2rem,5vw,3rem)",
                fontWeight: 900, color: C.navy, margin: "0 0 10px",
                letterSpacing: "-0.03em", display: "block", lineHeight: 1.1,
              }} />
            {/* Title */}
            <EditableText editMode={editMode} value={`${person.title} · Development Researcher`} onChange={v => updatePerson("title", v.split(" · ")[0])}
              tag="div" style={{ fontSize: 16, color: C.teal, fontWeight: 700, marginBottom: 6, fontFamily: "'Roboto', sans-serif", letterSpacing: "0.01em" }} />
            {/* Institution */}
            <EditableText editMode={editMode} value={`${person.institution}, ${person.location}`} onChange={v => {
              const parts = v.split(","); updatePerson("institution", parts[0]?.trim() || ""); updatePerson("location", parts.slice(1).join(",").trim() || "");
            }} tag="div" style={{ fontSize: 13, color: C.ink2, marginBottom: 26, letterSpacing: "0.02em", fontWeight: 500 }} />

            {/* Links */}
            <div className="hero-links" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a href={`mailto:${person.email}`} className="hero-link" style={{
                padding: "9px 20px", borderRadius: 8,
                border: `1.5px solid ${C.amber}60`,
                color: C.navy, fontSize: 13, textDecoration: "none",
                background: C.amberDim, fontWeight: 700, letterSpacing: "0.02em",
                transition: "all 0.2s",
              }}>{person.email}</a>
              {person.links.map(l => (
                <a key={l.label} href={l.url} target="_blank" rel="noreferrer" className="hero-link" style={{
                  padding: "9px 20px", borderRadius: 8,
                  border: `1.5px solid ${C.border}`,
                  color: C.ink2, fontSize: 13, textDecoration: "none",
                  background: C.surfaceCard, fontWeight: 600, transition: "all 0.2s", letterSpacing: "0.01em",
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
        <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 16, marginBottom: 36 }}>
          {[
            [String(publications.length), "Publications", C.teal, C.tealDim],
            [String(underReview.length), "Under Review", C.terra, C.terraDim],
            [String(workingPapers.length), "Working Papers", C.amber, C.amberDim],
            [String(conferences.length), "Conferences", C.navy, "rgba(13,27,42,0.07)"],
          ].map(([n, l, col, bg]) => (
            <div key={l} style={{ background: bg, border: `1.5px solid ${col}35`, borderRadius: 14, textAlign: "center", padding: "24px 16px", transition: "all 0.2s" }}>
              <div style={{ fontSize: 38, fontWeight: 900, color: col, lineHeight: 1, fontFamily: "'Roboto', sans-serif" }}>{n}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 10, letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1.3, fontWeight: 700 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* About paragraph */}
        <EditableText editMode={editMode} value={person.about} onChange={v => updatePerson("about", v)} multiline
          tag="p" style={{ fontFamily: "'Roboto', sans-serif", fontSize: 16, lineHeight: 2, color: C.ink, margin: "0 0 28px", display: "block", fontWeight: 500 }} />

        {/* Research interests */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 14, fontWeight: 800 }}>Research Interests</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {person.interests.map((t, i) => (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                {editMode ? (
                  <input value={t} onChange={e => { const ni = [...person.interests]; ni[i] = e.target.value; updatePerson("interests", ni); }}
                    style={{ background: C.tealDim, border: `1.5px solid ${C.teal}60`, borderRadius: 6, padding: "6px 14px", fontSize: 13, fontWeight: 700, color: C.teal, outline: "none", fontFamily: "'Roboto', sans-serif", width: Math.max(100, t.length * 8) }}
                  />
                ) : <Tag>{t}</Tag>}
                {editMode && <button onClick={() => updatePerson("interests", person.interests.filter((_: string, j: number) => j !== i))} style={{ background: "none", border: "none", color: C.terra, cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1, fontWeight: 700 }}>×</button>}
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
                    tag="div" style={{ fontSize: 17, fontWeight: 800, color: C.navy, marginBottom: 6 }} />
                  <EditableText editMode={editMode} value={edu.school} onChange={v => { const ne = [...education]; ne[i].school = v; setEducation(ne); }}
                    tag="div" style={{ fontSize: 15, fontWeight: 700, color: C.teal, marginBottom: 3 }} />
                  <EditableText editMode={editMode} value={edu.location} onChange={v => { const ne = [...education]; ne[i].location = v; setEducation(ne); }}
                    tag="div" style={{ fontSize: 13, color: C.muted, marginBottom: 10, fontWeight: 500 }} />
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, color: C.muted }}>{edu.year}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {editMode && <button onClick={() => setEducation([...education, { degree: "Degree Name", school: "University", location: "Location", year: "Year" }])} style={{ background: C.tealDim, border: `2px dashed ${C.teal}40`, borderRadius: 12, padding: "16px", fontSize: 14, color: C.teal, cursor: "pointer", fontWeight: 700, textAlign: "center" }}>+ Add Education</button>}
        </div>

        {/* ─── STANDARDIZED TESTS ─── */}
        <div style={{ marginBottom: 34 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div style={{ width: 3, height: 24, background: `linear-gradient(180deg,${C.amber},${C.teal})`, borderRadius: 2 }} />
            <h3 style={{ fontSize: 19, fontWeight: 800, color: C.navy, margin: 0 }}>Standardized Test</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
            {tests.map((t, i) => (
              <div key={i} style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", position: "relative" }}>
                {editMode && <button onClick={() => setTests(tests.filter((_, j) => j !== i))} style={{ position: "absolute", top: -8, right: -8, background: C.terra, color: "white", borderRadius: "50%", width: 20, height: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>}
                <div>
                  <EditableText editMode={editMode} value={t.name} onChange={v => { const nt = [...tests]; nt[i].name = v; setTests(nt); }}
                    tag="div" style={{ fontSize: 15, fontWeight: 800, color: C.navy }} />
                  {t.score && <EditableText editMode={editMode} value={t.score} onChange={v => { const nt = [...tests]; nt[i].score = v; setTests(nt); }}
                    tag="div" style={{ fontSize: 13, color: C.teal, marginTop: 2 }} />}
                </div>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: C.amberDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📝</div>
              </div>
            ))}
            {editMode && <button onClick={() => setTests([...tests, { name: "Test Name", score: "" }])} style={{ background: C.amberDim, border: `2px dashed ${C.amber}40`, borderRadius: 12, padding: "16px", fontSize: 14, color: C.amber, cursor: "pointer", fontWeight: 700, textAlign: "center" }}>+ Add Test</button>}
          </div>
        </div>


        <SecHead id="publications">Publications</SecHead>
        <div style={{ marginBottom: 26 }}>
          <div className="publication-tabs" style={{ display: "flex", gap: 4, marginBottom: 28, background: C.borderLight, padding: 6, borderRadius: 11, width: "fit-content" }}>
            {([["published", "Published", String(publications.length), C.teal], ["review", "Under Review", String(underReview.length), C.terra], ["working", "Working Papers", String(workingPapers.length), C.amber]] as [string, string, string, string][]).map(([k, v, count, col]) => (
              <button key={k} onClick={() => setPubTab(k)} style={{
                flex: 1,
                padding: "10px 20px", borderRadius: 8, fontSize: 14, border: "none", cursor: "pointer",
                background: pubTab === k ? "white" : "transparent",
                color: pubTab === k ? col : C.muted,
                fontWeight: pubTab === k ? 800 : 600,
                boxShadow: pubTab === k ? "0 3px 12px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.2s",
                display: "flex", alignItems: "center", gap: 9, justifyContent: "center"
              }}>
                {v} <span style={{ fontSize: 12, fontWeight: pubTab === k ? 700 : 600, background: pubTab === k ? col : C.border, color: pubTab === k ? "white" : C.muted, padding: "2px 8px", borderRadius: 6, transition: "all 0.2s" }}>{count}</span>
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
                    tag="div" style={{ fontFamily: "'Roboto', sans-serif", fontSize: 16, fontWeight: 800, color: C.navy, lineHeight: 1.6, marginBottom: 10, paddingRight: 56 }} />
                  <EditableText editMode={editMode} value={p.authors} onChange={v => { const np = [...publications]; np[i] = { ...np[i], authors: v }; setPublications(np); }}
                    tag="div" style={{ fontSize: 13, color: C.ink2, marginBottom: 14, fontWeight: 500 }} />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <span style={{ fontWeight: 800, color: C.teal, fontSize: 14 }}>{p.journal}</span>
                      <span style={{ fontSize: 13.5, color: C.muted, fontWeight: 500 }}> — {p.details}</span>
                    </div>
                    <a href={p.url} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: C.amber, border: `1.5px solid ${C.amber}60`, padding: "8px 18px", borderRadius: 7, textDecoration: "none", fontWeight: 800, background: C.amberDim, whiteSpace: "nowrap" }}>View Article →</a>
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
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: bi === 0 ? C.navy : C.tealDim,
                border: `1.5px solid ${bi === 0 ? "transparent" : C.teal + "50"}`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0,
              }}>
                {bi === 0 ? "🔬" : "📋"}
              </div>
              <div>
                <EditableText editMode={editMode} value={block.role} onChange={v => { const nr = [...research]; nr[bi] = { ...nr[bi], role: v }; setResearch(nr); }}
                  tag="div" style={{ fontSize: 18, fontWeight: 800, color: C.navy, fontFamily: "'Roboto', sans-serif" }} />
                <EditableText editMode={editMode} value={block.dept} onChange={v => { const nr = [...research]; nr[bi] = { ...nr[bi], dept: v }; setResearch(nr); }}
                  tag="div" style={{ fontSize: 13, color: C.ink2, marginTop: 3, fontWeight: 500 }} />
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
                        <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, lineHeight: 1.6 }}>{proj.title}</div>
                        <div style={{ fontSize: 13, color: C.ink2, marginTop: 6, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ background: bi === 0 ? C.tealDim : C.amberDim, color: bi === 0 ? C.teal : C.amber, padding: "3px 11px", borderRadius: 5, fontSize: 12, fontWeight: 800 }}>{proj.period}</span>
                          <span style={{ fontWeight: 500 }}>{proj.funder}</span>
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
                            <li key={i} style={{ display: "flex", gap: 10, fontSize: 14, color: C.ink2, marginBottom: 10, lineHeight: 1.8, alignItems: "flex-start", fontWeight: 500 }}>
                              <span style={{ color: bi === 0 ? C.teal : C.amber, fontWeight: 800, flexShrink: 0, marginTop: 1.5, fontSize: 16 }}>›</span>
                              <EditableText editMode={editMode} value={b}
                                onChange={v => { const nr = [...research]; nr[bi].projects[pi].bullets[i] = v; setResearch([...nr]); }}
                                style={{ fontSize: 14, color: C.ink2, flex: 1, fontWeight: 500 }} />
                              {editMode && <button onClick={() => { const nr = [...research]; nr[bi].projects[pi].bullets = nr[bi].projects[pi].bullets.filter((_: string, j: number) => j !== i); setResearch([...nr]); }} style={{ background: "none", border: "none", color: C.terra, cursor: "pointer", fontSize: 16, padding: 0, flexShrink: 0, fontWeight: 700 }}>×</button>}
                            </li>
                          ))}
                        </ul>
                        {editMode && <button onClick={() => { const nr = [...research]; nr[bi].projects[pi].bullets = [...nr[bi].projects[pi].bullets, "New bullet point"]; setResearch([...nr]); }} style={{ background: C.amberDim, border: `1.5px dashed ${C.amber}40`, borderRadius: 7, padding: "6px 16px", fontSize: 13, color: C.amber, cursor: "pointer", fontWeight: 700, marginTop: 6 }}>+ Add Bullet</button>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}


        <Hr />

        {/* ─── CONFERENCES ─── */}
        <SecHead id="conferences">Conferences</SecHead>
        <div style={{ position: "relative", paddingLeft: 32, marginBottom: 20 }}>
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
                    <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 12, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: col, background: bg, border: `1.5px solid ${col}40`, padding: "4px 12px", borderRadius: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>{c.type}</span>
                      <span style={{ fontSize: 13, color: C.ink2, fontWeight: 600 }}>{c.date}</span>
                    </div>
                    <EditableText editMode={editMode} value={c.event} onChange={v => { const nc = [...conferences]; nc[i] = { ...nc[i], event: v }; setConferences(nc); }}
                      tag="div" style={{ fontSize: 16, fontWeight: 800, color: C.navy, lineHeight: 1.6, marginBottom: 7, fontFamily: "'Roboto', sans-serif" }} />
                    <div style={{ fontSize: 13, color: C.ink2, fontWeight: 500 }}>📍 {c.location}</div>
                    {c.note && <EditableText editMode={editMode} value={c.note} onChange={v => { const nc = [...conferences]; nc[i] = { ...nc[i], note: v }; setConferences(nc); }}
                      tag="div" style={{ fontSize: 13, color: C.ink2, marginTop: 12, fontStyle: "italic", fontWeight: 500, borderTop: `1px solid ${C.border}`, paddingTop: 12 }} />}
                  </div>
                </div>
              );
            })}
            {editMode && <div style={{ position: "relative" }}><div style={{ position: "absolute", left: -32, top: 18, width: 18, height: 18, borderRadius: "50%", background: C.amber, border: `3px solid ${C.surface}`, zIndex: 1, opacity: 0.4 }} /><button onClick={() => setConferences([...conferences, { type: "Oral Presentation", event: "New Conference Name", location: "Location", date: "Date", note: "" }])} style={{ background: C.amberDim, border: `2px dashed ${C.amber}60`, borderRadius: 12, padding: "20px", fontSize: 15, color: C.amber, cursor: "pointer", fontWeight: 800, textAlign: "center" as const, width: "100%", letterSpacing: "0.01em" }}>+ Add Conference</button></div>}
          </div>
        </div>



        {/* ─── EXPERIENCE ─── */}
        <SecHead id="experience">Professional Experience</SecHead>
        {experience.map((exp, i) => (
          <div key={i} style={{ ...cardStyle, padding: 0, overflow: "hidden", marginBottom: 32 }}>
            {/* Header band */}
            <div style={{ background: C.navy3, color: 'white', padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
              <div>
                <EditableText editMode={editMode} value={exp.role} onChange={v => { const ne = [...experience]; ne[i] = { ...ne[i], role: v }; setExperience(ne); }}
                  tag="div" style={{ fontSize: 18, fontWeight: 900, color: "white", fontFamily: "'Roboto', sans-serif" }} />
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 5, fontWeight: 600 }}>{exp.org} · {exp.location}</div>
              </div>
              <span style={{ fontSize: 13, background: "rgba(13,158,114,0.16)", color: C.amber, padding: "6px 16px", borderRadius: 7, border: `1.5px solid ${C.amber}40`, whiteSpace: "nowrap", fontWeight: 800, letterSpacing: "0.01em" }}>{exp.period}</span>
            </div>
            <div className="card-inner" style={{ padding: "24px" }}>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px" }}>
                {exp.bullets.map((b, j) => (
                  <li key={j} style={{ display: "flex", gap: 12, fontSize: 15, color: C.ink2, marginBottom: 11, lineHeight: 1.8, alignItems: "flex-start", fontWeight: 500 }}>
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
        {editMode && <button onClick={() => setExperience([...experience, { role: "New Role", org: "Organization", location: "Location", period: "Period", bullets: ["Responsibility"], award: "" }])} style={{ background: C.amberDim, border: `2px dashed ${C.amber}60`, borderRadius: 12, padding: "20px", fontSize: 15, color: C.amber, cursor: "pointer", fontWeight: 800, textAlign: "center" as const, width: "100%", marginBottom: 32, letterSpacing: "0.01em" }}>+ Add Experience</button>}

        {/* Leadership */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div style={{ width: 3, height: 24, background: `linear-gradient(180deg,${C.amber},${C.teal})`, borderRadius: 2 }} />
            <h3 style={{ fontSize: 19, fontWeight: 800, color: C.navy, margin: 0, fontFamily: "'Roboto', sans-serif", letterSpacing: "0.01em" }}>Leadership & Extracurricular</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 }}>
            {leadership.map((l, i) => (
              <div key={i} style={{ ...cardStyle, display: "flex", gap: 14, padding: "18px 20px", position: "relative", borderTop: `2.5px solid ${i % 2 === 0 ? C.teal : C.amber}` }}>
                {editMode && <button onClick={() => setLeadership(leadership.filter((_, j) => j !== i))} style={{ position: "absolute", top: 6, right: 6, background: C.terraDim, border: `1px solid ${C.terra}40`, borderRadius: 6, color: C.terra, cursor: "pointer", fontSize: 13, padding: "3px 8px", fontWeight: 800 }}>×</button>}
                <div style={{ width: 40, height: 40, borderRadius: 8, background: i % 2 === 0 ? C.tealDim : C.amberDim, border: `1.5px solid ${i % 2 === 0 ? C.teal : C.amber}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18 }}>{l.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <EditableText editMode={editMode} value={l.role} onChange={v => { const nl = [...leadership]; nl[i] = { ...nl[i], role: v }; setLeadership(nl); }}
                    tag="div" style={{ fontSize: 14, fontWeight: 800, color: C.navy, lineHeight: 1.5 }} />
                  <EditableText editMode={editMode} value={l.org} onChange={v => { const nl = [...leadership]; nl[i] = { ...nl[i], org: v }; setLeadership(nl); }}
                    tag="div" style={{ fontSize: 12.5, color: C.ink2, marginTop: 3, lineHeight: 1.4, fontWeight: 500 }} />
                  <div style={{ fontSize: 12, color: i % 2 === 0 ? C.teal : C.amber, marginTop: 6, fontWeight: 800 }}>{l.period}</div>
                </div>
              </div>
            ))}
            {editMode && <button onClick={() => setLeadership([...leadership, { role: "New Role", org: "Organization", period: "Period", icon: "⭐" }])} style={{ background: C.amberDim, border: `2px dashed ${C.amber}60`, borderRadius: 12, padding: "20px", fontSize: 15, color: C.amber, cursor: "pointer", fontWeight: 800, textAlign: "center" as const, letterSpacing: "0.01em" }}>+ Add Leadership</button>}
          </div>
        </div>

        <Hr />

        {/* ─── WORKSHOPS & SEMINARS ─── */}
        <SecHead id="workshops">Workshops & Seminars</SecHead>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 32 }}>
          {workshops.map((w, i) => (
            <div key={i} style={{ ...cardStyle, borderLeft: `4px solid ${C.teal}`, position: "relative" }}>
              {editMode && <button onClick={() => setWorkshops(workshops.filter((_, j) => j !== i))} style={{ position: "absolute", top: 8, right: 8, background: C.terraDim, border: `1px solid ${C.terra}40`, borderRadius: 6, color: C.terra, cursor: "pointer", fontSize: 13, padding: "3px 8px", fontWeight: 800 }}>×</button>}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <EditableText editMode={editMode} value={w.title} onChange={v => { const nw = [...workshops]; nw[i].title = v; setWorkshops(nw); }}
                    tag="div" style={{ fontSize: 16, fontWeight: 800, color: C.navy, marginBottom: 6, lineHeight: 1.6 }} />
                  <EditableText editMode={editMode} value={w.description} onChange={v => { const nw = [...workshops]; nw[i].description = v; setWorkshops(nw); }} multiline
                    tag="div" style={{ fontSize: 14, color: C.ink2, marginBottom: 10, lineHeight: 1.8, fontWeight: 500 }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: C.ink2 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center", fontWeight: 600 }}>
                  <span style={{ fontSize: 16 }}>🏛</span>
                  <EditableText editMode={editMode} value={w.organizer} onChange={v => { const nw = [...workshops]; nw[i].organizer = v; setWorkshops(nw); }}
                    style={{ fontWeight: 700, color: C.teal }} />
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", fontWeight: 600 }}>
                  <span style={{ fontSize: 16 }}>📅</span>
                  <EditableText editMode={editMode} value={w.date} onChange={v => { const nw = [...workshops]; nw[i].date = v; setWorkshops(nw); }}
                    style={{ fontWeight: 700 }} />
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", fontWeight: 600, background: C.tealDim, color: C.teal, padding: "3px 10px", borderRadius: 5 }}>
                  <span style={{ fontSize: 14 }}>💻</span>
                  <EditableText editMode={editMode} value={w.mode} onChange={v => { const nw = [...workshops]; nw[i].mode = v; setWorkshops(nw); }}
                    style={{ fontWeight: 700, color: C.teal }} />
                </div>
              </div>
            </div>
          ))}
          {editMode && <button onClick={() => setWorkshops([...workshops, { title: "Workshop Title", description: "Workshop description", organizer: "Organizer", date: "Date", mode: "Mode" }])} style={{ background: C.tealDim, border: `2px dashed ${C.teal}60`, borderRadius: 12, padding: "20px", fontSize: 15, color: C.teal, cursor: "pointer", fontWeight: 800, textAlign: "center" as const, letterSpacing: "0.01em" }}>+ Add Workshop</button>}
        </div>

        <Hr />

        {/* ─── SKILLS ─── */}
        <SecHead id="skills">Skills & Training</SecHead>
        <div className="skills-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 16 }}>
          <div style={{ ...cardStyle, borderTop: `3px solid ${C.navy}` }}>
            <div style={{ fontSize: 11, color: C.navy, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 18, fontWeight: 800 }}>Statistical Software</div>
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
          <div style={{ fontSize: 11, color: C.teal, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 20, fontWeight: 800 }}>Training & Development</div>
          {trainings.map((t, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 0", borderBottom: i < trainings.length - 1 ? `1px solid ${C.border}` : "none", gap: 14, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 13, alignItems: "center", flex: 1 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: i % 2 === 0 ? C.tealDim : C.amberDim, border: `1.5px solid ${i % 2 === 0 ? C.teal : C.amber}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>📚</div>
                <EditableText editMode={editMode} value={t.title} onChange={v => { const nt = [...trainings]; nt[i] = { ...nt[i], title: v }; setTrainings(nt); }}
                  style={{ fontSize: 14, color: C.ink2, fontWeight: 600 }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13, color: C.ink2, whiteSpace: "nowrap", fontWeight: 700, background: C.borderLight, padding: "4px 12px", borderRadius: 5 }}>{t.period}</span>
                {editMode && <button onClick={() => setTrainings(trainings.filter((_, j) => j !== i))} style={{ background: C.terraDim, border: `1px solid ${C.terra}40`, borderRadius: 6, color: C.terra, cursor: "pointer", fontSize: 13, padding: "3px 8px", fontWeight: 800 }}>×</button>}
              </div>
            </div>
          ))}
          {editMode && <button onClick={() => setTrainings([...trainings, { title: "New Training", period: "Period" }])} style={{ background: C.tealDim, border: `2px dashed ${C.teal}60`, borderRadius: 8, padding: "14px", fontSize: 14, color: C.teal, cursor: "pointer", fontWeight: 800, textAlign: "center" as const, width: "100%", marginTop: 16, letterSpacing: "0.01em" }}>+ Add Training</button>}
        </div>

        <div id="contact" style={{
          background: C.heroGrad, borderRadius: 16, padding: "5rem 2rem", marginTop: 40,
          textAlign: "center", position: "relative", overflow: "hidden",
          border: `1px solid ${C.border}`,
          boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)"
        }}>
          <div style={{ position: "absolute", top: -100, left: -100, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle,${C.teal}15,transparent 70%)` }} />
          <div style={{ position: "absolute", bottom: -100, right: -100, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle,${C.amber}15,transparent 70%)` }} />

          <div style={{ position: "relative", zIndex: 1, maxWidth: 650, margin: "0 auto", textAlign: "left" }}>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <h2 style={{ fontSize: "clamp(1.9rem,5vw,2.7rem)", fontWeight: 900, color: C.navy, marginBottom: 18, letterSpacing: "-0.02em" }}>Get In Touch</h2>
              <p style={{ fontSize: 17, color: C.ink2, opacity: 0.85, lineHeight: 1.7, fontWeight: 500 }}>
                Have a question or want to collaborate? Send me a message below.
              </p>
            </div>

            <form id="contact-form" onSubmit={(e) => {
              e.preventDefault();
              const mailtoUrl = `mailto:${person.email}?subject=${encodeURIComponent(formData.subject || "Contact from Portfolio")}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`)}`;
              window.location.href = mailtoUrl;
            }} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
              <div style={{ gridColumn: "span 1" }}>
                <label style={{ display: "block", color: C.navy, fontSize: 14, fontWeight: 700, marginBottom: 10, letterSpacing: "0.01em" }}>Name</label>
                <input type="text" required placeholder="Your Name" value={formData.name} name="name" onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: "100%", background: "white", border: `1.5px solid ${C.border}`, borderRadius: 9, padding: "13px 16px", color: C.ink, fontSize: 14, fontWeight: 500, outline: "none", boxShadow: "0 2px 6px rgba(0,0,0,0.03)", transition: "all 0.2s" }} />
              </div>
              <div style={{ gridColumn: "span 1" }}>
                <label style={{ display: "block", color: C.navy, fontSize: 14, fontWeight: 700, marginBottom: 10, letterSpacing: "0.01em" }}>Email</label>
                <input type="email" required placeholder="Your Email" value={formData.email} name="email" onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: "100%", background: "white", border: `1.5px solid ${C.border}`, borderRadius: 9, padding: "13px 16px", color: C.ink, fontSize: 14, fontWeight: 500, outline: "none", boxShadow: "0 2px 6px rgba(0,0,0,0.03)", transition: "all 0.2s" }} />
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ display: "block", color: C.navy, fontSize: 14, fontWeight: 700, marginBottom: 10, letterSpacing: "0.01em" }}>Subject</label>
                <input type="text" placeholder="Subject" value={formData.subject} name="subject" onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  style={{ width: "100%", background: "white", border: `1.5px solid ${C.border}`, borderRadius: 9, padding: "13px 16px", color: C.ink, fontSize: 14, fontWeight: 500, outline: "none", boxShadow: "0 2px 6px rgba(0,0,0,0.03)", transition: "all 0.2s" }} />
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ display: "block", color: C.navy, fontSize: 14, fontWeight: 700, marginBottom: 10, letterSpacing: "0.01em" }}>Message</label>
                <textarea required placeholder="Your Message" rows={5} value={formData.message} name="message" onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  style={{ width: "100%", background: "white", border: `1.5px solid ${C.border}`, borderRadius: 9, padding: "13px 16px", color: C.ink, fontSize: 14, fontWeight: 500, outline: "none", resize: "vertical", boxShadow: "0 2px 6px rgba(0,0,0,0.03)", transition: "all 0.2s", fontFamily: "'Roboto', sans-serif" }} />
              </div>
              <div style={{ gridColumn: "span 2", textAlign: "center", marginTop: 14 }}>
                <button type="submit" style={{
                  background: C.navy, color: "white", padding: "18px 56px", borderRadius: 10,
                  fontSize: 16, fontWeight: 800, border: "none", cursor: "pointer", letterSpacing: "0.02em",
                  boxShadow: `0 12px 28px -8px ${C.navy}50`,
                  transition: "all 0.3s", textTransform: "uppercase"
                }}>
                  Send Message 🚀
                </button>
              </div>
            </form>
          </div>
       </div>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ textAlign: "center", padding: "3rem 2.5rem", borderTop: `1px solid ${C.border}`, color: C.muted, fontSize: 13, fontWeight: 600, background: C.surfaceCard, letterSpacing: "0.03em" }}>
        © {new Date().getFullYear()} {person.name} · {person.title} · {person.location}
      </footer>
    </div>
  );
}