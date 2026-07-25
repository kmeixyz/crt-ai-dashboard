import React, { useEffect, useRef, useState } from "react";
import landing from "../styles/Landing.module.css";

const NAV_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "how-its-built", label: "Tech Stack" },
  { id: "the-team", label: "Our Team" },
];

const GLANCE = [
  {
    label: "Built for",
    value: "Chicago Public Schools",
    href: "https://www.cps.edu",
  },
  {
    label: "Built at",
    value: "Discovery Partners Institute",
    href: "https://dpi.illinois.edu",
  },
  {
    label: "Contact",
    value: "rukminia@uillinois.edu",
    href: "mailto:rukminia@uillinois.edu",
  },
];

const OVERVIEW_LEAD =
  "Create STEM lessons, activities, assessments, and feedback tailored to your class.";

const OVERVIEW_PARAS = [
  "Lumen is a three-step resource builder for high school STEM teachers. Choose a resource " +
    "type, describe your class, and add context (community, reading level, tech access, " +
    "language, and supports). It generates a structured draft with built-in cultural " +
    "relevance and accessibility. The demo uses a mock generator (no API key required). " +
    "Review all output before using it, and never enter student-identifying information.",
];

const TECH_TEXT =
  "Built with React, Vite, and CSS Modules. Uses prompt templates with a deterministic mock " +
  "engine for offline demos, with optional integration via callLLM(). Drafts can be revised, " +
  "reviewed, copied, downloaded, or printed.";

const STEPS = [
  {
    num: "01",
    title: "Guided Builder",
    desc: "Set the resource, class, and context.",
  },
  {
    num: "02",
    title: "Built-In Review",
    desc: "Flags bias, accessibility gaps, and stereotype risk.",
  },
  {
    num: "03",
    title: "One-Click Revisions",
    desc: "Adapt drafts for access, language, tech, or learning needs.",
  },
];

const BUILT_ROWS = [
  {
    label: "Frontend",
    tags: ["React", "Vite", "CSS Modules", "Accessibility"],
  },
  {
    label: "Method",
    tags: ["CRP", "CSP", "UDL", "Differentiation"],
  },
  {
    label: "AI",
    tags: ["Mock engine", "Prompt templates", "Bias review"],
  },
];

const TEAM = [
  { name: "Rukmini Avadhanam", role: "Project Host", wide: true },
  { name: "Kevin Mei", role: "Project Team" },
  { name: "Brynn Walker", role: "Project Team" },
];

