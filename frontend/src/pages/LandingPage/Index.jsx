import React from "react";
import ReactDOM from 'react-dom/client';
import { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FaUsers } from "react-icons/fa";
import "./Landing.css";


const { useState, useEffect, useRef, useCallback } = React;
import axios from 'axios';
import { toast } from 'react-hot-toast';

const handleExternalLink = (url) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

// ─── SVG ICONS ────────────────────────────────────────────────────────────────
const icons = {
  users: "👥",
  leads: "🎯",
  finance: "💰",
  chart: "📊",
  hrm: "🏢",
  support: "🎧",
  notify: "🔔",
  shield: "🔒",
  rocket: "🚀",
  settings: "⚙️",
  admin: "👑",
  sales: "📈",
  mgmt: "🏗️",
  report: "📋",
  mail: "✉️",
  phone: "📞",
  location: "📍",
  linkedin: "💼",
  fb: "📘",
  ig: "📷",
  tw: "🐦",
  check: "✓",
  arrow: "→",
  star: "★",
};

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const fn = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 40);

      // Hide header on scroll down, show on scroll up
      if (currentScrollY > 150) {
        if (currentScrollY > lastScrollY.current && !menuOpen) {
          setHidden(true);
        } else {
          setHidden(false);
        }
      } else {
        setHidden(false);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [menuOpen]);

  const handleScrollTo = (id) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const links = ["Features", "Modules", "Workflow", "Contact"];
  return (
    <>
      <div
        className={`nav-overlay ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(false)}
      />
      <nav
        className={`nav ${scrolled ? "scrolled" : ""} ${hidden ? "nav-hidden" : ""}`}
      >
        <div className="container">
          <div className="nav-inner">
            <a onClick={() => handleScrollTo("hero")} className="nav-logo">
              <div className="nav-logo-icon">⚡</div>
              GraphuraCRM
            </a>
            <div className={`nav-links ${menuOpen ? "open" : ""}`}>
              {links.map((l) => (
                <a key={l} onClick={() => handleScrollTo(l.toLowerCase())}>
                  {l}
                </a>
              ))}
            </div>
            <button
              className="menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

// ─── ANIMATED COUNTER ─────────────────────────────────────────────────────────
function Counter({ end, suffix = "", duration = 2000, prefix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const step = end / (duration / 16);
          const timer = setInterval(() => {
            start += step;
            if (start >= end) {
              setVal(end);
              clearInterval(timer);
            } else setVal(Math.floor(start));
          }, 16);
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);
  return (
    <span ref={ref}>
      {prefix}
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

// ─── HERO SECTION ─────────────────────────────────────────────────────────────
function Hero({ onWatchTutorial }) {
  const heroRef = useRef(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e) => {
      const rect = heroRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMouse({
        x: (e.clientX - rect.width / 2) / 30,
        y: (e.clientY - rect.height / 2) / 30,
      });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  const bars = [40, 65, 50, 80, 70, 90, 75, 95];
  const colors = [
    "#2563eb",
    "#3b82f6",
    "#2563eb",
    "#60a5fa",
    "#3b82f6",
    "#22d3ee",
    "#3b82f6",
    "#60a5fa",
  ];

  return (
    <section className="hero" ref={heroRef} id="hero">
      <div className="hero-bg">
        <div
          className="hero-orb hero-orb-1"
          style={{ transform: `translate(${mouse.x}px, ${mouse.y}px)` }}
        />
        <div
          className="hero-orb hero-orb-2"
          style={{ transform: `translate(${-mouse.x}px, ${-mouse.y}px)` }}
        />
      </div>
      <div className="container">
        <div className="hero-grid">
          <div
            className="hero-left"
            style={{
              opacity: 0,
              animation: "fadeSlideUp 0.9s ease forwards",
            }}
          >
            <style>{`@keyframes fadeSlideUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}`}</style>
            <div className="hero-badge">
              <div className="hero-badge-dot" />
              Now with AI-powered lead scoring
            </div>
            <h1 className="heading-xl hero-title">
              The CRM that
              <br />
              <span className="text-gradient">Runs Your Entire</span>
              <br />
              Business
            </h1>
            <p className="hero-desc">
              Manage Leads, Teams, Finance, HRM and Projects from a Single
              Platform. Built for growing enterprises that demand clarity,
              speed, and control.
            </p>
            <div className="hero-btns">
              <a
                onClick={() => handleExternalLink("/admin-register")}
                className="btn-primary"
                style={{ cursor: "pointer" }}
              >
                🚀 Start Free Trial
              </a>
              <a
                onClick={() =>
                  handleExternalLink(
                    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                  )
                }
                className="btn-outline"
                style={{ cursor: "pointer" }}
              >
                🎥 Watch CRM Tutorial
              </a>
            </div>
            <div className="hero-stats">
              {[
                ["2,400+", "Companies"],
                ["1.2M+", "Leads Managed"],
                ["99.9%", "Uptime SLA"],
              ].map(([n, l]) => (
                <div className="hero-stat" key={l}>
                  <div className="hero-stat-num">{n}</div>
                  <div className="hero-stat-label">{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="hero-visual"
            style={{
              opacity: 0,
              animation: "fadeSlideUp 1.1s ease 0.3s forwards",
            }}
          >
            <div className="float-card float-card-1">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#22c55e,#16a34a)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                  }}
                >
                  ✓
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.8rem" }}>
                    New Lead Assigned
                  </div>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Acme Corp · $42,000
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-dashboard">
              <div className="hero-dash-header">
                <div className="dot dot-r" />
                <div className="dot dot-y" />
                <div className="dot dot-g" />
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-secondary)",
                    marginLeft: 8,
                  }}
                >
                  graphuracrm.app/dashboard
                </span>
              </div>
              <div className="hero-dash-body">
                <div
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: 10,
                  }}
                >
                  OVERVIEW · Today
                </div>
                <div className="dash-grid">
                  {[
                    ["$1.24M", "Revenue", "↑ 18%"],
                    ["482", "Active Leads", "↑ 24%"],
                    ["94%", "Team Score", "↑ 3%"],
                  ].map(([v, l, t]) => (
                    <div className="dash-kpi" key={l}>
                      <div className="dash-kpi-val">{v}</div>
                      <div className="dash-kpi-lbl">{l}</div>
                      <div className="dash-kpi-trend">{t}</div>
                    </div>
                  ))}
                </div>
                <div className="dash-chart-area">
                  {bars.map((h, i) => (
                    <div
                      key={i}
                      className="bar"
                      style={{
                        height: `${h}%`,
                        background: colors[i],
                        opacity: 0.8 + i * 0.02,
                      }}
                    />
                  ))}
                </div>
                <div className="dash-table">
                  <div
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      marginBottom: 8,
                    }}
                  >
                    RECENT LEADS
                  </div>
                  {[
                    ["Sarah Chen", "Enterprise", "Hot", `$28K`, "green"],
                    ["Marcus Webb", "SMB", "Warm", "$9K", "yellow"],
                    ["Priya Singh", "Enterprise", "New", "$55K", "blue"],
                  ].map(([n, t, s, v, c]) => (
                    <div className="dash-table-row" key={n}>
                      <span>{n}</span>
                      <span style={{ color: "var(--text-secondary)" }}>
                        {t}
                      </span>
                      <span className={`status-badge status-${c}`}>{s}</span>
                      <span style={{ fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="float-card float-card-2">
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "var(--text-secondary)",
                  marginBottom: 4,
                }}
              >
                Monthly Revenue
              </div>
              <div
                style={{
                  fontFamily: "Space Grotesk",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "#22c55e",
                }}
              >
                +34.2%
              </div>
              <div
                style={{
                  fontSize: "0.65rem",
                  color: "var(--text-secondary)",
                }}
              >
                vs last month
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── TRUST SECTION ────────────────────────────────────────────────────────────
function TrustSection() {
  const stats = [
    {
      num: 2400,
      suffix: "+",
      label: "Companies Using GraphuraCRM",
      color: "#3b82f6",
    },
    {
      num: 1200000,
      suffix: "+",
      label: "Total Leads Managed",
      color: "#22d3ee",
    },
    { num: 18500, suffix: "+", label: "Active Users", color: "#a78bfa" },
    {
      num: 850,
      suffix: "M+",
      prefix: "$",
      label: "Total Revenue Tracked",
      color: "#22c55e",
    },
  ];
  return (
    <section className="trust-section">
      <div className="container">
        <div className="trust-cards">
          {stats.map((s) => (
            <div className="trust-card" key={s.label}>
              <div className="trust-num" style={{ color: s.color }}>
                <Counter
                  end={s.num}
                  suffix={s.suffix}
                  prefix={s.prefix || ""}
                />
              </div>
              <div className="trust-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── PRODUCT SHOWCASE ─────────────────────────────────────────────────────────
function ProductShowcase() {
  const [activeSlide, setActiveSlide] = useState(0);
  const timerRef = useRef(null);

  const slides = [
    {
      label: "Dashboard",
      icon: "📊",
      desc: "Real-time KPI overview",
      color: "#2563eb",
      image: "landscape1.png",
    },
    {
      label: "Lead Management",
      icon: "🎯",
      desc: "Full lead lifecycle",
      color: "#7c3aed",
      image: "landscape2.png",
    },
    {
      label: "Finance",
      icon: "💰",
      desc: "Invoices & revenue",
      color: "#059669",
      image: "landscape3.png",
    },
    {
      label: "HRM",
      icon: "👥",
      desc: "Human resource tools",
      color: "#dc2626",
      image: "landscape4.png",
    },
    {
      label: "Projects",
      icon: "🚀",
      desc: "Kanban & timelines",
      color: "#d97706",
      image: "landscape5.png",
    },
    {
      label: "Reports",
      icon: "📋",
      desc: "Advanced analytics",
      color: "#0891b2",
      image: "landscape6.png",
    },
  ];

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(
      () => setActiveSlide((p) => (p + 1) % slides.length),
      6000,
    );
  }, []);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [startTimer]);

  const goto = (i) => {
    setActiveSlide(i);
    startTimer();
  };

  const SlideContent = ({ slide }) => {
    return (
      <div className="showcase-frame">
        <div className="showcase-frame-header">
          <div className="dot dot-r" />
          <div className="dot dot-y" />
          <div className="dot dot-g" />
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--text-secondary)",
              marginLeft: 8,
            }}
          >
            {slide.label} · GraphuraCRM
          </span>
        </div>
        <div
          className="showcase-frame-body"
          style={{
            background: "var(--navy-800)",
            padding: 0,
            minHeight: "220px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <img
            src={slide.image}
            alt={slide.label}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              borderRadius: "0 0 10px 10px",
              objectFit: "cover",
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <section
      className="section"
      id="features"
      style={{
        background:
          "linear-gradient(180deg, transparent, rgba(7,20,40,0.8), transparent)",
      }}
    >
      <div className="container">
        <div className="section-header reveal">
          <div className="eyebrow">Product Showcase</div>
          <h2 className="heading-lg">
            Every module built for
            <br />
            <span className="text-gradient">enterprise performance</span>
          </h2>
          <p>
            Six integrated modules that talk to each other — no more data silos
            or tab chaos.
          </p>
        </div>
        <div className="tab-row" style={{ justifyContent: "center" }}>
          {slides.map((s, i) => (
            <button
              key={s.label}
              className={`tab ${activeSlide === i ? "active" : ""}`}
              onClick={() => goto(i)}
            >
              <span>{s.icon}</span> {s.label}
            </button>
          ))}
        </div>
        <div className="showcase-slider reveal">
          <SlideContent slide={slides[activeSlide]} />
        </div>
        <div className="showcase-controls">
          <button
            className="showcase-btn"
            onClick={() =>
              goto((activeSlide - 1 + slides.length) % slides.length)
            }
          >
            ‹
          </button>
          {slides.map((_, i) => (
            <div
              key={i}
              className={`showcase-dot ${i === activeSlide ? "active" : ""}`}
              onClick={() => goto(i)}
            />
          ))}
          <button
            className="showcase-btn"
            onClick={() => goto((activeSlide + 1) % slides.length)}
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    [
      "Register Your Company",
      "Create your organization account with custom subdomains and security configurations.",
    ],
    [
      "Create Departments",
      "Divide your workspace into Sales, Finance, HRM, and Project management departments.",
    ],
    [
      "Create Teams",
      "Group employees under department heads and set team leader hierarchies.",
    ],
    [
      "Upload Leads",
      "Bulk import leads via CSV/Excel or connect campaign integrations.",
    ],
    [
      "Manage Sales Process",
      "Move leads from intake to closing with automated reminder loops.",
    ],
    [
      "Generate Invoices",
      "Issue tax-compliant digital invoices and track payment collections.",
    ],
    [
      "Manage Projects",
      "Assign deliverables, track Kanban milestones, and coordinate tasks.",
    ],
    [
      "Client Track Projects",
      "Share access with clients to review progress and submit feedback in real-time.",
    ],
    [
      "Manage Reports",
      "Extract deep department analytics to review overall performance.",
    ],
  ];
  return (
    <section className="section section-bg-900" id="workflow">
      <div className="container">
        <div className="section-header reveal">
          <div className="eyebrow">How It Works</div>
          <h2 className="heading-lg">
            From onboarding to
            <br />
            <span className="text-gradient">full operation in days</span>
          </h2>
          <p>
            A structured path from company setup to complete business
            intelligence.
          </p>
        </div>
        <div className="timeline">
          {steps.map(([title, desc], i) => (
            <div
              className="timeline-item reveal"
              key={title}
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              <div className="timeline-node">
                {i + 1 < 10 ? `0${i + 1}` : i + 1}
              </div>
              <div className="timeline-content">
                <div className="timeline-title">{title}</div>
                <div className="timeline-desc">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── MODULES SECTION ──────────────────────────────────────────────────────────
function ModulesSection() {
  const modules = [
    {
      icon: "👑",
      name: "Admin",
      desc: "Full organization control, billing management, system integrations, and global workflows.",
      color: "#eab308",
    },
    {
      icon: "📈",
      name: "Sales Manager",
      desc: "Overviews sales targets, manages lead allocation rules, and monitors manager pipelines.",
      color: "#3b82f6",
    },
    {
      icon: "🎯",
      name: "Sales Team Leader",
      desc: "Sets team objectives, assigns pipeline leads, and tracks executive daily conversion rates.",
      color: "#60a5fa",
    },
    {
      icon: "👤",
      name: "Sales Executive / Employee",
      desc: "Conducts lead follow-ups, updates deal stages, schedules calls, and closes contracts.",
      color: "#3b82f6",
    },
    {
      icon: "💰",
      name: "Finance",
      desc: "Oversees company billing, processes invoices, tracks collections, and reviews expenses.",
      color: "#22c55e",
    },
    {
      icon: "🏗️",
      name: "Management Manager",
      desc: "Maintains high-level project milestones, schedules resources, and tracks budgets.",
      color: "#8b5cf6",
    },
    {
      icon: "👥",
      name: "Management Team Leader",
      desc: "Allocates sprint tasks, moderates Kanban columns, and monitors project deliverables.",
      color: "#ec4899",
    },
    {
      icon: "💻",
      name: "Management Employee",
      desc: "Manages daily task queues, collaborates with team members, and updates project status.",
      color: "#06b6d4",
    },
  ];
  return (
    <section className="section" id="modules">
      <div className="container">
        <div className="section-header reveal">
          <div className="eyebrow">Core Modules</div>
          <h2 className="heading-lg">
            Eight roles.
            <br />
            <span className="text-gradient">One connected platform.</span>
          </h2>
          <p>
            Every user role gets dedicated tooling — and they all share the same
            data layer.
          </p>
        </div>
        <div className="modules-grid">
          {modules.map((m, i) => (
            <div
              key={m.name}
              className="glass-card module-card reveal"
              style={{ transitionDelay: `${i * 0.06}s` }}
            >
              <div
                className="module-icon"
                style={{
                  background: m.color + "20",
                  border: `1px solid ${m.color}44`,
                }}
              >
                <span style={{ fontSize: "1.6rem" }}>{m.icon}</span>
              </div>
              <div className="module-name">{m.name}</div>
              <div className="module-desc">{m.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FEATURES SECTION ─────────────────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    [
      "🎯",
      "Lead Management",
      "Full lifecycle from capture to close with stage-based pipelines.",
    ],
    [
      "📤",
      "Bulk Lead Upload",
      "Import thousands of leads via CSV, Excel or API in seconds.",
    ],
    [
      "🔀",
      "Lead Distribution",
      "Auto-assign leads to reps based on rules, territory or round-robin.",
    ],
    [
      "👥",
      "Team Management",
      "Create hierarchical teams, set targets and monitor performance.",
    ],
    [
      "🏆",
      "Target Management",
      "Set quarterly targets per rep, team or region with live tracking.",
    ],
    [
      "📅",
      "Follow-up Tracking",
      "Automated reminders, call logs and email sequences built in.",
    ],
    [
      "💳",
      "Finance Management",
      "Revenue tracking, expense management and budget controls.",
    ],
    [
      "🧾",
      "Invoice System",
      "Professional invoices with custom branding, tax rules and e-sign.",
    ],
    [
      "🔧",
      "Work Orders",
      "Create, assign and track field service work orders end-to-end.",
    ],
    [
      "🏢",
      "HRM System",
      "Employee database with contracts, docs and org chart.",
    ],
    [
      "🕐",
      "Attendance Tracking",
      "Geo-fenced check-in, shift scheduling and overtime rules.",
    ],
    [
      "🌴",
      "Leave Management",
      "Multi-level approval workflows for all leave types.",
    ],
    [
      "📊",
      "Reports & Analytics",
      "50+ pre-built reports plus drag-and-drop custom builder.",
    ],
    [
      "🚀",
      "Realtime Project Tracking",
      "Monitor milestones, Kanban boards, and sprint progress live.",
    ],
    [
      "🎧",
      "Support Tickets",
      "Multi-channel support desk with SLA and CSAT tracking.",
    ],
    [
      "🔐",
      "Login Logs",
      "Detailed audit trail of every user session and action.",
    ],
    [
      "🛡️",
      "Role Management",
      "Granular permission matrices down to field-level access.",
    ],
    [
      "📉",
      "Performance Monitoring",
      "Real-time agent leaderboards, call stats and conversion metrics.",
    ],
  ];
  return (
    <section className="section section-bg-grad">
      <div className="container">
        <div className="section-header reveal">
          <div className="eyebrow">All Features</div>
          <h2 className="heading-lg">
            Everything you need
            <br />
            <span className="text-gradient">already included</span>
          </h2>
          <p>
            No paid add-ons for core features. Every plan gets the full toolkit.
          </p>
        </div>
        <div className="features-grid">
          {features.map(([icon, name, desc], i) => (
            <div
              key={name}
              className="glass-card feature-card reveal"
              style={{ transitionDelay: `${(i % 6) * 0.07}s` }}
            >
              <div className="feature-icon">{icon}</div>
              <div>
                <div className="feature-name">{name}</div>
                <div className="feature-desc">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── WORKFLOW VISUALIZATION ────────────────────────────────────────────────────
function WorkflowViz() {
  const nodes = [
    {
      icon: "📥",
      name: "Lead Intake",
      sub: "Web, CSV, API",
      color: "#3b82f6",
    },
    {
      icon: "📈",
      name: "Sales",
      sub: "Pipeline & Deals",
      color: "#7c3aed",
    },
    {
      icon: "💰",
      name: "Finance",
      sub: "Invoices & Revenue",
      color: "#22c55e",
    },
    {
      icon: "🏗️",
      name: "Management",
      sub: "Projects & Tasks",
      color: "#d97706",
    },
    {
      icon: "🤝",
      name: "Client",
      sub: "Track Project & Review it ",
      color: "#ec4899",
    },
    {
      icon: "📊",
      name: "Report",
      sub: "Unified Analytics",
      color: "#22d3ee",
    },
  ];
  return (
    <section className="section section-bg-900">
      <div className="container">
        <div className="section-header reveal">
          <div className="eyebrow">Data Flow</div>
          <h2 className="heading-lg">
            How data flows
            <br />
            <span className="text-gradient">across your organisation</span>
          </h2>
          <p>
            Every department feeds the same data lake — decisions are always
            based on the full picture.
          </p>
        </div>
        <div className="workflow-flow reveal">
          {nodes.map((n, i) => (
            <React.Fragment key={n.name}>
              <div className="workflow-node">
                <div
                  className="workflow-node-icon"
                  style={{
                    background: n.color + "15",
                    borderColor: n.color + "40",
                  }}
                >
                  <span style={{ fontSize: "1.8rem" }}>{n.icon}</span>
                </div>
                <div className="workflow-node-name">{n.name}</div>
                <div className="workflow-node-sub">{n.sub}</div>
              </div>
              {i < nodes.length - 1 && (
                <div className="workflow-arrow">
                  <span className="arrow-horizontal">→</span>
                  <span className="arrow-vertical">↓</span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 40,
          }}
        >
          <div
            style={{
              background: "var(--navy-800)",
              border: "1px solid var(--glass-border)",
              borderRadius: 16,
              padding: "20px 32px",
              display: "flex",
              gap: 32,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {[
              ["Real-time Sync", "⚡"],
              ["Role-Based Access", "🔒"],
              ["Audit Trail", "📝"],
              ["Webhooks", "🔗"],
            ].map(([l, i]) => (
              <div
                key={l}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: "0.88rem",
                  fontWeight: 500,
                }}
              >
                <span>{i}</span>
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── WHY CHOOSE US ────────────────────────────────────────────────────────────
function WhyChooseUs() {
  const cards = [
    [
      "🏗️",
      "Centralized System",
      "One login covers every department — no more app-switching or data duplication.",
    ],
    [
      "👥",
      "Easy Team Management",
      "Hierarchy builder, role assignment and target-setting in under five minutes.",
    ],
    [
      "📊",
      "Advanced Analytics",
      "50+ pre-built reports with a drag-and-drop custom report builder.",
    ],
    [
      "📐",
      "Scalable Architecture",
      "Handles 1 team or 1,000 teams on the same infrastructure without degradation.",
    ],
    [
      "🔐",
      "Role-Based Access",
      "Granular permission matrices down to individual field visibility.",
    ],
    [
      "🛡️",
      "Secure Platform",
      "SOC 2 certified, AES-256 encryption, full audit logs and 99.9% uptime SLA.",
    ],
    [
      "⚡",
      "Fast Performance",
      "Sub-200ms API responses with global CDN and edge caching.",
    ],
    [
      "✨",
      "Modern UI",
      "Designed for daily power users — keyboard shortcuts, command palette and dark mode.",
    ],
  ];
  return (
    <section className="section section-bg-900">
      <div className="container">
        <div className="section-header reveal">
          <div className="eyebrow">Why GraphuraCRM</div>
          <h2 className="heading-lg">
            Built for teams that
            <br />
            <span className="text-gradient">refuse to slow down</span>
          </h2>
        </div>
        <div className="why-grid">
          {cards.map(([ic, t, d], i) => (
            <div
              key={t}
              className="glass-card why-card reveal"
              style={{ transitionDelay: `${i * 0.06}s` }}
            >
              <div className="why-icon">{ic}</div>
              <div className="why-title">{t}</div>
              <div className="why-desc">{d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Real-time Analytics removed

// ─── BUSINESS GROWTH ──────────────────────────────────────────────────────────
function BusinessGrowth() {
  const metrics = [
    {
      label: "Average Revenue Increase",
      val: "58%",
      pct: 58,
      color: "#22c55e",
    },
    {
      label: "Lead Conversion Improvement",
      val: "64%",
      pct: 64,
      color: "#3b82f6",
    },
    {
      label: "Reduction in Admin Work",
      val: "78%",
      pct: 78,
      color: "#a78bfa",
    },
    {
      label: "Faster Sales Cycle",
      val: "52%",
      pct: 52,
      color: "#22d3ee",
    },
    {
      label: "Team Productivity Gain",
      val: "69%",
      pct: 69,
      color: "#f97316",
    },
  ];
  return (
    <section className="section">
      <div className="container">
        <div className="section-header reveal">
          <div className="eyebrow">Business Impact</div>
          <h2 className="heading-lg">
            Real results from
            <br />
            <span className="text-gradient">real customers</span>
          </h2>
        </div>
        <div className="growth-grid reveal">
          <div>
            <h3
              style={{
                fontFamily: "Space Grotesk",
                fontSize: "1.5rem",
                fontWeight: 700,
                marginBottom: 14,
              }}
            >
              Customers see measurable impact within 90 days
            </h3>
            <p
              style={{
                color: "var(--text-secondary)",
                lineHeight: 1.7,
                marginBottom: 28,
                fontSize: "0.95rem",
              }}
            >
              Based on responses from 840 GraphuraCRM customers surveyed after
              their first 90 days. Numbers reflect median improvements across
              company sizes.
            </p>
            <a
              onClick={() => handleExternalLink("/admin-register")}
              className="btn-primary"
              style={{ cursor: "pointer" }}
            >
              See how we do it →
            </a>
          </div>
          <div className="growth-metrics">
            {metrics.map((m) => (
              <div className="growth-item" key={m.label}>
                <div className="growth-header">
                  <span className="growth-label">{m.label}</span>
                  <span className="growth-val">{m.val}</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${m.pct}%`, background: m.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────
function Testimonials() {
  const [offset, setOffset] = useState(0);
  const [width, setWidth] = useState(window.innerWidth);
  const testimonials = [
    {
      name: "Alex Reeves",
      company: "ScaleBridge Capital",
      text: "GraphuraCRM replaced four separate tools for us. The lead pipeline alone saved our reps 3 hours a day. The finance module generates invoices we used to spend a week on.",
      color: "#3b82f6",
    },
    {
      name: "Priya Kapoor",
      company: "Pinnacle Realty Group",
      text: "We manage 200+ agents across 12 cities and GraphuraCRM handles it effortlessly. The attendance module and role permissions are the best I've seen in any CRM.",
      color: "#a78bfa",
    },
    {
      name: "Marcus Williams",
      company: "FuturaTech Solutions",
      text: "Migrated from Salesforce. Implementation took 2 days, not 2 months. The reporting dashboards are genuinely beautiful and our leadership actually uses them.",
      color: "#22d3ee",
    },
    {
      name: "Hana Müller",
      company: "Nexova Logistics",
      text: "The HRM + leads integration was the killer feature. When a deal closes, our HR team gets automatically notified to onboard the account manager. Seamless.",
      color: "#22c55e",
    },
    {
      name: "Rajesh Nair",
      company: "CloudFirst Ventures",
      text: "ROI was visible in the first month. We tracked $340K in recoverable invoices that had fallen through the cracks. Support team response is incredible too.",
      color: "#f97316",
    },
    {
      name: "Sophie Laurent",
      company: "Elevate Media Group",
      text: "The bulk lead upload with automatic deduplication saved us 2 weeks of manual cleanup. Every feature feels thought through by someone who actually sells.",
      color: "#ec4899",
    },
  ];

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const visibleCount = width < 600 ? 1 : width < 900 ? 2 : 3;
  const cardW = width < 600 ? 100 : width < 900 ? 50 : 33.333;

  useEffect(() => {
    const maxOffset = testimonials.length - visibleCount;
    const t = setInterval(
      () => setOffset((p) => (p >= maxOffset ? 0 : p + 1)),
      4000,
    );
    return () => clearInterval(t);
  }, [visibleCount, testimonials.length]);

  const translateX =
    -(offset % (testimonials.length - visibleCount + 1)) * cardW;

  return (
    <section className="section section-bg-900" style={{ overflow: "hidden" }}>
      <div className="container">
        <div className="section-header reveal">
          <div className="eyebrow">Customer Stories</div>
          <h2 className="heading-lg">
            Trusted by teams
            <br />
            <span className="text-gradient">who demand results</span>
          </h2>
        </div>
        <div className="testimonials-slider">
          <div
            className="testimonials-track"
            style={{ transform: `translateX(${translateX}%)` }}
          >
            {testimonials.map((t) => (
              <div key={t.name} className="testimonial-slide">
                <div className="glass-card testimonial-card">
                  <div className="test-quote">"</div>
                  <p className="test-text">{t.text}</p>
                  <div className="test-author">
                    <div
                      className="test-avatar"
                      style={{
                        background: t.color + "25",
                        color: t.color,
                      }}
                    >
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="test-stars">★★★★★</div>
                      <div className="test-name">{t.name}</div>
                      <div className="test-company">{t.company}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 16,
            marginTop: 24,
          }}
        >
          <button
            className="showcase-btn"
            onClick={() => {
              const maxOffset = testimonials.length - visibleCount;
              setOffset((p) => (p === 0 ? maxOffset : p - 1));
            }}
            style={{ fontSize: "1.2rem" }}
          >
            ‹
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            {testimonials
              .slice(0, testimonials.length - visibleCount + 1)
              .map((_, i) => (
                <div
                  key={i}
                  onClick={() => setOffset(i)}
                  style={{
                    width: offset === i ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    background:
                      offset === i ? "var(--blue-400)" : "var(--text-muted)",
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                />
              ))}
          </div>
          <button
            className="showcase-btn"
            onClick={() => {
              const maxOffset = testimonials.length - visibleCount;
              setOffset((p) => (p === maxOffset ? 0 : p + 1));
            }}
            style={{ fontSize: "1.2rem" }}
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState(null);
  const faqs = [
    [
      "What is GraphuraCRM?",
      "GraphuraCRM is an all-in-one business management platform covering Sales CRM, Finance, HRM, Project Management, Support and Analytics — all connected in a single product with a unified data layer.",
    ],
    [
      "Can I manage multiple teams?",
      "Yes. GraphuraCRM supports unlimited teams, sub-teams, and hierarchies. Each team can have its own targets, pipelines, lead queues, and reporting dashboards, all controlled from a single Super Admin account.",
    ],
    [
      "Can I upload leads in bulk?",
      "Absolutely. Upload via CSV/Excel, connect via REST API, or use our native integrations with Facebook Lead Ads, Google Ads and Zapier. Duplicate detection and field mapping run automatically on import.",
    ],
    [
      "Can I generate invoices?",
      "Yes. The Finance module includes a full invoice builder with custom branding, line items, tax rules, e-signatures and automated payment reminders. Invoices sync with your lead and project records automatically.",
    ],
    [
      "Can I manage employee attendance?",
      "Yes. The HRM module includes geo-fenced check-in/out, shift scheduling, overtime calculation, biometric integration support and monthly attendance reports exportable to payroll formats.",
    ],
    [
      "Can I track sales performance?",
      "Deeply. Rep-level dashboards show call volume, conversion rate, average deal size, pipeline velocity and quota attainment. Leaderboards and goal alerts keep teams motivated in real time.",
    ],
    [
      "Can I manage multiple departments?",
      "Yes. Each department (Sales, Finance, HRM, Support, Projects) has its own module with custom workflows, and the Super Admin sees everything in one unified view with cross-department reports.",
    ],
  ];
  return (
    <section className="section" id="faq">
      <div className="container">
        <div className="section-header reveal">
          <div className="eyebrow">FAQ</div>
          <h2 className="heading-lg">
            Answers to the
            <br />
            <span className="text-gradient">questions we get most</span>
          </h2>
        </div>
        <div className="faq-list">
          {faqs.map(([q, a], i) => (
            <div
              key={q}
              className="faq-item reveal"
              style={{ transitionDelay: `${i * 0.06}s` }}
            >
              <div
                className="faq-question"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span>{q}</span>
                <span className={`faq-icon ${open === i ? "open" : ""}`}>
                  +
                </span>
              </div>
              <div className={`faq-answer ${open === i ? "open" : ""}`}>
                {a}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CONTACT ──────────────────────────────────────────────────────────────────
function Contact() {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      await axios.post(`${API_BASE_URL}/public/contact`, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
        company: form.company, // Even though not strictly required by model, good to send if needed later
      });
      setSubmitted(true);
      toast.success("Query submitted successfully");
      setForm({
        name: "",
        company: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit query. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <section className="section section-bg-900" id="contact">
      <div className="container">
        <div className="section-header reveal">
          <div className="eyebrow">Get in Touch</div>
          <h2 className="heading-lg">
            Talk to our
            <br />
            <span className="text-gradient">team today</span>
          </h2>
        </div>
        <div className="contact-grid reveal">
          <div className="contact-info">
            <h3>Ready to transform how your business operates?</h3>
            <p>
              Our solution engineers will walk you through a personalised demo
              matched to your industry and team size — no generic pitches.
            </p>
            {[
              ["✉️", "Sales Enquiries", "sales@graphuracrm.io"],
              ["🎧", "Technical Support", "support@graphuracrm.io"],
              ["📞", "Phone", "+ 1 (800) 629-8724"],
              [
                "📍",
                "Head Office",
                "500 Technology Square, Cambridge, MA 02139",
              ],
            ].map(([ic, l, v]) => (
              <div className="contact-item" key={l}>
                <div className="contact-item-icon">{ic}</div>
                <div>
                  <div className="contact-item-label">{l}</div>
                  <div className="contact-item-val">{v}</div>
                </div>
              </div>
            ))}
          </div>
          {submitted ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "60px 40px",
                background: "var(--glass)",
                border: "1px solid var(--glass-border)",
                borderRadius: 16,
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: 16 }}>✅</div>
              <h3
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  marginBottom: 10,
                }}
              >
                Enquiry received
              </h3>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.95rem",
                }}
              >
                Our team will reply within 2 business hours. Check your inbox
                for a confirmation.
              </p>
            </div>
          ) : (
            <form
              className="contact-form glass-card"
              style={{ padding: 36 }}
              onSubmit={handleSubmit}
            >
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Alex Reeves"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Acme Corp"
                    value={form.company}
                    onChange={(e) =>
                      setForm({ ...form, company: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="alex@acme.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    className="form-input"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Message *</label>
                <textarea
                  className="form-textarea"
                  rows={5}
                  placeholder="Tell us about your team size, current tools, and what you're hoping to improve..."
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  justifyContent: "center",
                  padding: "16px",
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                }}
              >
                {isSubmitting ? "Submitting..." : "Submit Enquiry →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTA({ onWatchTutorial }) {
  return (
    <section className="section">
      <div className="container">
        <div className="cta-section reveal">
          <div className="eyebrow">Get Started</div>
          <h2 className="heading-lg">
            Ready to manage your entire
            <br />
            <span className="text-gradient">business from one platform?</span>
          </h2>
          <p>
            Join 2,400+ companies that replaced their fragmented toolset with
            GraphuraCRM. Setup takes under an hour.
          </p>
          <div className="cta-btns">
            <a
              onClick={() => handleExternalLink("/admin-register")}
              className="btn-primary"
              style={{
                fontSize: "1rem",
                padding: "16px 32px",
                cursor: "pointer",
              }}
            >
              🚀 Start Free Trial
            </a>
            <a
              onClick={() =>
                handleExternalLink(
                  "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                )
              }
              className="btn-outline"
              style={{
                fontSize: "1rem",
                padding: "16px 32px",
                cursor: "pointer",
              }}
            >
              🎥 Watch a CRM Tutorial
            </a>
          </div>
          <p
            style={{
              marginTop: 20,
              fontSize: "0.82rem",
              color: "var(--text-muted)",
            }}
          >
            No credit card required · 14-day free trial · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  const cols = [
    {
      title: "Product",
      links: ["Features", "Modules", "Security", "Changelog", "Roadmap"],
    },
    {
      title: "Solutions",
      links: ["Sales Teams", "Finance Ops", "Enterprises"],
    },
    {
      title: "Resources",
      links: ["Documentation", "API Reference", "Blog", "Case Studies"],
    },
    {
      title: "Company",
      links: ["About Us", "Careers", "Security", "Contact"],
    },
  ];
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="nav-logo"
              style={{ textDecoration: "none", cursor: "pointer" }}
            >
              <div className="nav-logo-icon">⚡</div>
              GraphuraCRM
            </a>
            <p>
              The CRM platform that runs your entire business — sales, finance,
              management and projects in one connected workspace.
            </p>
            <div className="footer-social">
              {[
                ["💼", "https://linkedin.com"],
                ["📘", "https://facebook.com"],
                ["📷", "https://instagram.com"],
                ["🐦", "https://twitter.com"],
              ].map(([ic, h]) => (
                <a
                  key={h}
                  onClick={() => handleExternalLink(h)}
                  className="social-btn"
                  style={{ cursor: "pointer" }}
                >
                  {ic}
                </a>
              ))}
            </div>
          </div>
          {cols.map((col) => (
            <div className="footer-col" key={col.title}>
              <h4>{col.title}</h4>
              {col.links.map((l) => {
                const handleClick = () => {
                  const targetId = l.toLowerCase().replace(" ", "-");
                  const el = document.getElementById(targetId);
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                  else window.scrollTo({ top: 0, behavior: "smooth" });
                };
                return (
                  <a key={l} onClick={handleClick}>
                    {l}
                  </a>
                );
              })}
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <p>© 2026 GraphuraCRM Inc. All rights reserved.</p>
          <div style={{ display: "flex", gap: 20 }}>
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
              (l) => (
                <a
                  key={l}
                  style={{
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                    fontSize: "0.82rem",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                >
                  {l}
                </a>
              ),
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── VIDEO MODAL ──────────────────────────────────────────────────────────────
function VideoModal({ isOpen, onClose }) {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  const videoSteps = [
    {
      title: "Dashboard Tour",
      desc: "Real-time unified KPIs",
      bg: "linear-gradient(135deg, #071428, #0a1e3d)",
    },
    {
      title: "Lead Routing Pipeline",
      desc: "Automated distribution rules",
      bg: "linear-gradient(135deg, #0a1e3d, #0d2756)",
    },
    {
      title: "Client Collab Portal",
      desc: "Live project feedback tracking",
      bg: "linear-gradient(135deg, #0d2756, #071428)",
    },
    {
      title: "Automated Invoicing",
      desc: "One-click invoice generation",
      bg: "linear-gradient(135deg, #071428, #112f6a)",
    },
  ];

  useEffect(() => {
    if (!isOpen) return;
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setActiveStep((s) => (s + 1) % videoSteps.length);
            return 0;
          }
          return prev + 1.5;
        });
      }, 60);
    }
    return () => clearInterval(timer);
  }, [isOpen, isPlaying]);

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isOpen ? "open" : ""}`} onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">
            🎬 GraphuraCRM - Video Walkthrough Tour
          </span>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="simulated-player">
            <div
              className="simulated-screen"
              style={{ background: videoSteps[activeStep].bg }}
            >
              <div className="simulated-nav">
                <div className="dot dot-r" />
                <div className="dot dot-y" />
                <div className="dot dot-g" />
                <span
                  style={{
                    fontSize: "0.65rem",
                    marginLeft: 8,
                    color: "var(--text-secondary)",
                  }}
                >
                  graphuracrm.com/tour/
                  {videoSteps[activeStep].title
                    .toLowerCase()
                    .replace(/ /g, "-")}
                </span>
              </div>
              <div
                className="simulated-content"
                style={{
                  flexDirection: "column",
                  padding: 24,
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: "2.5rem", marginBottom: 12 }}>
                  {["📊", "🎯", "🤝", "💰"][activeStep]}
                </span>
                <h3
                  style={{
                    fontSize: "1.4rem",
                    fontFamily: "Space Grotesk",
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  {videoSteps[activeStep].title}
                </h3>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  {videoSteps[activeStep].desc}
                </p>
              </div>
            </div>
            <div className="simulated-controls">
              <button
                className="play-btn"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? "⏸" : "▶"}
              </button>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.75rem",
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>
                    {videoSteps[activeStep].title}
                  </span>
                  <span>Step {activeStep + 1} of 4</span>
                </div>
                <div className="play-progress-bar">
                  <div
                    className="play-progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SCROLL TO TOP BUTTON ──────────────────────────────────────────────────────
function ScrollToTop() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const MathRound = Math.round;
        const scrollPercent = (currentScrollY / totalHeight) * 100;
        setProgress(scrollPercent);
      }
      setVisible(currentScrollY > 300);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    if (!buttonRef.current) return;

    // Disable native smooth scrolling temporarily to let GSAP update scroll coordinates instantly
    document.documentElement.style.scrollBehavior = "auto";

    // Add launching class to disable CSS transitions during GSAP control
    buttonRef.current.classList.add("launching");

    // 1. Rumble shake effect on click (stationary)
    const shakeTween = gsap.to(buttonRef.current, {
      x: "random(-1.5, 1.5)",
      y: "random(-1.5, 1.5)",
      repeat: -1, // Keep repeating during the scroll
      yoyo: true,
      duration: 0.04,
    });

    // 2. Perform synchronized smooth page scroll using GSAP easing
    const scrollObj = { y: window.scrollY };
    let interval;

    gsap.to(scrollObj, {
      y: 0,
      duration: 1.25,
      ease: "power2.out",
      onUpdate: () => {
        window.scrollTo(0, scrollObj.y);
      },
      onComplete: () => {
        // Stop shaking and clear interval when page is back at the top
        shakeTween.kill();
        clearInterval(interval);
        document
          .querySelectorAll(".fire-particle")
          .forEach((el) => el.remove());
        gsap.set(buttonRef.current, { clearProps: "all" });
        buttonRef.current.classList.remove("launching");
        // Restore native smooth scrolling
        document.documentElement.style.scrollBehavior = "smooth";
      },
    });

    // 3. Generate dynamic fire particles trail trailing down from the bottom of the stable button
    interval = setInterval(() => {
      if (!buttonRef.current || window.scrollY < 200) {
        clearInterval(interval);
        return;
      }

      const currentRect = buttonRef.current.getBoundingClientRect();
      const currentX = currentRect.left + currentRect.width / 2;
      const currentY = currentRect.top + currentRect.height - 8;

      // Generate 2 glowing particles per step for a dense flame tail
      for (let i = 0; i < 2; i++) {
        const p = document.createElement("div");
        p.className = "fire-particle";
        p.style.left = `${currentX + (Math.random() - 0.5) * 8 - 4}px`;
        p.style.top = `${currentY}px`;
        document.body.appendChild(p);

        gsap.to(p, {
          y: "+=" + (40 + Math.random() * 50),
          x: "+=" + (Math.random() - 0.5) * 20,
          scale: 0.1,
          opacity: 0,
          duration: 0.4 + Math.random() * 0.4,
          ease: "power2.out",
          onComplete: () => p.remove(),
        });
      }
    }, 25);
  };

  return (
    <div
      ref={buttonRef}
      className={`scroll-top-btn ${visible ? "visible" : ""}`}
      onClick={handleClick}
      title="Scroll to top"
    >
      <svg className="scroll-progress-svg" viewBox="0 0 50 50">
        <defs>
          <linearGradient id="arrow-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
        <circle cx="25" cy="25" r="20" className="scroll-progress-bg" />
        <circle
          cx="25"
          cy="25"
          r="20"
          className="scroll-progress-fill"
          strokeDasharray="125.66"
          strokeDashoffset={125.66 - (progress / 100) * 125.66}
          transform="rotate(-90 25 25)"
        />
        <path
          d="M25 17 L18 24 H22 V33 H28 V24 H32 Z"
          className="scroll-arrow-path"
        />
      </svg>
    </div>
  );
}
/* ─── ROOT COMPONENT ─────────────────────────────────────────────────────────
   Import and use in AppRoutes like:
     import LandingPage from "../pages/LandingPage/Index";
     <Route path="/landing" element={<LandingPage />} />
   No MainLayout wrapper needed — the page is fully self-contained.
──────────────────────────────────────────────────────────────────────────────*/
export default function LandingPage() {
  const [showTutorial, setShowTutorial] = useState(false);

  // Dynamic body class for Landing Page background and styling
  useEffect(() => {
    document.body.classList.add("landing-page-body");
    return () => {
      document.body.classList.remove("landing-page-body");
    };
  }, []);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.1 },
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Navbar />
      <Hero onWatchTutorial={() => setShowTutorial(true)} />
      <TrustSection />
      <ProductShowcase />
      <HowItWorks />
      <WorkflowViz />
      <ModulesSection />
      <FeaturesSection />
      <WhyChooseUs />
      <BusinessGrowth />
      <Testimonials />
      <FAQ />
      <Contact />
      <CTA onWatchTutorial={() => setShowTutorial(true)} />
      <Footer />
      <VideoModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
      <ScrollToTop />
    </>
  );
}
