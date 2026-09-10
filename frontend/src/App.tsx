import { FormEvent, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  ChevronRight,
  CircleHelp,
  Eye,
  Gauge,
  Globe2,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  Network,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Page = "Dashboard" | "Threat Map" | "Attack Events" | "Analytics" | "3D Network" | "ML Explainability" | "Settings";

const navItems: { label: Page; icon: typeof LayoutDashboard }[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Threat Map", icon: Globe2 },
  { label: "Attack Events", icon: AlertTriangle },
  { label: "Analytics", icon: BarChart3 },
  { label: "3D Network", icon: Network },
  { label: "ML Explainability", icon: Sparkles },
  { label: "Settings", icon: Settings },
];

function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [flipped, setFlipped] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password to continue.");
      return;
    }
    setError("");
    onLogin();
  }

  return (
    <main className="login-page">
      <div className="login-atmosphere" aria-hidden="true">
        <div className="grid-lines" />
        <div className="signal signal-one" />
        <div className="signal signal-two" />
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
      </div>
      <header className="public-header">
        <a className="brand" href="#login" aria-label="DeepLog home">
          <span className="brand-mark"><ShieldCheck size={18} strokeWidth={2.4} /></span>
          <span>DeepLog</span>
        </a>
        <span className="status-chip"><span className="status-dot" /> Systems operational</span>
      </header>

      <section className="login-layout">
        <div className="login-copy reveal reveal-delay-1">
          <p className="eyebrow"><Activity size={15} /> Web attack intelligence</p>
          <h1>See the signal<br /><em>before it spreads.</em></h1>
          <p className="lede">A calmer, clearer view of the traffic moving through your applications.</p>
          <div className="mini-metrics">
            <div><strong>98.7%</strong><span>model confidence</span></div>
            <div><strong>24/7</strong><span>event visibility</span></div>
          </div>
          <div className="signal-stage" aria-label="Live security telemetry animation">
            <div className="stage-scan" />
            <div className="stage-ring stage-ring-large" />
            <div className="stage-ring stage-ring-small" />
            <div className="stage-core"><ShieldCheck size={21} /></div>
            <span className="stage-node node-a" />
            <span className="stage-node node-b" />
            <span className="stage-node node-c" />
            <span className="stage-node node-d" />
            <div className="stage-label label-a"><span>LIVE</span><strong>traffic pulse</strong></div>
            <div className="stage-label label-b"><span>ML / 1.0</span><strong>threat signal</strong></div>
          </div>
        </div>

        <div className={`login-card reveal reveal-delay-2 ${flipped ? "is-flipped" : ""}`} id="login" onClick={(event) => { if (!(event.target as HTMLElement).closest("button, input, label, a")) setFlipped((value) => !value); }} role="group" aria-label="DeepLog access panel">
          <div className="login-card-inner">
            <div className="login-face login-front">
              <div className="card-heading">
                <div className="icon-tile"><LockKeyhole size={19} /></div>
                <div><p className="card-kicker">Secure workspace</p><h2>Welcome back</h2></div>
              </div>
              <p className="card-subtitle">Sign in to continue to your security command center.</p>
              <form onSubmit={submit} noValidate>
                <label htmlFor="email">Email or username</label>
                <div className="input-wrap"><UserRound size={17} /><input id="email" type="text" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="analyst@company.com" autoComplete="username" /></div>
                <label htmlFor="password">Password</label>
                <div className="input-wrap"><KeyRound size={17} /><input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" autoComplete="current-password" /></div>
                {error && <p className="form-error" role="alert"><AlertTriangle size={15} /> {error}</p>}
                <div className="form-options">
                  <label className="checkbox-label"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /> <span>Remember me</span></label>
                  <button type="button" className="text-button">Forgot password?</button>
                </div>
                <button className="primary-button" type="submit">Enter DeepLog <ChevronRight size={17} /></button>
              </form>
              <p className="security-note"><ShieldCheck size={14} /> Protected with enterprise-grade access controls</p>
              <button className="flip-hint" type="button" onClick={() => setFlipped(true)}>View workspace posture <ChevronRight size={14} /></button>
            </div>
            <div className="login-face login-back">
              <div className="back-glow" />
              <div className="icon-tile"><Activity size={19} /></div>
              <p className="card-kicker">DeepLog telemetry</p>
              <h2>Clarity in every request.</h2>
              <p className="card-subtitle">Your workspace connects model confidence, attack context, and event history in one calm view.</p>
              <div className="posture-list"><span><i />24 feature signals online</span><span><i />Geo enrichment standing by</span><span><i />Model version 1.0.0 active</span></div>
              <button className="primary-button back-button" type="button" onClick={() => setFlipped(false)}>Back to sign in <ChevronRight size={17} /></button>
            </div>
          </div>
        </div>
      </section>
      <footer className="login-footer"><span>© 2026 DeepLog</span><span>Detection · Context · Clarity</span></footer>
    </main>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [page, setPage] = useState<Page>("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activePage = page === "Dashboard" ? "Overview" : page;

  return (
    <main className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-top"><a className="brand" href="#overview"><span className="brand-mark"><ShieldCheck size={18} /></span><span>DeepLog</span></a><button className="icon-button mobile-close" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"><X size={18} /></button></div>
        <div className="workspace-switcher"><span className="workspace-avatar">A</span><span><strong>Atlas workspace</strong><small>Security operations</small></span><ChevronRight size={15} /></div>
        <nav className="sidebar-nav" aria-label="Main navigation"><p className="nav-label">Workspace</p>{navItems.map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${page === label ? "active" : ""}`} onClick={() => { setPage(label); setSidebarOpen(false); }}><Icon size={17} /><span>{label}</span>{label === "Attack Events" && <span className="nav-count">12</span>}</button>)}</nav>
        <div className="sidebar-bottom"><div className="help-box"><CircleHelp size={18} /><span><strong>Need a hand?</strong><small>Read the analyst guide</small></span></div><button className="nav-item logout" onClick={onLogout}><LogOut size={17} /><span>Sign out</span></button></div>
      </aside>
      {sidebarOpen && <button className="sidebar-scrim" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}
      <section className="main-content">
        <header className="app-header"><button className="icon-button menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><div><p className="breadcrumb">Workspace <ChevronRight size={13} /> {activePage}</p><h1>{page === "Dashboard" ? "Good morning, Alex" : page}</h1></div><div className="header-actions"><button className="icon-button" aria-label="Search"><Search size={18} /></button><button className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><span /></button><div className="profile"><span className="profile-avatar">AR</span><span><strong>Alex Rivera</strong><small>Administrator</small></span></div></div></header>
        {page === "Dashboard" ? <HomeOverview /> : <Placeholder page={page} />}
      </section>
    </main>
  );
}

const trafficData = [
  { time: "00:00", attack: 280, normal: 920 }, { time: "04:00", attack: 410, normal: 1100 },
  { time: "08:00", attack: 360, normal: 980 }, { time: "12:00", attack: 690, normal: 1260 },
  { time: "16:00", attack: 540, normal: 1180 }, { time: "20:00", attack: 820, normal: 1420 },
  { time: "Now", attack: 760, normal: 1510 },
];
const riskData = [{ name: "Critical", value: 12, color: "#ff8f82" }, { name: "High", value: 68, color: "#f4c77a" }, { name: "Medium", value: 174, color: "#7dc8ff" }, { name: "Low", value: 2087, color: "#8fffd4" }];
const endpointData = [{ name: "/login", attacks: 842 }, { name: "/admin", attacks: 604 }, { name: "/search", attacks: 391 }, { name: "/upload", attacks: 228 }, { name: "/api/users", attacks: 184 }];
const countryData = [{ name: "India", attacks: 842 }, { name: "United States", attacks: 604 }, { name: "Germany", attacks: 391 }, { name: "Brazil", attacks: 228 }, { name: "Singapore", attacks: 184 }];

function HomeOverview() {
  return <div className="dashboard-content home-overview">
    <div className="overview-row reveal"><div><p className="eyebrow"><Gauge size={15} /> Security overview</p><p className="section-intro">A live summary of the traffic crossing your protected applications.</p></div><button className="filter-button">Last 24 hours <ChevronRight size={15} /></button></div>
    <div className="home-metrics reveal reveal-delay-1"><HomeMetric label="Requests" value="125,430" delta="+12.8%" tone="mint" icon={<Activity size={18} />} /><HomeMetric label="Attacks" value="18,240" delta="+8.4%" tone="coral" icon={<AlertTriangle size={18} />} /><HomeMetric label="Normal" value="107,190" delta="85.5% of traffic" tone="blue" icon={<ShieldCheck size={18} />} /><HomeMetric label="High Risk" value="2,341" delta="12 critical" tone="amber" icon={<Bell size={18} />} /></div>
    <div className="home-chart-grid reveal reveal-delay-2"><div className="panel home-chart-panel"><div className="panel-heading"><div><p className="panel-kicker">Traffic classification</p><h2>Attack vs Normal traffic</h2></div><span className="live-indicator"><span /> Live</span></div><ResponsiveContainer width="100%" height={250}><AreaChart data={trafficData} margin={{ top: 20, right: 8, left: -24, bottom: 0 }}><defs><linearGradient id="attackGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#ff8f82" stopOpacity={.45} /><stop offset="100%" stopColor="#ff8f82" stopOpacity={0} /></linearGradient><linearGradient id="normalGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#8fffd4" stopOpacity={.3} /><stop offset="100%" stopColor="#8fffd4" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="rgba(209,238,224,.09)" vertical={false} /><XAxis dataKey="time" stroke="#61766c" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} /><YAxis stroke="#61766c" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: "#172427", border: "1px solid rgba(143,255,212,.24)", borderRadius: 8, color: "#e6f0e9", fontSize: 11 }} /><Area type="monotone" dataKey="normal" name="Normal" stroke="#8fffd4" fill="url(#normalGradient)" strokeWidth={2} /><Area type="monotone" dataKey="attack" name="Attack" stroke="#ff8f82" fill="url(#attackGradient)" strokeWidth={2} /></AreaChart></ResponsiveContainer><ChartLegend items={[["Normal", "#8fffd4"], ["Attack", "#ff8f82"]]} /></div><div className="panel home-chart-panel"><div className="panel-heading"><div><p className="panel-kicker">Detection volume</p><h2>Attack trend over time</h2></div><span className="trend-value">+18.2%</span></div><ResponsiveContainer width="100%" height={250}><BarChart data={trafficData} margin={{ top: 20, right: 0, left: -24, bottom: 0 }}><CartesianGrid stroke="rgba(209,238,224,.09)" vertical={false} /><XAxis dataKey="time" stroke="#61766c" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} /><YAxis stroke="#61766c" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: "#172427", border: "1px solid rgba(143,255,212,.24)", borderRadius: 8, color: "#e6f0e9", fontSize: 11 }} /><Bar dataKey="attack" name="Attacks" fill="#8fffd4" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer><p className="chart-note">Peak activity recorded at 20:00 UTC</p></div></div>
    <div className="home-analysis-grid reveal reveal-delay-3"><div className="panel risk-distribution"><div className="panel-heading"><div><p className="panel-kicker">Risk distribution</p><h2>Threat levels</h2></div></div><div className="risk-chart"><ResponsiveContainer width="48%" height={150}><PieChart><Pie data={riskData} dataKey="value" innerRadius={43} outerRadius={61} paddingAngle={3} stroke="none">{riskData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie></PieChart></ResponsiveContainer><div className="risk-total"><strong>2,341</strong><span>high risk events</span></div></div><div className="risk-legend compact-legend">{riskData.map((entry) => <span key={entry.name}><i style={{ background: entry.color }} />{entry.name}<b>{entry.value.toLocaleString()}</b></span>)}</div></div><div className="panel ranking-panel"><div className="panel-heading"><div><p className="panel-kicker">Top attacked endpoints</p><h2>Where attacks land</h2></div><Network size={17} className="panel-accent" /></div><RankingList data={endpointData} /></div><div className="panel ranking-panel"><div className="panel-heading"><div><p className="panel-kicker">Top source countries</p><h2>Origin overview</h2></div><Globe2 size={17} className="panel-accent" /></div><RankingList data={countryData} /></div></div>
    <div className="panel recent-events-panel reveal reveal-delay-3"><div className="panel-heading"><div><p className="panel-kicker">Investigation queue</p><h2>Recent events</h2></div><button className="view-all">View all <ChevronRight size={15} /></button></div><div className="recent-table"><div className="recent-row recent-head"><span>Time</span><span>Source IP</span><span>Endpoint</span><span>Status</span><span>Risk</span></div><RecentEvent time="10:42" ip="185.74.22.91" endpoint="/login" status="Attack" risk="High" /><RecentEvent time="10:41" ip="103.45.18.204" endpoint="/products" status="Normal" risk="Low" /><RecentEvent time="10:39" ip="45.129.88.14" endpoint="/admin" status="Attack" risk="Critical" /></div></div>
  </div>;
}

function HomeMetric({ label, value, delta, tone, icon }: { label: string; value: string; delta: string; tone: string; icon: React.ReactNode }) { return <div className={`home-metric metric-${tone}`}><span className="metric-icon">{icon}</span><span className="metric-label">{label}</span><strong>{value}</strong><small>{delta}</small><span className="metric-line" /></div>; }
function ChartLegend({ items }: { items: string[][] }) { return <div className="chart-legend">{items.map(([label, color]) => <span key={label}><i style={{ background: color }} />{label}</span>)}</div>; }
function RankingList({ data }: { data: { name: string; attacks: number }[] }) { const max = data[0].attacks; return <div className="ranking-list">{data.map((entry, index) => <div className="ranking-row" key={entry.name}><span className="ranking-index">0{index + 1}</span><span className="ranking-name">{entry.name}</span><span className="ranking-count">{entry.attacks}</span><span className="ranking-track"><i style={{ width: `${(entry.attacks / max) * 100}%` }} /></span></div>)}</div>; }
function RecentEvent({ time, ip, endpoint, status, risk }: { time: string; ip: string; endpoint: string; status: string; risk: string }) { return <div className="recent-row"><span>{time}</span><span className="source-ip">{ip}</span><span className="endpoint-code">{endpoint}</span><span className={`status-${status.toLowerCase()}`}>{status}</span><b className={`risk-badge risk-${risk.toLowerCase()}`}>{risk}</b></div>; }

function VisionOverview() {
  return <div className="dashboard-content vision-overview">
    <div className="overview-row reveal"><div><p className="eyebrow"><Gauge size={15} /> Command center</p><p className="section-intro">A clear read on your application perimeter, updated in real time.</p></div><button className="filter-button">Last 24 hours <ChevronRight size={15} /></button></div>
    <div className="vision-stats reveal reveal-delay-1">
      <StatCard label="Requests analyzed" value="184,290" delta="+12.8%" tone="mint" icon={<Activity size={18} />} />
      <StatCard label="Attacks detected" value="2,846" delta="+8.4%" tone="coral" icon={<AlertTriangle size={18} />} />
      <StatCard label="Detection rate" value="98.7%" delta="+1.2%" tone="blue" icon={<ShieldCheck size={18} />} />
      <StatCard label="Open alerts" value="12" delta="3 critical" tone="amber" icon={<Bell size={18} />} />
    </div>
    <div className="vision-grid reveal reveal-delay-2">
      <div className="panel hero-widget"><div className="panel-heading"><div><p className="panel-kicker">Traffic pulse</p><h2>Attack activity</h2></div><span className="live-indicator"><span /> Live</span></div><div className="hero-chart"><div className="hero-chart-copy"><strong>2,846</strong><span>events detected</span><b>+8.4% <small>vs last period</small></b></div><svg viewBox="0 0 700 210" preserveAspectRatio="none" aria-label="Attack activity chart"><defs><linearGradient id="visionFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#8fffd4" stopOpacity=".32" /><stop offset="1" stopColor="#8fffd4" stopOpacity="0" /></linearGradient></defs><path d="M0 175 C44 177 60 140 100 154 S155 105 202 133 S250 151 285 98 S340 121 380 88 S430 105 468 53 S515 90 550 67 S603 74 640 39 S680 57 700 18 V210 H0 Z" fill="url(#visionFill)" /><path d="M0 175 C44 177 60 140 100 154 S155 105 202 133 S250 151 285 98 S340 121 380 88 S430 105 468 53 S515 90 550 67 S603 74 640 39 S680 57 700 18" fill="none" stroke="#8fffd4" strokeWidth="3" vectorEffect="non-scaling-stroke" /></svg><div className="hero-chart-axis"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>Now</span></div></div></div>
      <div className="panel score-widget"><div className="panel-heading"><div><p className="panel-kicker">System health</p><h2>Security posture</h2></div><button className="more-button">•••</button></div><div className="posture-score"><div className="score-ring"><span>84</span><small>/ 100</small></div><div><strong>Healthy</strong><p>Detection coverage is up<br />across all protected apps.</p></div></div><div className="score-bar"><span /></div><div className="score-foot"><span>Last scan 4 min ago</span><b>+6.2%</b></div></div>
    </div>
    <div className="vision-lower reveal reveal-delay-3">
      <div className="panel feed-widget"><div className="panel-heading"><div><p className="panel-kicker">Needs review</p><h2>Recent attack events</h2></div><button className="view-all">View all <ChevronRight size={15} /></button></div><div className="feed-list"><FeedItem icon="SQL" title="SQL injection pattern" endpoint="/api/v2/accounts" risk="Critical" time="2 min ago" /><FeedItem icon="XSS" title="Cross-site scripting" endpoint="/search?q=..." risk="High" time="11 min ago" /><FeedItem icon="TRV" title="Path traversal attempt" endpoint="/assets/../../" risk="High" time="24 min ago" /><FeedItem icon="BOT" title="Suspicious automation" endpoint="/auth/login" risk="Medium" time="38 min ago" /></div></div>
      <div className="panel endpoint-widget"><div className="panel-heading"><div><p className="panel-kicker">Exposure map</p><h2>Most targeted endpoints</h2></div><Network size={17} className="panel-accent" /></div><div className="endpoint-list"><EndpointRow path="/api/v2/accounts" count="842" width="88%" /><EndpointRow path="/auth/login" count="604" width="67%" /><EndpointRow path="/search" count="391" width="45%" /><EndpointRow path="/upload/media" count="228" width="31%" /></div><button className="outline-button">Open analytics <ChevronRight size={14} /></button></div>
    </div>
  </div>;
}

function FeedItem({ icon, title, endpoint, risk, time }: { icon: string; title: string; endpoint: string; risk: string; time: string }) { return <div className="feed-item"><b className={`event-icon feed-icon-${risk.toLowerCase()}`}>{icon}</b><span><strong>{title}</strong><small>{endpoint}</small></span><em className={`feed-risk-${risk.toLowerCase()}`}>{risk}</em><time>{time}</time></div>; }
function EndpointRow({ path, count, width }: { path: string; count: string; width: string }) { return <div className="endpoint-row"><div><span>{path}</span><b>{count}</b></div><div className="endpoint-track"><i style={{ width }} /></div></div>; }

function Overview() {
  return <div className="dashboard-content"><div className="overview-row reveal"><div><p className="eyebrow"><Gauge size={15} /> Live overview</p><p className="section-intro">Your traffic is being watched. Here is what needs attention today.</p></div><button className="filter-button">Last 24 hours <ChevronRight size={15} /></button></div><div className="stats-grid reveal reveal-delay-1"><StatCard label="Requests analyzed" value="184,290" delta="+12.8%" tone="mint" icon={<Activity size={18} />} /><StatCard label="Attacks detected" value="2,846" delta="+8.4%" tone="coral" icon={<AlertTriangle size={18} />} /><StatCard label="Detection rate" value="98.7%" delta="+1.2%" tone="blue" icon={<ShieldCheck size={18} />} /><StatCard label="Open alerts" value="12" delta="3 critical" tone="amber" icon={<Bell size={18} />} /></div><div className="dashboard-grid reveal reveal-delay-2"><div className="panel activity-panel"><div className="panel-heading"><div><p className="panel-kicker">Traffic pulse</p><h2>Attack activity</h2></div><span className="live-indicator"><span /> Live</span></div><div className="chart"><div className="chart-y"><span>1k</span><span>750</span><span>500</span><span>250</span><span>0</span></div><div className="chart-area"><div className="chart-grid-lines" /><svg viewBox="0 0 700 230" preserveAspectRatio="none" aria-label="Attack activity chart"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#8fffd4" stopOpacity=".3" /><stop offset="1" stopColor="#8fffd4" stopOpacity="0" /></linearGradient></defs><path d="M0 180 C35 170 55 185 82 142 S130 155 155 113 S200 150 225 120 S270 85 302 104 S345 140 372 88 S420 105 444 62 S490 92 525 54 S570 80 596 35 S650 80 700 23 V230 H0 Z" fill="url(#chartFill)" /><path d="M0 180 C35 170 55 185 82 142 S130 155 155 113 S200 150 225 120 S270 85 302 104 S345 140 372 88 S420 105 444 62 S490 92 525 54 S570 80 596 35 S650 80 700 23" fill="none" stroke="#8fffd4" strokeWidth="3" vectorEffect="non-scaling-stroke" /></svg><div className="chart-x"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>Now</span></div></div></div></div><div className="panel risk-panel"><div className="panel-heading"><div><p className="panel-kicker">Risk posture</p><h2>Threat levels</h2></div><button className="more-button">•••</button></div><div className="risk-ring"><div className="ring-inner"><strong>84</strong><span>health score</span></div></div><div className="risk-legend"><span><i className="dot dot-critical" />Critical <b>12</b></span><span><i className="dot dot-high" />High <b>68</b></span><span><i className="dot dot-medium" />Medium <b>174</b></span><span><i className="dot dot-low" />Low <b>2,592</b></span></div></div></div><div className="panel events-panel reveal reveal-delay-3"><div className="panel-heading"><div><p className="panel-kicker">Needs review</p><h2>Recent attack events</h2></div><button className="view-all">View all <ChevronRight size={15} /></button></div><div className="event-table"><div className="event-row event-head"><span>Event</span><span>Source</span><span>Risk</span><span>Time</span></div><EventRow icon="SQL" title="SQL injection pattern" endpoint="/api/v2/accounts" source="185.74.22.91" risk="Critical" time="2 min ago" /><EventRow icon="XSS" title="Cross-site scripting" endpoint="/search?q=..." source="103.45.18.204" risk="High" time="11 min ago" /><EventRow icon="TRV" title="Path traversal attempt" endpoint="/assets/../../" source="45.129.88.14" risk="High" time="24 min ago" /></div></div></div>;
}

function StatCard({ label, value, delta, tone, icon }: { label: string; value: string; delta: string; tone: string; icon: React.ReactNode }) { return <div className={`stat-card stat-${tone}`}><div className="stat-top"><span className="stat-icon">{icon}</span><span className="stat-delta">{delta}</span></div><strong>{value}</strong><span>{label}</span><div className="sparkline"><i /><i /><i /><i /><i /><i /><i /><i /></div></div>; }
function EventRow({ icon, title, endpoint, source, risk, time }: { icon: string; title: string; endpoint: string; source: string; risk: string; time: string }) { return <div className="event-row"><span className="event-name"><b className="event-icon">{icon}</b><span><strong>{title}</strong><small>{endpoint}</small></span></span><span className="source-ip">{source}</span><span><b className={`risk-badge risk-${risk.toLowerCase()}`}>{risk}</b></span><span className="event-time">{time}</span></div>; }
function Placeholder({ page }: { page: Page }) { return <div className="placeholder reveal"><div className="placeholder-icon"><Eye size={24} /></div><p className="eyebrow">DeepLog module</p><h2>{page} is ready for connection</h2><p>The navigation shell is in place. Connect this view to the FastAPI endpoints and model services next.</p></div>; }

export default function App() { const [authenticated, setAuthenticated] = useState(false); return authenticated ? <Dashboard onLogout={() => setAuthenticated(false)} /> : <Login onLogin={() => setAuthenticated(true)} />; }