function initials(name) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function About() {
  const [activeSection, setActiveSection] = useState("overview");
  // Height of the site's sticky top nav, so the mobile sticky header (title +
  // section nav) docks directly beneath it instead of sliding underneath.
  const [navHeight, setNavHeight] = useState(0);
  // Ignore scroll-spy briefly after a sidebar click so hash/programmatic
  // jumps don't fight the intended active section (esp. Tech Stack near the
  // bottom of a short page).
  const ignoreSpyUntil = useRef(0);

  useEffect(() => {
    const measure = () => {
      const nav = document.querySelector("nav");
      if (nav) setNavHeight(nav.getBoundingClientRect().height);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    // Instant hash jumps on this page — global theme.css uses smooth scroll,
    // which animates through sections and makes the spy thrash the sidebar.
    // Use a dedicated class (not "about-page") so leftover app.css page-shell
    // padding on `.about-page` does not apply to <html>.
    const root = document.documentElement;
    root.classList.add("about-instant-scroll");

    const sections = NAV_SECTIONS.map((section) => document.getElementById(section.id)).filter(
      Boolean
    );

    const onScroll = () => {
      if (performance.now() < ignoreSpyUntil.current) return;

      // Active section = the one occupying the most of the viewport. This
      // handles short final sections that sit at the bottom of the page (e.g.
      // Tech Stack): the old "30%-line + force-last-when-near-bottom" rule
      // snapped the highlight to Our Team as soon as a sidebar click scrolled
      // near max scroll, so Tech Stack could never stay lit. On ties the
      // earlier section wins, keeping Overview active at the very top.
      const viewport = window.innerHeight;
      let current = sections[0]?.id;
      let maxVisible = -1;
      for (const el of sections) {
        const rect = el.getBoundingClientRect();
        const visible = Math.min(rect.bottom, viewport) - Math.max(rect.top, 0);
        if (visible > maxVisible) {
          maxVisible = visible;
          current = el.id;
        }
      }

      // The page is short enough that the final section (Our Team) can't scroll
      // to the top, so it never wins "most-visible". Activate it only at the
      // very bottom of the page (2px tolerance) — tight enough that it never
      // steals the highlight from Tech Stack mid-scroll.
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) {
        current = sections[sections.length - 1]?.id ?? current;
      }

      if (current) {
        setActiveSection((prev) => (prev === current ? prev : current));
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      root.classList.remove("about-instant-scroll");
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const goToSection = (event, id) => {
    event.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    ignoreSpyUntil.current = performance.now() + 400;
    setActiveSection(id);
    // Instant jump; scroll-margin-top on sections clears the sticky nav.
    el.scrollIntoView({ behavior: "auto", block: "start" });
    if (history.replaceState) {
      history.replaceState(null, "", `#${id}`);
    } else {
      window.location.hash = id;
    }
  };

  return (
    <div
      className={landing.aboutLayout}
      style={{ "--about-sticky-top": `${navHeight}px` }}
    >
      <aside className={landing.aboutSidebar}>
        <div className={landing.aboutSidebarInner}>
          <div className={landing.aboutSidebarHeader}>
            <h1 className={landing.aboutSidebarTitle}>About Lumen</h1>

            <nav className={landing.aboutNav} aria-label="About sections">
              {NAV_SECTIONS.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={(event) => goToSection(event, section.id)}
                  className={`${landing.aboutNavLink} ${
                    activeSection === section.id ? landing.aboutNavLinkActive : ""
                  }`}
                >
                  {section.label}
                </a>
              ))}
            </nav>
          </div>

          <div className={landing.glanceBlock}>
            <dl className={landing.glanceList}>
              {GLANCE.map((item) => (
                <div key={item.label} className={landing.glanceItem}>
                  <dt className={landing.glanceItemLabel}>{item.label}</dt>
                  <dd className={landing.glanceItemValue}>
                    {item.href ? (
                      <a
                        href={item.href}
                        className={landing.glanceLink}
                        {...(item.href.startsWith("http")
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {item.value}
                      </a>
                    ) : (
                      item.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </aside>

      <div className={landing.aboutContent}>
        <section id="overview" className={landing.aboutSection}>
          <h2 className={landing.aboutSectionTitle}>Overview</h2>
          <p className={landing.aboutLead}>{OVERVIEW_LEAD}</p>
          {OVERVIEW_PARAS.map((para, i) => (
            <p
              key={i}
              className={`${landing.aboutText} ${i > 0 ? landing.aboutTextSpaced : ""}`}
            >
              {para}
            </p>
          ))}
          <ol className={landing.stepList}>
            {STEPS.map((step) => (
              <li key={step.num} className={landing.stepItem}>
                <span className={landing.stepBody}>
                  <span className={landing.stepTitle}>{step.title}</span>
                  <span className={landing.stepDesc}>{step.desc}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <hr className={landing.aboutDivider} />

        <section id="how-its-built" className={landing.aboutSection}>
          <h2 className={landing.aboutSectionTitle}>Tech Stack</h2>
          <p className={landing.aboutText}>{TECH_TEXT}</p>
          <div className={landing.builtRows}>
            {BUILT_ROWS.map((row) => (
              <div key={row.label} className={landing.builtRow}>
                <span className={landing.builtRowLabel}>{row.label}</span>
                <div className={landing.tagGroup}>
                  {row.tags.map((tag) => (
                    <span key={tag} className={landing.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <hr className={landing.aboutDivider} />

        <section id="the-team" className={landing.aboutSection}>
          <h2 className={landing.aboutSectionTitle}>Our Team</h2>
          <div className={landing.teamGrid}>
            {TEAM.map((member) => (
              <div
                key={member.name}
                className={landing.teamCard}
                style={member.wide ? { gridColumn: "1 / -1" } : undefined}
              >
                <span className={landing.teamAvatar} aria-hidden>
                  {initials(member.name)}
                </span>
                <span className={landing.teamInfo}>
                  <span className={landing.teamName}>{member.name}</span>
                  <span className={landing.teamRole}>{member.role}</span>
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
