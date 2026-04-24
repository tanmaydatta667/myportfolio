import { useState, useRef, useEffect, useCallback } from "react";
import type { CSSProperties, ReactNode, KeyboardEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { portfolioAPI } from "./api";

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

const C: Record<string, string> = {
  navy: "#0e3d2f", navy2: "#145c44", navy3: "#1a7050", navyMid: "#1b6645",
  surface: "#f4faf7", surfaceCard: "#ffffff", surfaceAlt: "#eaf5ef",
  border: "#d1e8dc", borderLight: "#e4f2eb",
  ink: "#0e2a1e", ink2: "#2d5243", muted: "#6b9980",
  amber: "#0d9e72", amberBold: "#0a7d5a", amberDim: "rgba(13,158,114,0.10)", amberGlow: "rgba(13,158,114,0.18)",
  teal: "#2e8b6b", tealLight: "#38a882", tealDim: "rgba(46,139,107,0.10)", tealGlow: "rgba(46,139,107,0.18)",
  terra: "#4a7c6a", terraDim: "rgba(74,124,106,0.12)",
  gold: "#b08c1a", goldDim: "rgba(176,140,26,0.10)",
  heroGrad: "linear-gradient(135deg,#e8f5ef 0%,#d4ede0 50%,#e0f5ea 100%)",
  cardGrad: "linear-gradient(135deg,#f4faf7,#ffffff)",
};

const NAV = ["About", "Education", "Publications", "Research", "Conferences", "Experience", "Skills", "Contact"];

/* ─── DEFAULT DATA ─── */
const DEFAULT_DATA = {
  person: {
    name: "Tanmay Datta", title: "Agricultural Economist",
    institution: "Sher-e-Bangla Agricultural University", location: "Dhaka-1207, Bangladesh",
    email: "tanmaydatta67@gmail.com", phone: "(+880) 1758279651",
    about: `I am a graduate in Agricultural Economics from Sher-e-Bangla Agricultural University, Bangladesh, with a strong research focus on food and nutrition security, climate-smart agriculture, and development economics. I possess practical experience in both field-based and quantitative research, including primary data collection, data management, and advanced statistical and machine learning analysis using R, SPSS, and Stata.
I have contributed to peer-reviewed publications and ongoing research projects addressing agricultural productivity, climate adaptation, and socio-economic development. I am committed to producing rigorous, data-driven research that informs policy and supports sustainable and inclusive development.`,
    interests: ["Development Economics", "Agricultural Productivity", "Climate Resilience", "Food & Nutrition Security", "Household Welfare", "Econometrics", "Machine Learning in Agriculture"],
    links: [
      { label: "LinkedIn", url: "https://linkedin.com/in/tanmay-datta-a7a23719b", icon: "in" },
      { label: "Google Scholar", url: "https://scholar.google.com/citations?user=fNbF88wAAAAJ&hl=en", icon: "gs" },
      { label: "ResearchGate", url: "https://www.researchgate.net/profile/Tanmay-Datta-3", icon: "rg" },
      { label: "ORCID", url: "https://orcid.org/0009-0000-5548-4426", icon: "or" },
    ] as Link[],
    image: "https://i.ibb.co.com/0RcCkzb9/tanmaypic.png",
  },
  publications: [
    { authors: "Sarker, M.M.R., Aleen, M.J. & Datta, T.", year: 2025, title: "Productivity of Food and Self-Sufficiency in Rice Production in Bangladesh", journal: "Economics", details: "12(3), pp. 214–226", url: "https://www.davidpublisher.com/index.php/Home/Article/index?id=52177.html" },
    { authors: "Sarker, M.M.R., Aleen, M.J. & Datta, T.", year: 2025, title: "Agricultural Transformation and Its Contribution to Economic Development in South Asian and African Countries", journal: "Asian Journal of Advances in Agricultural Research", details: "25(1), pp. 19–31", url: "https://journalajaar.com/index.php/AJAAR/article/view/577" },
  ] as Publication[],
  underReview: [
    { title: "Determinants of Climate-Smart Agriculture (CSA) in Mushroom Farming: Dual Application of Bayesian and Machine Learning Approach", journal: "Scientific Reports" },
    { title: "Multilevel Model Assessing Women's ICT Adoption in Bangladesh", journal: "Social Sciences & Humanities" },
    { title: "Evaluating Machine Learning Models for Intimate Partner Violence Detection in Bangladesh", journal: "Sociology" },
    { title: "The Impact of Climate Change and Renewable Energy on Agricultural Productivity in Bangladesh: An Empirical Assessment Using ARDL Approach", journal: "Discover Sustainability" },
  ] as ReviewItem[],
  workingPapers: [
    { title: "Pathways from Household Food Insecurity and Undernutrition to Under-Five Mortality: Systematic Evidence from Asian Countries", role: "First Author" },
    { title: "Child Education in Indigenous Communities: Barriers, Enablers and Policy Responses Across South Asian Countries", role: "First Author" },
    { title: "Climate-Smart Agriculture and Household Well-Being: Food Security, Poverty and Resilience Outcomes in Asia and Africa", role: "First Author" },
    { title: "Crop Insurance: Why Are Farmers Reluctant to Adopt Crop Insurance Over Traditional Risk Management Strategies?", role: "Co-Author" },
    { title: "The U.S. Withdrawal from the Paris Agreement: Implications for Global Climate Finance and Carbon Emission Space", role: "Co-Author" },
    { title: "The Role of Women's Asset Ownership in Child Health and Nutrition", role: "Co-Author" },
    { title: "Household Food Security, Determinants and Coping Strategies Among Smallholder Farmers in Riverbank and Haor Areas of Bangladesh", role: "Co-Author" },
    { title: "Data-Driven IoT Applications in Livestock Farming: Evolution, Adoption, and Economic Impact", role: "Co-Author" },
    { title: "Transboundary Animal Diseases and Their Economic Impact on Smallholder Livestock Systems", role: "Co-Author" },
  ] as WorkingPaper[],
  research: [
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
  ] as ResearchBlock[],
  conferences: [
    { type: "Oral Presentation", event: "CUKUROVA 16th International Scientific Research Conference", location: "Adana, Türkiye (Online)", date: "Nov 2025", note: "Household food security & climate change adaptation in haor and riverbank areas of Bangladesh" },
    { type: "Abstract Accepted", event: "6th International Conference on Agriculture, Food Security and Safety 2025 (Hybrid)", location: "Kuala Lumpur, Malaysia", date: "Aug 2025", note: "" },
    { type: "Poster Presentation", event: "7th International Scientific Conference on Food Safety and Health (ISCFSH)", location: "Bangladesh", date: "May 2025", note: "Organised by Bangladesh Society for Safe Food (BSSF)" },
    { type: "Abstract Accepted", event: "International Conference on Smart Agriculture, Environment and Global Warming (SAEGW-2025)", location: "Daegu, South Korea (Hybrid)", date: "May 2025", note: "International Society for Research (ISR)" },
  ] as Conference[],
  experience: [{
    role: "Junior Executive — Communication & Public Relations",
    org: "Greeniculture Agrotech Limited", location: "Dhaka, Bangladesh",
    period: "May 2021 – March 2023",
    bullets: ["Supported corporate communication and public relations activities", "Prepared notices, content, and stakeholder communications", "Coordinated with internal teams to maintain professional relationships"],
    award: "Best Employee of the Month — September 2021",
  }] as ExperienceItem[],
  leadership: [
    { role: "Club Development Adviser", org: "ICT & Career Development Club, SAU", period: "Feb 2025 – Present", icon: "🏛" },
    { role: "President", org: "BADHAN Voluntary Blood Donors' Organisation, SAU Unit", period: "Jan 2023 – Dec 2023", icon: "🩸" },
    { role: "Secretary", org: "Rotaract Club of Dhaka Mid City Green", period: "Jul 2023 – Jun 2024", icon: "🔄" },
    { role: "Zonal Secretary, Zone 3A", org: "Rotaract District Organisation 3281, Bangladesh", period: "May 2023 – May 2024", icon: "🌐" },
    { role: "Vice-President", org: "Entrepreneurship Development Club, SAU", period: "May 2023 – Feb 2025", icon: "💡" },
    { role: "Head of Event Management", org: "Hult Prize at SAU", period: "Aug 2020 – Jul 2021", icon: "🏆" },
  ] as LeadershipItem[],
  skills: ["R (R Programming)", "Stata", "SPSS", "MS Word / Excel / PowerPoint"],
  competencies: ["Econometric Analysis", "Survey Design", "Data Cleaning", "Academic Writing", "Policy Writing", "Machine Learning", "R Programming", "SPSS Modelling"],
  trainings: [
    { title: "Agri-Science Leadership Development Training (Virtual)", period: "Nov–Dec 2020" },
    { title: "SPSS Training for Agricultural Experiments and Research", period: "Nov 2024 – Jan 2025" },
    { title: "Training on Data Analysis (R and SPSS)", period: "May 7–8, 2025" },
  ] as Training[],
  workshops: [
    { title: "Turning SDGs into Local Action: Lessons from University-Led Climate and Planetary Health Initiatives", description: "Pre-conference workshop exploring sustainable development goals and their local implementation through university-led climate and planetary health initiatives.", organizer: "International Conference on Sustainable Development Goals (ICSDG 2026)", date: "Feb 26, 2026", mode: "Online" },
  ] as Workshop[],
  education: [
    { degree: "B.Sc. (Hons.) in Agricultural Economics", school: "Sher-e-Bangla Agricultural University", location: "Dhaka 1207, Bangladesh", year: "Passing year: 2022; Result Published: 2024" },
    { degree: "Higher Secondary Certificate (HSC), Science", school: "Notre Dame College", location: "Dhaka, Bangladesh", year: "Passing year: 2017" },
    { degree: "Secondary School Certificate (SSC), Science", school: "Comilla Zilla School", location: "Cumilla, Bangladesh", year: "Passing year: 2015" },
  ] as EducationItem[],
  tests: [
    { name: "GRE General Test", score: "" },
    { name: "IELTS", score: "" },
  ] as TestItem[],
  cvUrl: "",
};

function loadData() { return DEFAULT_DATA; }

/* ─── Editable text ─── */
function EditableText({ value, onChange, tag: Tag = "span", style, editMode, multiline, placeholder }: {
  value: string; onChange: (v: string) => void; tag?: any; style?: CSSProperties;
  editMode: boolean; multiline?: boolean; placeholder?: string;
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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !multiline) save();
      if (e.key === "Escape") { setDraft(value); setEditing(false); }
    };
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

function SecHead({ children, id }: { children: string; id: string }) {
  return (
    <div className="sec-head" id={id} style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28, marginTop: 10 }}>
      <h2 style={{ fontSize: "clamp(1.3rem,4vw,1.75rem)", fontWeight: 800, color: C.navy, margin: 0, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{children}</h2>
      <div style={{ flex: 1, height: 2, background: `linear-gradient(90deg,${C.teal},${C.teal}20,transparent)` }} />
    </div>
  );
}
function Hr() { return <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${C.border},transparent)`, margin: "3.2rem 0" }} />; }
function Tag({ children, color = C.teal, bg = C.tealDim }: { children: ReactNode; color?: string; bg?: string }) {
  return <span style={{ display: "inline-block", padding: "5px 14px", borderRadius: 6, fontSize: 12, fontWeight: 700, color, background: bg, margin: "4px 4px 4px 0", letterSpacing: "0.03em", border: `1.5px solid ${color}30` }}>{children}</span>;
}

function SaveToast({ show }: { show: boolean }) {
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: C.navy, color: "white", padding: "12px 24px", borderRadius: 10,
      fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 10,
      boxShadow: "0 8px 30px rgba(0,0,0,0.22)",
      transform: show ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
      opacity: show ? 1 : 0,
      transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
      pointerEvents: "none",
    }}>
      <span style={{ fontSize: 18 }}>✅</span> Changes saved!
    </div>
  );
}

/* ═══════════════════════════════════════════ */
export default function Portfolio() {
  const location = useLocation();
  const navigate = useNavigate();
  const editMode = location.pathname === "/edit";

  const [active, setActive] = useState("about");
  const [menuOpen, setMenuOpen] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cvUploading, setCvUploading] = useState(false);

  const initial = loadData();
  const [person, setPerson] = useState(initial.person);
  const [publications, setPublications] = useState<Publication[]>(initial.publications);
  const [underReview, setUnderReview] = useState<ReviewItem[]>(initial.underReview);
  const [workingPapers, setWorkingPapers] = useState<WorkingPaper[]>(initial.workingPapers);
  const [research, setResearch] = useState<ResearchBlock[]>(initial.research);
  const [conferences, setConferences] = useState<Conference[]>(initial.conferences);
  const [experience, setExperience] = useState<ExperienceItem[]>(initial.experience);
  const [leadership, setLeadership] = useState<LeadershipItem[]>(initial.leadership);
  const [skills, setSkills] = useState<string[]>(initial.skills);
  const [competencies, setCompetencies] = useState<string[]>(initial.competencies);
  const [trainings, setTrainings] = useState<Training[]>(initial.trainings);
  const [workshops, setWorkshops] = useState<Workshop[]>(initial.workshops);
  const [education, setEducation] = useState<EducationItem[]>(initial.education);
  const [tests, setTests] = useState<TestItem[]>(initial.tests);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [openProj, setOpenProj] = useState<Record<string, boolean>>({});
  const [pubTab, setPubTab] = useState("published");
  const [cvUrl, setCvUrl] = useState<string>("");

  const downloadCV = useCallback(async () => {
    if (cvUrl) {
      try {
        const response = await fetch(cvUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${person.name.replace(/ /g, "_")}_CV.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Download failed:", error);
        window.open(cvUrl, '_blank'); // Fallback
      }
    } else {
      alert("Please provide a CV URL in Edit Mode first!");
    }
  }, [cvUrl, person.name]);

  /* ─── Save all state to MongoDB ─── */
  const saveAll = useCallback(() => {
    const data = {
      person, publications, underReview, workingPapers,
      research, conferences, experience, leadership,
      skills, competencies, trainings, workshops, education, tests,cvUrl,
    };
    portfolioAPI.savePortfolio(data).then(result => {
      if (result) {
        setHasUnsaved(false);
        setSaveToast(true);
        setTimeout(() => setSaveToast(false), 2500);
      } else {
        alert("Save failed. Please check if the backend server is running.");
      }
    });
  }, [person, publications, underReview, workingPapers, research, conferences, experience, leadership, skills, competencies, trainings, workshops, education, tests, cvUrl]);

  /* ─── Reset to defaults ─── */
  const resetAll = () => {
    if (!window.confirm("Reset ALL data to defaults? This cannot be undone.")) return;
    const resetData = DEFAULT_DATA;
    portfolioAPI.savePortfolio(resetData).then(() => {
      setPerson(resetData.person);
      setPublications(resetData.publications);
      setUnderReview(resetData.underReview);
      setWorkingPapers(resetData.workingPapers);
      setResearch(resetData.research);
      setConferences(resetData.conferences);
      setExperience(resetData.experience);
      setLeadership(resetData.leadership);
      setSkills(resetData.skills);
      setCompetencies(resetData.competencies);
      setTrainings(resetData.trainings);
      setWorkshops(resetData.workshops);
      setEducation(resetData.education);
      setTests(resetData.tests);
      setCvUrl(resetData.cvUrl);
    });
    const d = DEFAULT_DATA;
    setPerson(d.person); setPublications(d.publications); setUnderReview(d.underReview);
    setWorkingPapers(d.workingPapers); setResearch(d.research); setConferences(d.conferences);
    setExperience(d.experience); setLeadership(d.leadership); setSkills(d.skills);
    setCompetencies(d.competencies); setTrainings(d.trainings); setWorkshops(d.workshops);
    setEducation(d.education); setTests(d.tests);
    setSaveToast(true); setTimeout(() => setSaveToast(false), 2500);
  };

  useEffect(() => {
    if (editMode) setHasUnsaved(true);
  }, [person, publications, underReview, workingPapers, research, conferences, experience, leadership, skills, competencies, trainings, workshops, education, tests]);

  useEffect(() => {
    const loadFromAPI = async () => {
      setIsLoading(true);
      const data = await portfolioAPI.getPortfolio();

      if (data) {
        if (data.cvUrl) setCvUrl(data.cvUrl);
        setPerson(data.person);
        setPublications(data.publications);
        setUnderReview(data.underReview);
        setWorkingPapers(data.workingPapers);
        setResearch(data.research);
        setConferences(data.conferences);
        setExperience(data.experience);
        setLeadership(data.leadership);
        setSkills(data.skills);
        setCompetencies(data.competencies);
        setTrainings(data.trainings);
        setWorkshops(data.workshops);
        setEducation(data.education);
        setTests(data.tests);
      }
      setIsLoading(false);
    };
    loadFromAPI();
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: "-30% 0px -65% 0px" }
    );
    NAV.forEach(n => { const el = document.getElementById(n.toLowerCase()); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const updatePerson = (key: string, val: any) => setPerson((p: typeof person) => ({ ...p, [key]: val }));

  const cardStyle: CSSProperties = {
    background: C.surfaceCard, border: `1px solid ${C.border}`, borderRadius: 12,
    padding: "22px 26px", transition: "all 0.25s ease",
    boxShadow: "0 2px 8px rgba(14,61,47,0.08), 0 8px 24px rgba(14,61,47,0.12)",
  };

  const AddBtn = ({ onClick, label, color = C.teal, bg = C.tealDim }: { onClick: () => void; label: string; color?: string; bg?: string }) => (
    <button onClick={onClick} style={{
      background: bg, border: `2px dashed ${color}60`, borderRadius: 12, padding: "16px",
      fontSize: 14, color, cursor: "pointer", fontWeight: 800, textAlign: "center" as const,
      width: "100%", letterSpacing: "0.01em", transition: "all 0.18s",
    }}>{label}</button>
  );

  // ── CV Download Button component ──
  const CvButton = ({ size = "sm" }: { size?: "sm" | "lg" }) => (
    <button
      onClick={downloadCV}
      style={{
        display: "flex", alignItems: "center", gap: size === "lg" ? 10 : 7,
        padding: size === "lg" ? "11px 26px" : "8px 16px",
        borderRadius: size === "lg" ? 9 : 7,
        border: size === "lg" ? `1.5px solid ${C.navy}` : `1.5px solid ${C.amber}60`,
        background: size === "lg" ? C.navy : C.amberDim,
        color: size === "lg" ? "white" : C.amberBold,
        fontSize: size === "lg" ? 14 : 13,
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.2s",
        whiteSpace: "nowrap" as const,
        letterSpacing: "0.01em",
      }}
    >
      <svg width={size === "lg" ? 16 : 14} height={size === "lg" ? 16 : 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      {cvUrl ? (size === "lg" ? "Download CV" : "CV") : (size === "lg" ? "Download CV" : "CV")}
    </button>
  );

  return (
    <div style={{ fontFamily: "'Roboto', sans-serif", background: C.surface, minHeight: "100vh", color: C.ink }}>
      <SaveToast show={saveToast} />

      {isLoading && (
        <div style={{ position: "fixed", inset: 0, background: C.surface, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📁</div>
            <div style={{ fontSize: 14, color: C.ink2, fontWeight: 600 }}>Loading your portfolio...</div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        a:hover { opacity: 0.82; }
        button { font-family: 'Roboto', sans-serif; cursor: pointer; }
        #header-nav::-webkit-scrollbar { display: none; }
        #header-nav { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 1150px) {
          header { padding: 0 1.25rem !important; height: 64px !important; }
          #header-nav {
            position: fixed; top: 64px; left: 0; width: 100%; height: calc(100vh - 64px);
            background: white; flex-direction: column !important; 
            padding: 2.5rem !important; gap: 0.8rem !important;
            border-top: 1px solid ${C.border}; 
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            display: ${menuOpen ? "flex" : "none"} !important;
            overflow-y: auto; z-index: 299;
            align-items: stretch !important;
          }
          #header-nav button { width: 100%; text-align: center; padding: 12px !important; font-size: 15px !important; }
          #menu-toggle { display: flex !important; }
          #hero-container { flex-direction: column; text-align: center; gap: 2rem !important; padding: 4rem 1.5rem !important; }
          #hero-text { align-items: center; }
          #hero-avatar { width: 140px !important; height: 140px !important; }
          .hero-links { justify-content: center !important; gap: 8px !important; }
          main { padding: 3rem 1.5rem !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .sec-head { flex-direction: column; align-items: flex-start !important; gap: 10px !important; }
          .publication-tabs { width: 100% !important; display: flex !important; flex-wrap: wrap; gap: 8px; }
          .publication-tabs button { flex: 1; min-width: 120px; }
          .portfolio-card { padding: 18px 20px !important; }
          #contact-form { grid-template-columns: 1fr !important; }
          #contact-form > div { grid-column: span 1 !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
          h1 { font-size: 2.1rem !important; }
          #hero-avatar { width: 120px !important; height: 120px !important; }
        }
      `}</style>

      {/* ═══ TOP BAR ═══ */}
      <header style={{
        position: "sticky", top: 0, zIndex: 300,
        background: "rgba(244,250,247,0.88)", backdropFilter: "blur(20px) saturate(160%)",
        borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", padding: "0 2.5rem", justifyContent: "space-between", gap: "1rem",
        minHeight: 62,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: C.amber, flexShrink: 0, letterSpacing: "0.04em" }}>TD</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, lineHeight: 1.2 }}>Tanmay Datta</div>
            <div style={{ fontSize: 11, color: C.muted, lineHeight: 1, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Agricultural Economist</div>
          </div>
        </div>

        <button id="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} style={{
          display: "none", alignItems: "center", justifyContent: "center",
          width: 40, height: 40, borderRadius: 8, border: `1.5px solid ${C.border}`,
          background: menuOpen ? C.navy : "white", color: menuOpen ? C.amber : C.navy,
          cursor: "pointer", transition: "all 0.2s",
        }}>
          {menuOpen
            ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>}
        </button>

        <div id="header-nav" style={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "nowrap", justifyContent: "flex-end" }}>
          {NAV.map(n => (
            <button key={n} onClick={() => { scrollTo(n.toLowerCase()); setMenuOpen(false); }} style={{
              padding: "6px 12px", borderRadius: 7, fontSize: 13, border: "none", cursor: "pointer",
              background: active === n.toLowerCase() ? C.navy : "transparent",
              color: active === n.toLowerCase() ? C.amber : C.muted,
              fontWeight: active === n.toLowerCase() ? 700 : 500, transition: "all 0.18s",
            }}>{n}</button>
          ))}


          {editMode && (
            <button onClick={saveAll} style={{
              marginLeft: 4, padding: "8px 18px", borderRadius: 7, fontSize: 13, fontWeight: 800,
              border: `1.5px solid ${hasUnsaved ? C.navy : C.border}`,
              background: hasUnsaved ? C.navy : C.tealDim,
              color: hasUnsaved ? "white" : C.teal, transition: "all 0.2s",
              position: "relative",
            }}>
              {hasUnsaved ? "💾 Save" : "✅ Saved"}
              {hasUnsaved && (
                <span style={{ position: "absolute", top: -4, right: -4, width: 10, height: 10, background: C.amber, borderRadius: "50%", border: "2px solid white" }} />
              )}
            </button>
          )}

          {editMode && (
            <button onClick={resetAll} style={{
              marginLeft: 4, padding: "8px 14px", borderRadius: 7, fontSize: 12, fontWeight: 700,
              border: `1.5px solid ${C.terra}40`, background: C.terraDim,
              color: C.terra, transition: "all 0.2s",
            }} title="Reset all data to defaults">↺ Reset</button>
          )}
        </div>
      </header>

      {/* Edit mode banner */}
      {editMode && (
        <div style={{
          background: `linear-gradient(90deg,${C.navy},${C.navy3})`, color: "white",
          textAlign: "center", padding: "9px 20px", fontSize: 13, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
          letterSpacing: "0.02em",
        }}>
          <span style={{ fontSize: 16 }}>✏️</span>
          <span>Edit mode is <strong>ON</strong> — click any text to edit it. Use <strong>💾 Save</strong> to persist your changes.</span>
          {hasUnsaved && <span style={{ background: C.amber, color: C.navy, fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 5, letterSpacing: "0.05em" }}>UNSAVED CHANGES</span>}
        </div>
      )}

      {/* ═══ HERO ═══ */}
      <div style={{ background: C.heroGrad, padding: "5rem 2.5rem 4.5rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -60, top: -60, width: 320, height: 320, borderRadius: "50%", border: `1px solid rgba(200,133,26,0.15)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 20, top: 20, width: 200, height: 200, borderRadius: "50%", border: `1px solid rgba(26,127,114,0.15)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "35%", bottom: -120, width: 360, height: 360, borderRadius: "50%", background: `radial-gradient(circle,rgba(13,158,114,0.12),transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: -80, top: "20%", width: 280, height: 280, borderRadius: "50%", background: `radial-gradient(circle,rgba(13,158,114,0.08),transparent 70%)`, pointerEvents: "none" }} />

        <div id="hero-container" style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: "3rem", position: "relative", zIndex: 1 }}>
          <div id="hero-avatar" style={{
            width: 150, height: 150, borderRadius: 16,
            background: "rgba(13,158,114,0.12)", border: `2px solid rgba(13,158,114,0.30)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 700, color: C.navy, flexShrink: 0, overflow: "hidden", position: "relative",
          }}>
            {person.image ? <img src={person.image} alt={person.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "TD"}
            {editMode && (
              <div style={{ position: "absolute", bottom: 0, width: "100%", background: "rgba(0,0,0,0.65)", padding: "6px 4px", textAlign: "center" }}>
                <input type="text" placeholder="Image URL" value={person.image || ""} onChange={e => updatePerson("image", e.target.value)}
                  style={{ width: "92%", fontSize: 10, background: "transparent", color: "white", border: "none", outline: "none" }} />
              </div>
            )}
          </div>

          <div id="hero-text" style={{ flex: 1, minWidth: 260 }}>
            <EditableText editMode={editMode} value={person.name} onChange={v => updatePerson("name", v)}
              tag="h1" style={{ fontSize: "clamp(2.2rem,5vw,3rem)", fontWeight: 900, color: C.navy, margin: "0 0 10px", letterSpacing: "-0.03em", display: "block", lineHeight: 1.1 }} />
            <EditableText editMode={editMode} value={person.title} onChange={v => updatePerson("title", v)}
              tag="div" style={{ fontSize: 16, color: C.teal, fontWeight: 700, marginBottom: 6, letterSpacing: "0.01em" }} />
            <EditableText editMode={editMode} value={`${person.institution}, ${person.location}`} onChange={v => { const p = v.split(","); updatePerson("institution", p[0]?.trim() || ""); updatePerson("location", p.slice(1).join(",").trim() || ""); }}
              tag="div" style={{ fontSize: 13, color: C.ink2, marginBottom: 26, letterSpacing: "0.02em", fontWeight: 500 }} />

            <div className="hero-links" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <a href={`mailto:${person.email}`} className="hero-link" style={{ padding: "9px 20px", borderRadius: 8, border: `1.5px solid ${C.amber}60`, color: C.navy, fontSize: 13, textDecoration: "none", background: C.amberDim, fontWeight: 700, letterSpacing: "0.02em", transition: "all 0.2s" }}>
                {editMode
                  ? <input value={person.email} onChange={e => updatePerson("email", e.target.value)} onClick={e => e.preventDefault()} style={{ background: "transparent", border: "none", outline: "none", color: C.navy, fontWeight: 700, fontSize: 13, width: Math.max(160, person.email.length * 8) }} />
                  : person.email}
              </a>
              {person.links.map((l: Link, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <a href={l.url} target="_blank" rel="noreferrer" className="hero-link" style={{ padding: "9px 20px", borderRadius: 8, border: `1.5px solid ${C.border}`, color: C.ink2, fontSize: 13, textDecoration: "none", background: C.surfaceCard, fontWeight: 600, transition: "all 0.2s", letterSpacing: "0.01em" }}>
                    {editMode
                      ? <input value={l.label} onChange={e => { const nl = [...person.links]; nl[i] = { ...nl[i], label: e.target.value }; updatePerson("links", nl); }} onClick={e => e.preventDefault()} style={{ background: "transparent", border: "none", outline: "none", color: C.ink2, fontWeight: 600, fontSize: 13, width: Math.max(60, l.label.length * 8) }} />
                      : l.label}
                  </a>
                  {editMode && (
                    <input value={l.url} onChange={e => { const nl = [...person.links]; nl[i] = { ...nl[i], url: e.target.value }; updatePerson("links", nl); }}
                      placeholder="URL" style={{ background: C.amberDim, border: `1px solid ${C.amber}40`, borderRadius: 6, padding: "5px 10px", fontSize: 11, color: C.ink2, outline: "none", width: 180 }} />
                  )}
                  {editMode && <button onClick={() => updatePerson("links", person.links.filter((_: Link, j: number) => j !== i))} style={{ background: C.terraDim, border: `1px solid ${C.terra}40`, borderRadius: 4, color: C.terra, fontSize: 12, padding: "3px 7px", fontWeight: 800 }}>×</button>}
                </div>
              ))}
              {editMode && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: C.amberDim, border: `1.5px dashed ${C.amber}60`,
                  borderRadius: 9, padding: "8px 16px",
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.amberBold} strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <label style={{ cursor: cvUploading ? "wait" : "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, color: C.navy, fontWeight: 800 }}>
                      {cvUploading ? "Uploading..." : (cvUrl ? "Update CV PDF" : "Upload CV PDF")}
                    </span>
                    <input
                      type="file"
                      accept=".pdf"
                      disabled={cvUploading}
                      style={{ display: "none" }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setCvUploading(true);
                        const result = await portfolioAPI.uploadCV(file);
                        if (result?.url) {
                          setCvUrl(result.url);
                          setHasUnsaved(true);
                        } else {
                          alert("Upload failed. Make sure the file is a PDF and under 5MB.");
                        }
                        setCvUploading(false);
                      }}
                    />
                  </label>
                  {cvUrl && !cvUploading && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 4, borderLeft: `1px solid ${C.amber}40`, paddingLeft: 12 }}>
                      <span style={{ fontSize: 11, color: C.teal, fontWeight: 700 }}>✓ Loaded</span>
                      <button onClick={() => setCvUrl("")} style={{ background: "transparent", border: "none", color: C.terra, cursor: "pointer", fontSize: 14, fontWeight: 800 }}>×</button>
                    </div>
                  )}
                </div>
              )}

              {/* Large CV download button in hero */}
              <CvButton size="lg" />
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MAIN ═══ */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "3.5rem 2.5rem 5rem" }}>

        {/* ─── ABOUT ─── */}
        <SecHead id="about">About</SecHead>
        <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 16, marginBottom: 36 }}>
          {([
            [String(publications.length), "Publications", C.teal, C.tealDim],
            [String(underReview.length), "Under Review", C.terra, C.terraDim],
            [String(workingPapers.length), "In Progress", C.amber, C.amberDim],
            [String(conferences.length), "Conferences", C.navy, "rgba(13,27,42,0.07)"],
          ] as [string,string,string,string][]).map(([n, l, col, bg]) => (
            <div key={l} style={{ background: bg, border: `1.5px solid ${col}35`, borderRadius: 14, textAlign: "center", padding: "24px 16px" }}>
              <div style={{ fontSize: 38, fontWeight: 900, color: col, lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 10, letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1.3, fontWeight: 700 }}>{l}</div>
            </div>
          ))}
        </div>

        <EditableText editMode={editMode} value={person.about} onChange={v => updatePerson("about", v)} multiline
          tag="p" style={{ fontSize: 16, lineHeight: 2, color: C.ink, margin: "0 0 28px", display: "block", fontWeight: 500 }} />

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 14, fontWeight: 800 }}>Research Interests</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {person.interests.map((t: string, i: number) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                {editMode
                  ? <input value={t} onChange={e => { const ni = [...person.interests]; ni[i] = e.target.value; updatePerson("interests", ni); }}
                      style={{ background: C.tealDim, border: `1.5px solid ${C.teal}60`, borderRadius: 6, padding: "6px 14px", fontSize: 13, fontWeight: 700, color: C.teal, outline: "none", width: Math.max(100, t.length * 8) }} />
                  : <Tag>{t}</Tag>}
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
            <div key={i} className="portfolio-card" style={{ ...cardStyle, borderLeft: `4px solid ${i === 0 ? C.navy : i === 1 ? C.teal : C.amber}`, position: "relative" }}>
              {editMode && <button onClick={() => setEducation(education.filter((_, j) => j !== i))} style={{ position: "absolute", top: 8, right: 8, background: C.terraDim, border: `1px solid ${C.terra}40`, borderRadius: 6, color: C.terra, cursor: "pointer", fontSize: 12, padding: "3px 8px", fontWeight: 700 }}>×</button>}
              <EditableText editMode={editMode} value={edu.degree} onChange={v => { const ne = [...education]; ne[i].degree = v; setEducation(ne); }}
                tag="div" style={{ fontSize: 17, fontWeight: 800, color: C.navy, marginBottom: 6 }} />
              <EditableText editMode={editMode} value={edu.school} onChange={v => { const ne = [...education]; ne[i].school = v; setEducation(ne); }}
                tag="div" style={{ fontSize: 15, fontWeight: 700, color: C.teal, marginBottom: 3 }} />
              <EditableText editMode={editMode} value={edu.location} onChange={v => { const ne = [...education]; ne[i].location = v; setEducation(ne); }}
                tag="div" style={{ fontSize: 13, color: C.muted, marginBottom: 6, fontWeight: 500 }} />
              <EditableText editMode={editMode} value={edu.year} onChange={v => { const ne = [...education]; ne[i].year = v; setEducation(ne); }}
                tag="div" style={{ fontSize: 13, color: C.muted }} />
            </div>
          ))}
          {editMode && <AddBtn onClick={() => setEducation([...education, { degree: "Degree Name", school: "University", location: "Location, Country", year: "Year" }])} label="+ Add Education" />}
        </div>

        {/* Standardized Tests */}
        <div style={{ marginBottom: 34 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div style={{ width: 3, height: 24, background: `linear-gradient(180deg,${C.amber},${C.teal})`, borderRadius: 2 }} />
            <h3 style={{ fontSize: 19, fontWeight: 800, color: C.navy, margin: 0 }}>Standardized Tests</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
            {tests.map((t, i) => (
              <div key={i} className="portfolio-card" style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", position: "relative" }}>
                {editMode && <button onClick={() => setTests(tests.filter((_, j) => j !== i))} style={{ position: "absolute", top: -8, right: -8, background: C.terra, color: "white", borderRadius: "50%", width: 20, height: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>}
                <div>
                  <EditableText editMode={editMode} value={t.name} onChange={v => { const nt = [...tests]; nt[i].name = v; setTests(nt); }}
                    tag="div" style={{ fontSize: 15, fontWeight: 800, color: C.navy }} />
                  <EditableText editMode={editMode} value={t.score || (editMode ? "Click to add score" : "")} onChange={v => { const nt = [...tests]; nt[i].score = v; setTests(nt); }}
                    tag="div" style={{ fontSize: 13, color: C.teal, marginTop: 2 }} placeholder="Click to add score" />
                </div>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: C.amberDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📝</div>
              </div>
            ))}
            {editMode && (
              <button onClick={() => setTests([...tests, { name: "Test Name", score: "" }])} style={{ background: C.amberDim, border: `2px dashed ${C.amber}40`, borderRadius: 12, padding: "16px", fontSize: 14, color: C.amber, cursor: "pointer", fontWeight: 700, textAlign: "center" as const }}>+ Add Test</button>
            )}
          </div>
        </div>

        {/* ─── PUBLICATIONS ─── */}
        <SecHead id="publications">Publications</SecHead>
        <div style={{ marginBottom: 26 }}>
          <div className="publication-tabs" style={{ display: "flex", gap: 4, marginBottom: 28, background: C.borderLight, padding: 6, borderRadius: 11, width: "fit-content" }}>
            {([["published","Published",String(publications.length),C.teal],["review","Under Review",String(underReview.length),C.terra],["working","Working Papers",String(workingPapers.length),C.amber]] as [string,string,string,string][]).map(([k,v,count,col]) => (
              <button key={k} onClick={() => setPubTab(k)} style={{
                flex: 1, padding: "10px 20px", borderRadius: 8, fontSize: 14, border: "none", cursor: "pointer",
                background: pubTab === k ? "white" : "transparent",
                color: pubTab === k ? col : C.muted, fontWeight: pubTab === k ? 800 : 600,
                boxShadow: pubTab === k ? "0 3px 12px rgba(0,0,0,0.08)" : "none", transition: "all 0.2s",
                display: "flex", alignItems: "center", gap: 9, justifyContent: "center",
              }}>
                {v} <span style={{ fontSize: 12, fontWeight: pubTab === k ? 700 : 600, background: pubTab === k ? col : C.border, color: pubTab === k ? "white" : C.muted, padding: "2px 8px", borderRadius: 6 }}>{count}</span>
              </button>
            ))}
          </div>

          {pubTab === "published" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {publications.map((p, i) => (
                <div key={i} className="portfolio-card" style={{ ...cardStyle, position: "relative", overflow: "hidden", borderLeft: `3px solid ${C.teal}` }}>
                  {editMode && <button onClick={() => setPublications(publications.filter((_, j) => j !== i))} style={{ position: "absolute", top: 8, right: 8, background: C.terraDim, border: `1px solid ${C.terra}40`, borderRadius: 6, color: C.terra, cursor: "pointer", fontSize: 12, padding: "3px 8px", fontWeight: 700, zIndex: 2 }}>×</button>}
                  <div style={{ position: "absolute", top: 0, right: editMode ? 48 : 0, background: C.navy, color: C.amber, fontSize: 11, fontWeight: 800, padding: "5px 16px", borderRadius: "0 12px 0 10px", letterSpacing: "0.05em" }}>
                    {editMode
                      ? <input type="number" value={p.year} onChange={e => { const np = [...publications]; np[i].year = +e.target.value; setPublications(np); }} style={{ background: "transparent", border: "none", outline: "none", color: C.amber, fontWeight: 800, fontSize: 11, width: 52 }} />
                      : p.year}
                  </div>
                  <EditableText editMode={editMode} value={p.title} onChange={v => { const np = [...publications]; np[i].title = v; setPublications(np); }}
                    tag="div" style={{ fontSize: 16, fontWeight: 800, color: C.navy, lineHeight: 1.6, marginBottom: 10, paddingRight: 56 }} />
                  <EditableText editMode={editMode} value={p.authors} onChange={v => { const np = [...publications]; np[i].authors = v; setPublications(np); }}
                    tag="div" style={{ fontSize: 13, color: C.ink2, marginBottom: 14, fontWeight: 500 }} />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <EditableText editMode={editMode} value={p.journal} onChange={v => { const np = [...publications]; np[i].journal = v; setPublications(np); }}
                        tag="span" style={{ fontWeight: 800, color: C.teal, fontSize: 14 }} />
                      <span style={{ fontSize: 13.5, color: C.muted, fontWeight: 500 }}> — </span>
                      <EditableText editMode={editMode} value={p.details} onChange={v => { const np = [...publications]; np[i].details = v; setPublications(np); }}
                        tag="span" style={{ fontSize: 13, color: C.muted, fontWeight: 500 }} />
                    </div>
                    {editMode
                      ? <input value={p.url} onChange={e => { const np = [...publications]; np[i].url = e.target.value; setPublications(np); }} placeholder="Article URL" style={{ background: C.amberDim, border: `1px solid ${C.amber}40`, borderRadius: 6, padding: "6px 12px", fontSize: 12, color: C.ink2, outline: "none", flex: 1, maxWidth: 320 }} />
                      : <a href={p.url} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: C.amber, border: `1.5px solid ${C.amber}60`, padding: "8px 18px", borderRadius: 7, textDecoration: "none", fontWeight: 800, background: C.amberDim, whiteSpace: "nowrap" }}>View Article →</a>}
                  </div>
                </div>
              ))}
              {editMode && <AddBtn onClick={() => setPublications([...publications, { authors: "Authors", year: new Date().getFullYear(), title: "New Publication Title", journal: "Journal Name", details: "Vol, Pages", url: "#" }])} label="+ Add Publication" color={C.teal} bg={C.tealDim} />}
            </div>
          )}

          {pubTab === "review" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {underReview.map((p, i) => (
                <div key={i} className="portfolio-card" style={{ ...cardStyle, borderLeft: `3px solid ${C.terra}`, position: "relative" }}>
                  {editMode && <button onClick={() => setUnderReview(underReview.filter((_, j) => j !== i))} style={{ position: "absolute", top: 8, right: 8, background: C.terraDim, border: `1px solid ${C.terra}40`, borderRadius: 6, color: C.terra, cursor: "pointer", fontSize: 12, padding: "3px 8px", fontWeight: 700 }}>×</button>}
                  <span style={{ fontSize: 10.5, fontWeight: 700, background: C.terraDim, color: C.terra, padding: "3px 10px", borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Under Review</span>
                  <EditableText editMode={editMode} value={p.title} onChange={v => { const nr = [...underReview]; nr[i].title = v; setUnderReview(nr); }}
                    tag="div" style={{ fontSize: 14.5, fontWeight: 500, color: C.navy, lineHeight: 1.65, marginTop: 10, marginBottom: 6 }} />
                  <EditableText editMode={editMode} value={p.journal} onChange={v => { const nr = [...underReview]; nr[i].journal = v; setUnderReview(nr); }}
                    tag="div" style={{ fontSize: 12, color: C.teal, fontWeight: 700 }} />
                </div>
              ))}
              {editMode && <AddBtn onClick={() => setUnderReview([...underReview, { title: "New Paper Title", journal: "Target Journal" }])} label="+ Add Under Review Paper" color={C.terra} bg={C.terraDim} />}
            </div>
          )}

          {pubTab === "working" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {workingPapers.map((p, i) => (
                <div key={i} className="portfolio-card" style={{ ...cardStyle, display: "flex", gap: 14, alignItems: "flex-start", position: "relative" }}>
                  {editMode && <button onClick={() => setWorkingPapers(workingPapers.filter((_, j) => j !== i))} style={{ position: "absolute", top: 8, right: 8, background: C.terraDim, border: `1px solid ${C.terra}40`, borderRadius: 6, color: C.terra, cursor: "pointer", fontSize: 12, padding: "3px 8px", fontWeight: 700 }}>×</button>}
                  {editMode
                    ? <select value={p.role} onChange={e => { const nw = [...workingPapers]; nw[i].role = e.target.value; setWorkingPapers(nw); }} style={{ background: p.role === "First Author" ? C.tealDim : C.amberDim, color: p.role === "First Author" ? C.teal : C.amber, border: `1px solid ${p.role === "First Author" ? C.teal : C.amber}40`, borderRadius: 6, padding: "4px 8px", fontSize: 11, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
                        <option value="First Author">First Author</option>
                        <option value="Co-Author">Co-Author</option>
                      </select>
                    : <span style={{ fontSize: 11, fontWeight: 700, background: p.role === "First Author" ? C.tealDim : C.amberDim, color: p.role === "First Author" ? C.teal : C.amber, padding: "4px 10px", borderRadius: 4, flexShrink: 0, marginTop: 2, whiteSpace: "nowrap", border: `1px solid ${p.role === "First Author" ? C.teal : C.amber}25` }}>
                        {p.role === "First Author" ? "1st Author" : "Co-Author"}
                      </span>}
                  <EditableText editMode={editMode} value={p.title} onChange={v => { const nw = [...workingPapers]; nw[i].title = v; setWorkingPapers(nw); }}
                    tag="div" style={{ fontSize: 14, fontWeight: 400, color: C.ink2, lineHeight: 1.65, paddingRight: editMode ? 60 : 0 }} />
                </div>
              ))}
              {editMode && <AddBtn onClick={() => setWorkingPapers([...workingPapers, { title: "New Working Paper Title", role: "First Author" }])} label="+ Add Working Paper" color={C.amber} bg={C.amberDim} />}
            </div>
          )}
        </div>

        {/* ─── RESEARCH ─── */}
        <SecHead id="research">Research Experience</SecHead>
        {research.map((block, bi) => (
          <div key={bi} style={{ marginBottom: 34 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: bi === 0 ? C.navy : C.tealDim, border: `1.5px solid ${bi === 0 ? "transparent" : C.teal + "50"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                {bi === 0 ? "🔬" : "📋"}
              </div>
              <div>
                <EditableText editMode={editMode} value={block.role} onChange={v => { const nr = [...research]; nr[bi].role = v; setResearch(nr); }}
                  tag="div" style={{ fontSize: 18, fontWeight: 800, color: C.navy }} />
                <EditableText editMode={editMode} value={block.dept} onChange={v => { const nr = [...research]; nr[bi].dept = v; setResearch(nr); }}
                  tag="div" style={{ fontSize: 13, color: C.ink2, marginTop: 3, fontWeight: 500 }} />
              </div>
              {editMode && <button onClick={() => setResearch(research.filter((_, j) => j !== bi))} style={{ marginLeft: "auto", background: C.terraDim, border: `1px solid ${C.terra}40`, borderRadius: 6, color: C.terra, fontSize: 12, padding: "4px 10px", fontWeight: 700 }}>× Remove Block</button>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {block.projects.map((proj: Project, pi: number) => {
                const k = `${bi}-${pi}`; const isOpen = openProj[k];
                const col = bi === 0 ? C.teal : C.amber; const bg = bi === 0 ? C.tealDim : C.amberDim;
                return (
                  <div key={pi} className="portfolio-card" style={{ ...cardStyle, borderColor: isOpen ? col + "50" : C.border, padding: 0, overflow: "hidden", borderLeftWidth: isOpen ? 3 : 1, borderLeftColor: isOpen ? col : C.border }}>
                    <button onClick={() => setOpenProj(o => ({ ...o, [k]: !o[k] }))} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 20px", background: isOpen ? bg : "transparent", border: "none", cursor: "pointer", textAlign: "left", gap: 14, color: C.ink, transition: "background 0.2s" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, lineHeight: 1.6 }}>{proj.title}</div>
                        <div style={{ fontSize: 13, color: C.ink2, marginTop: 6, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ background: bg, color: col, padding: "3px 11px", borderRadius: 5, fontSize: 12, fontWeight: 800 }}>{proj.period}</span>
                          <span style={{ fontWeight: 500 }}>{proj.funder}</span>
                        </div>
                      </div>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: isOpen ? col : C.border, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                        <span style={{ color: isOpen ? "#fff" : C.muted, fontSize: 14, lineHeight: 1, fontWeight: 700 }}>{isOpen ? "−" : "+"}</span>
                      </div>
                    </button>
                    {isOpen && (
                      <div style={{ padding: "0 20px 16px", borderTop: `1px solid ${C.border}` }}>
                        {editMode && (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "12px 0" }}>
                            <input value={proj.title} onChange={e => { const nr = [...research]; nr[bi].projects[pi].title = e.target.value; setResearch([...nr]); }} placeholder="Project title" style={{ background: C.amberDim, border: `1px solid ${C.amber}40`, borderRadius: 6, padding: "7px 12px", fontSize: 13, color: C.ink, outline: "none" }} />
                            <input value={proj.period} onChange={e => { const nr = [...research]; nr[bi].projects[pi].period = e.target.value; setResearch([...nr]); }} placeholder="Period" style={{ background: C.amberDim, border: `1px solid ${C.amber}40`, borderRadius: 6, padding: "7px 12px", fontSize: 13, color: C.ink, outline: "none" }} />
                            <input value={proj.funder} onChange={e => { const nr = [...research]; nr[bi].projects[pi].funder = e.target.value; setResearch([...nr]); }} placeholder="Funder" style={{ background: C.amberDim, border: `1px solid ${C.amber}40`, borderRadius: 6, padding: "7px 12px", fontSize: 13, color: C.ink, outline: "none", gridColumn: "span 2" }} />
                          </div>
                        )}
                        <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0" }}>
                          {proj.bullets.map((b: string, bi2: number) => (
                            <li key={bi2} style={{ display: "flex", gap: 10, fontSize: 14, color: C.ink2, marginBottom: 10, lineHeight: 1.8, alignItems: "flex-start", fontWeight: 500 }}>
                              <span style={{ color: col, fontWeight: 800, flexShrink: 0, marginTop: 1.5, fontSize: 16 }}>›</span>
                              <EditableText editMode={editMode} value={b}
                                onChange={v => { const nr = [...research]; nr[bi].projects[pi].bullets[bi2] = v; setResearch([...nr]); }}
                                style={{ fontSize: 14, color: C.ink2, flex: 1, fontWeight: 500 }} />
                              {editMode && <button onClick={() => { const nr = [...research]; nr[bi].projects[pi].bullets = nr[bi].projects[pi].bullets.filter((_: string, j: number) => j !== bi2); setResearch([...nr]); }} style={{ background: "none", border: "none", color: C.terra, cursor: "pointer", fontSize: 16, padding: 0, flexShrink: 0, fontWeight: 700 }}>×</button>}
                            </li>
                          ))}
                        </ul>
                        {editMode && (
                          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                            <button onClick={() => { const nr = [...research]; nr[bi].projects[pi].bullets = [...nr[bi].projects[pi].bullets, "New bullet point"]; setResearch([...nr]); }} style={{ background: C.amberDim, border: `1.5px dashed ${C.amber}40`, borderRadius: 7, padding: "6px 16px", fontSize: 13, color: C.amber, cursor: "pointer", fontWeight: 700 }}>+ Add Bullet</button>
                            <button onClick={() => { const nr = [...research]; nr[bi].projects[pi] = { ...nr[bi].projects[pi] }; nr[bi].projects = nr[bi].projects.filter((_: Project, j: number) => j !== pi); setResearch([...nr]); }} style={{ background: C.terraDim, border: `1.5px solid ${C.terra}40`, borderRadius: 7, padding: "6px 16px", fontSize: 13, color: C.terra, cursor: "pointer", fontWeight: 700 }}>× Remove Project</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {editMode && (
                <button onClick={() => { const nr = [...research]; nr[bi].projects = [...nr[bi].projects, { period: "Period", title: "New Project Title", funder: "Funder", bullets: ["Key contribution"] }]; setResearch([...nr]); }} style={{ background: bi === 0 ? C.tealDim : C.amberDim, border: `2px dashed ${bi === 0 ? C.teal : C.amber}60`, borderRadius: 10, padding: "13px", fontSize: 13, color: bi === 0 ? C.teal : C.amber, cursor: "pointer", fontWeight: 800, textAlign: "center" as const }}>+ Add Project to {block.role}</button>
              )}
            </div>
          </div>
        ))}
        {editMode && (
          <AddBtn onClick={() => setResearch([...research, { role: "New Research Role", color: C.teal, dept: "Department, University", projects: [{ period: "Period", title: "Project Title", funder: "Funder", bullets: ["Key contribution"] }] }])} label="+ Add Research Block" color={C.teal} bg={C.tealDim} />
        )}

  

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
                  <div className="portfolio-card" style={{ ...cardStyle, position: "relative", borderLeft: `3px solid ${col}` }}>
                    {editMode && <button onClick={() => setConferences(conferences.filter((_, j) => j !== i))} style={{ position: "absolute", top: 8, right: 8, background: C.terraDim, border: `1px solid ${C.terra}40`, borderRadius: 6, color: C.terra, cursor: "pointer", fontSize: 12, padding: "3px 8px", fontWeight: 700, zIndex: 2 }}>×</button>}
                    <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 12, flexWrap: "wrap" }}>
                      {editMode
                        ? <select value={c.type} onChange={e => { const nc = [...conferences]; nc[i].type = e.target.value; setConferences(nc); }} style={{ background: bg, color: col, border: `1.5px solid ${col}40`, borderRadius: 5, padding: "4px 10px", fontSize: 11, fontWeight: 800, cursor: "pointer" }}>
                            <option>Oral Presentation</option>
                            <option>Poster Presentation</option>
                            <option>Abstract Accepted</option>
                          </select>
                        : <span style={{ fontSize: 11, fontWeight: 800, color: col, background: bg, border: `1.5px solid ${col}40`, padding: "4px 12px", borderRadius: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>{c.type}</span>}
                      <EditableText editMode={editMode} value={c.date} onChange={v => { const nc = [...conferences]; nc[i].date = v; setConferences(nc); }}
                        tag="span" style={{ fontSize: 13, color: C.ink2, fontWeight: 600 }} />
                    </div>
                    <EditableText editMode={editMode} value={c.event} onChange={v => { const nc = [...conferences]; nc[i].event = v; setConferences(nc); }}
                      tag="div" style={{ fontSize: 16, fontWeight: 800, color: C.navy, lineHeight: 1.6, marginBottom: 7 }} />
                    <div style={{ fontSize: 13, color: C.ink2, fontWeight: 500, marginBottom: c.note ? 0 : 0 }}>📍 <EditableText editMode={editMode} value={c.location} onChange={v => { const nc = [...conferences]; nc[i].location = v; setConferences(nc); }} style={{ fontSize: 13, color: C.ink2 }} /></div>
                    {(c.note || editMode) && (
                      <EditableText editMode={editMode} value={c.note} onChange={v => { const nc = [...conferences]; nc[i].note = v; setConferences(nc); }}
                        tag="div" placeholder="Add a note…" style={{ fontSize: 13, color: C.ink2, marginTop: 12, fontStyle: "italic", fontWeight: 500, borderTop: `1px solid ${C.border}`, paddingTop: 12 }} />
                    )}
                  </div>
                </div>
              );
            })}
            {editMode && (
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: -32, top: 18, width: 18, height: 18, borderRadius: "50%", background: C.amber, border: `3px solid ${C.surface}`, zIndex: 1, opacity: 0.4 }} />
                <AddBtn onClick={() => setConferences([...conferences, { type: "Oral Presentation", event: "Conference Name", location: "Location", date: "Month Year", note: "" }])} label="+ Add Conference" color={C.amber} bg={C.amberDim} />
              </div>
            )}
          </div>
        </div>

        {/* ─── EXPERIENCE ─── */}
        <SecHead id="experience">Professional Experience</SecHead>
        {experience.map((exp, i) => (
          <div key={i} className="portfolio-card" style={{ ...cardStyle, padding: 0, overflow: "hidden", marginBottom: 32 }}>
            <div style={{ background: C.navy3, color: "white", padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
              <div>
                <EditableText editMode={editMode} value={exp.role} onChange={v => { const ne = [...experience]; ne[i].role = v; setExperience(ne); }}
                  tag="div" style={{ fontSize: 18, fontWeight: 900, color: "white" }} />
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 5, fontWeight: 600, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <EditableText editMode={editMode} value={exp.org} onChange={v => { const ne = [...experience]; ne[i].org = v; setExperience(ne); }} style={{ color: "rgba(255,255,255,0.9)", fontWeight: 700 }} />
                  <span>·</span>
                  <EditableText editMode={editMode} value={exp.location} onChange={v => { const ne = [...experience]; ne[i].location = v; setExperience(ne); }} style={{ color: "rgba(255,255,255,0.8)" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <EditableText editMode={editMode} value={exp.period} onChange={v => { const ne = [...experience]; ne[i].period = v; setExperience(ne); }}
                  tag="span" style={{ fontSize: 13, background: "rgba(13,158,114,0.16)", color: C.amber, padding: "6px 16px", borderRadius: 7, border: `1.5px solid ${C.amber}40`, whiteSpace: "nowrap", fontWeight: 800, letterSpacing: "0.01em" }} />
                {editMode && <button onClick={() => setExperience(experience.filter((_, j) => j !== i))} style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 6, color: "white", fontSize: 12, padding: "4px 10px", fontWeight: 700 }}>×</button>}
              </div>
            </div>
            <div className="card-inner" style={{ padding: "24px" }}>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px" }}>
                {exp.bullets.map((b: string, j: number) => (
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
                <EditableText editMode={editMode} value={exp.award || (editMode ? "Click to add award" : "")} onChange={v => { const ne = [...experience]; ne[i].award = v; setExperience(ne); }}
                  tag="span" style={{ fontSize: 13, color: C.gold, fontWeight: 700 }} placeholder="Click to add award" />
              </div>
            </div>
          </div>
        ))}
        {editMode && <AddBtn onClick={() => setExperience([...experience, { role: "New Role", org: "Organization", location: "Location", period: "Start – End", bullets: ["Key responsibility"], award: "" }])} label="+ Add Experience" color={C.amber} bg={C.amberDim} />}

        {/* Leadership */}
        <div style={{ marginBottom: 8, marginTop: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div style={{ width: 3, height: 24, background: `linear-gradient(180deg,${C.amber},${C.teal})`, borderRadius: 2 }} />
            <h3 style={{ fontSize: 19, fontWeight: 800, color: C.navy, margin: 0, letterSpacing: "0.01em" }}>Leadership & Extracurricular</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 }}>
            {leadership.map((l, i) => (
              <div key={i} className="portfolio-card" style={{ ...cardStyle, display: "flex", gap: 14, padding: "18px 20px", position: "relative", borderTop: `2.5px solid ${i % 2 === 0 ? C.teal : C.amber}` }}>
                {editMode && <button onClick={() => setLeadership(leadership.filter((_, j) => j !== i))} style={{ position: "absolute", top: 6, right: 6, background: C.terraDim, border: `1px solid ${C.terra}40`, borderRadius: 6, color: C.terra, cursor: "pointer", fontSize: 13, padding: "3px 8px", fontWeight: 800 }}>×</button>}
                <div style={{ width: 40, height: 40, borderRadius: 8, background: i % 2 === 0 ? C.tealDim : C.amberDim, border: `1.5px solid ${i % 2 === 0 ? C.teal : C.amber}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18 }}>
                  {editMode
                    ? <input value={l.icon} onChange={e => { const nl = [...leadership]; nl[i].icon = e.target.value; setLeadership(nl); }} style={{ background: "transparent", border: "none", outline: "none", fontSize: 18, textAlign: "center", width: 28 }} />
                    : l.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <EditableText editMode={editMode} value={l.role} onChange={v => { const nl = [...leadership]; nl[i].role = v; setLeadership(nl); }}
                    tag="div" style={{ fontSize: 14, fontWeight: 800, color: C.navy, lineHeight: 1.5 }} />
                  <EditableText editMode={editMode} value={l.org} onChange={v => { const nl = [...leadership]; nl[i].org = v; setLeadership(nl); }}
                    tag="div" style={{ fontSize: 12.5, color: C.ink2, marginTop: 3, lineHeight: 1.4, fontWeight: 500 }} />
                  <EditableText editMode={editMode} value={l.period} onChange={v => { const nl = [...leadership]; nl[i].period = v; setLeadership(nl); }}
                    tag="div" style={{ fontSize: 12, color: i % 2 === 0 ? C.teal : C.amber, marginTop: 6, fontWeight: 800 }} />
                </div>
              </div>
            ))}
            {editMode && <button onClick={() => setLeadership([...leadership, { role: "New Role", org: "Organization", period: "Period", icon: "⭐" }])} style={{ background: C.amberDim, border: `2px dashed ${C.amber}60`, borderRadius: 12, padding: "20px", fontSize: 15, color: C.amber, cursor: "pointer", fontWeight: 800, textAlign: "center" as const }}>+ Add Leadership</button>}
          </div>
        </div>

        <Hr />

        {/* ─── WORKSHOPS ─── */}
        <SecHead id="workshops">Workshops & Seminars</SecHead>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 32 }}>
          {workshops.map((w, i) => (
            <div key={i} className="portfolio-card" style={{ ...cardStyle, borderLeft: `4px solid ${C.teal}`, position: "relative" }}>
              {editMode && <button onClick={() => setWorkshops(workshops.filter((_, j) => j !== i))} style={{ position: "absolute", top: 8, right: 8, background: C.terraDim, border: `1px solid ${C.terra}40`, borderRadius: 6, color: C.terra, cursor: "pointer", fontSize: 13, padding: "3px 8px", fontWeight: 800 }}>×</button>}
              <EditableText editMode={editMode} value={w.title} onChange={v => { const nw = [...workshops]; nw[i].title = v; setWorkshops(nw); }}
                tag="div" style={{ fontSize: 16, fontWeight: 800, color: C.navy, marginBottom: 6, lineHeight: 1.6 }} />
              <EditableText editMode={editMode} value={w.description} onChange={v => { const nw = [...workshops]; nw[i].description = v; setWorkshops(nw); }} multiline
                tag="div" style={{ fontSize: 14, color: C.ink2, marginBottom: 10, lineHeight: 1.8, fontWeight: 500 }} />
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: C.ink2 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span>🏛</span>
                  <EditableText editMode={editMode} value={w.organizer} onChange={v => { const nw = [...workshops]; nw[i].organizer = v; setWorkshops(nw); }} style={{ fontWeight: 700, color: C.teal }} />
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span>📅</span>
                  <EditableText editMode={editMode} value={w.date} onChange={v => { const nw = [...workshops]; nw[i].date = v; setWorkshops(nw); }} style={{ fontWeight: 700 }} />
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", background: C.tealDim, color: C.teal, padding: "3px 10px", borderRadius: 5 }}>
                  <span>💻</span>
                  <EditableText editMode={editMode} value={w.mode} onChange={v => { const nw = [...workshops]; nw[i].mode = v; setWorkshops(nw); }} style={{ fontWeight: 700, color: C.teal }} />
                </div>
              </div>
            </div>
          ))}
          {editMode && <AddBtn onClick={() => setWorkshops([...workshops, { title: "Workshop Title", description: "Workshop description", organizer: "Organizer", date: "Date", mode: "Online" }])} label="+ Add Workshop" color={C.teal} bg={C.tealDim} />}
        </div>

        <Hr />

        {/* ─── SKILLS ─── */}
        <SecHead id="skills">Skills & Training</SecHead>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16, marginBottom: 16 }}>
          <div className="portfolio-card" style={{ ...cardStyle, borderTop: `3px solid ${C.navy}` }}>
            <div style={{ fontSize: 11, color: C.navy, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 18, fontWeight: 800 }}>Statistical Software</div>
            {skills.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 11 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: i % 2 === 0 ? C.teal : C.amber, flexShrink: 0 }} />
                <EditableText editMode={editMode} value={s} onChange={v => { const ns = [...skills]; ns[i] = v; setSkills(ns); }} style={{ fontSize: 14, color: C.ink2, flex: 1 }} />
                {editMode && <button onClick={() => setSkills(skills.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: C.terra, cursor: "pointer", fontSize: 14, padding: 0, fontWeight: 700 }}>×</button>}
              </div>
            ))}
            {editMode && <button onClick={() => setSkills([...skills, "New Software"])} style={{ background: C.tealDim, border: `1px dashed ${C.teal}`, borderRadius: 6, padding: "6px 14px", fontSize: 12, color: C.teal, cursor: "pointer", fontWeight: 600, marginTop: 4 }}>+ Add</button>}
          </div>
          <div className="portfolio-card" style={{ ...cardStyle, borderTop: `3px solid ${C.amber}` }}>
            <div style={{ fontSize: 10, color: C.amber, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14, fontWeight: 700 }}>Competencies</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {competencies.map((s, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  {editMode
                    ? <input value={s} onChange={e => { const nc = [...competencies]; nc[i] = e.target.value; setCompetencies(nc); }} style={{ background: C.amberDim, border: `1px solid ${C.amber}50`, borderRadius: 4, padding: "4px 12px", fontSize: 12, fontWeight: 600, color: C.amber, outline: "none", width: Math.max(80, s.length * 8) }} />
                    : <Tag color={i % 2 === 0 ? C.teal : C.amber} bg={i % 2 === 0 ? C.tealDim : C.amberDim}>{s}</Tag>}
                  {editMode && <button onClick={() => setCompetencies(competencies.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: C.terra, cursor: "pointer", fontSize: 14, padding: 0 }}>×</button>}
                </span>
              ))}
              {editMode && <button onClick={() => setCompetencies([...competencies, "New Skill"])} style={{ background: C.amberDim, border: `1px dashed ${C.amber}`, borderRadius: 4, padding: "4px 14px", fontSize: 12, color: C.amber, cursor: "pointer", fontWeight: 600 }}>+ Add</button>}
            </div>
          </div>
        </div>

        {/* Trainings */}
        <div className="portfolio-card" style={{ ...cardStyle, borderTop: `3px solid ${C.teal}`, marginBottom: 40 }}>
          <div style={{ fontSize: 11, color: C.teal, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 20, fontWeight: 800 }}>Training & Development</div>
          {trainings.map((t, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 0", borderBottom: i < trainings.length - 1 ? `1px solid ${C.border}` : "none", gap: 14, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 13, alignItems: "center", flex: 1 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: i % 2 === 0 ? C.tealDim : C.amberDim, border: `1.5px solid ${i % 2 === 0 ? C.teal : C.amber}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>📚</div>
                <EditableText editMode={editMode} value={t.title} onChange={v => { const nt = [...trainings]; nt[i].title = v; setTrainings(nt); }} style={{ fontSize: 14, color: C.ink2, fontWeight: 600 }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <EditableText editMode={editMode} value={t.period} onChange={v => { const nt = [...trainings]; nt[i].period = v; setTrainings(nt); }}
                  tag="span" style={{ fontSize: 13, color: C.ink2, whiteSpace: "nowrap", fontWeight: 700, background: C.borderLight, padding: "4px 12px", borderRadius: 5 }} />
                {editMode && <button onClick={() => setTrainings(trainings.filter((_, j) => j !== i))} style={{ background: C.terraDim, border: `1px solid ${C.terra}40`, borderRadius: 6, color: C.terra, cursor: "pointer", fontSize: 13, padding: "3px 8px", fontWeight: 800 }}>×</button>}
              </div>
            </div>
          ))}
          {editMode && <button onClick={() => setTrainings([...trainings, { title: "New Training Title", period: "Month Year" }])} style={{ background: C.tealDim, border: `2px dashed ${C.teal}60`, borderRadius: 8, padding: "14px", fontSize: 14, color: C.teal, cursor: "pointer", fontWeight: 800, textAlign: "center" as const, width: "100%", marginTop: 16 }}>+ Add Training</button>}
        </div>

        {/* ─── CONTACT ─── */}
        <div id="contact" style={{ background: C.heroGrad, borderRadius: 16, padding: "5rem 2rem", textAlign: "center", position: "relative", overflow: "hidden", border: `1px solid ${C.border}`, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)" }}>
          <div style={{ position: "absolute", top: -100, left: -100, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle,${C.teal}15,transparent 70%)` }} />
          <div style={{ position: "absolute", bottom: -100, right: -100, width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle,${C.amber}15,transparent 70%)` }} />
          <div style={{ position: "relative", zIndex: 1, maxWidth: 650, margin: "0 auto", textAlign: "left" }}>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <h2 style={{ fontSize: "clamp(1.9rem,5vw,2.7rem)", fontWeight: 900, color: C.navy, marginBottom: 18, letterSpacing: "-0.02em" }}>Get In Touch</h2>
              <p style={{ fontSize: 17, color: C.ink2, opacity: 0.85, lineHeight: 1.7, fontWeight: 500 }}>Have a question or want to collaborate? Send me a message below.</p>
            </div>
            <form id="contact-form" onSubmit={e => { e.preventDefault(); const url = `mailto:${person.email}?subject=${encodeURIComponent(formData.subject || "Contact from Portfolio")}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`)}`; window.location.href = url; }} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
              {[["Name","name","text","Your Name","span 1"],["Email","email","email","Your Email","span 1"],["Subject","subject","text","Subject","span 2"]].map(([label, field, type, placeholder, col]) => (
                <div key={field} style={{ gridColumn: col }}>
                  <label style={{ display: "block", color: C.navy, fontSize: 14, fontWeight: 700, marginBottom: 10 }}>{label}</label>
                  <input type={type} placeholder={placeholder} value={(formData as any)[field]} onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                    style={{ width: "100%", background: "white", border: `1.5px solid ${C.border}`, borderRadius: 9, padding: "13px 16px", color: C.ink, fontSize: 14, fontWeight: 500, outline: "none" }} />
                </div>
              ))}
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ display: "block", color: C.navy, fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Message</label>
                <textarea placeholder="Your Message" rows={5} value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })}
                  style={{ width: "100%", background: "white", border: `1.5px solid ${C.border}`, borderRadius: 9, padding: "13px 16px", color: C.ink, fontSize: 14, fontWeight: 500, outline: "none", resize: "vertical", fontFamily: "'Roboto', sans-serif" }} />
              </div>
              <div style={{ gridColumn: "span 2", textAlign: "center", marginTop: 14 }}>
                <button type="submit" style={{ background: C.navy, color: "white", padding: "18px 56px", borderRadius: 10, fontSize: 16, fontWeight: 800, border: "none", cursor: "pointer", letterSpacing: "0.02em", boxShadow: `0 12px 28px -8px ${C.navy}50`, textTransform: "uppercase" }}>
                  Send Message 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <footer style={{ textAlign: "center", padding: "3rem 2.5rem", borderTop: `1px solid ${C.border}`, color: C.muted, fontSize: 13, fontWeight: 600, background: C.surfaceCard, letterSpacing: "0.03em" }}>
        © {new Date().getFullYear()} {person.name} · {person.title} · {person.location}
        {editMode && <span style={{ marginLeft: 16, fontSize: 12, color: C.amber, fontWeight: 700 }}>✏️ Edit Mode On — Remember to 💾 Save!</span>}
      </footer>
    </div>
  );
}