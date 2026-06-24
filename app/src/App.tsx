import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { loadProfile } from "./data/loadProfile";
import type { Profile } from "./data/profile.types";
import {
  BrowserRouter,
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Home" },
  { to: "/experience", label: "Experience" },
  { to: "/projects", label: "Projects" },
  { to: "/contact", label: "Contact" },
];

const THEME_STORAGE_KEY = "portfolio-theme-mode";

type ThemeMode = "system" | "light" | "dark";
type ResolvedTheme = "light" | "dark";

function getSystemTheme(): ResolvedTheme {
  if (typeof window.matchMedia !== "function") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function formatDate(value: string): string {
  const [year, month] = value.split("-").map(Number);
  const parsed = new Date(year, (month ?? 1) - 1, 1);

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function socialEntries(profile: Profile) {
  return [
    { label: "LinkedIn", href: profile.basics.links?.linkedin },
    { label: "GitHub", href: profile.basics.links?.github },
    { label: "X", href: profile.basics.links?.twitter },
    { label: "Instagram", href: profile.basics.links?.instagram },
  ].filter((item): item is { label: string; href: string } => Boolean(item.href));
}

function SocialLinks({ profile }: { profile: Profile }) {
  const links = socialEntries(profile);

  if (links.length === 0) {
    return null;
  }

  return (
    <nav className="social-links" aria-label="Social links">
      {links.map((item) => (
        <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer">
          {item.label}
        </a>
      ))}
    </nav>
  );
}

function SectionHeading({
  title,
  kicker,
  blurb,
}: {
  title: string;
  kicker: string;
  blurb?: string;
}) {
  return (
    <div className="section-heading">
      <p className="section-kicker">{kicker}</p>
      <h2>{title}</h2>
      {blurb && <p className="section-blurb">{blurb}</p>}
    </div>
  );
}

function FeaturedInSection({
  profile,
  limit,
}: {
  profile: Profile;
  limit?: number;
}) {
  const featured = profile.featuredIn?.slice(0, limit);

  if (!featured || featured.length === 0) {
    return null;
  }

  return (
    <section className="section card">
      <SectionHeading
        kicker="Media"
        title="Featured In"
        blurb="Selected interviews, press stories, and ecosystem recognition across South African tech."
      />
      <div className="project-grid">
        {featured.map((feature, i) => (
          <article className="project" key={i}>
            <h3>{feature.title}</h3>
            <p className="period">
              {feature.publisher} - {feature.date}
            </p>
            <p>{feature.summary}</p>
            <a href={feature.url} target="_blank" rel="noopener noreferrer">
              Read article
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

function HomePage({ profile }: { profile: Profile }) {
  const heroRef = useRef<HTMLElement | null>(null);
  const topSkills = profile.skills.slice(0, 12);
  const tickerSkills = [...topSkills, ...topSkills];
  const totalYears = new Date().getFullYear() - 2021;
  const activeProjects = profile.projects.length;
  const featuredCount = profile.featuredIn?.length ?? 0;
  const initials = profile.basics.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const handleHeroMove = (event: ReactMouseEvent<HTMLElement>) => {
    if (!heroRef.current) {
      return;
    }

    const rect = heroRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    heroRef.current.style.setProperty("--mx", `${x}px`);
    heroRef.current.style.setProperty("--my", `${y}px`);
  };

  const handleHeroLeave = () => {
    if (!heroRef.current) {
      return;
    }

    heroRef.current.style.setProperty("--mx", "50%");
    heroRef.current.style.setProperty("--my", "50%");
  };

  return (
    <>
      <header
        ref={heroRef}
        className="hero card interactive-hero"
        onMouseMove={handleHeroMove}
        onMouseLeave={handleHeroLeave}
      >
        <div className="hero-grid">
          <div>
            <p className="eyebrow">Portfolio 2026</p>
            <h1>{profile.basics.name}</h1>
            <p className="hero-title">{profile.basics.title}</p>

            <div className="meta-row">
              <span>{profile.basics.location}</span>
              {profile.basics.phone && <span>{profile.basics.phone}</span>}
              <span>
                <a href={`mailto:${profile.basics.email}`}>{profile.basics.email}</a>
              </span>
            </div>
          </div>

          <div className="hero-avatar-wrap" aria-label="Profile photo">
            {profile.basics.headshot ? (
              <img
                className="hero-avatar"
                src={profile.basics.headshot}
                alt={`${profile.basics.name} portrait`}
              />
            ) : (
              <div className="hero-avatar hero-avatar-fallback" aria-hidden="true">
                {initials}
              </div>
            )}
          </div>
        </div>

        <p className="summary">{profile.summary}</p>

        {profile.objective && (
          <p className="summary summary-secondary">{profile.objective}</p>
        )}

        <div className="metric-strip">
          <article className="metric-card">
            <strong>{Math.max(totalYears, 1)}+</strong>
            <span>Years building software</span>
          </article>
          <article className="metric-card">
            <strong>{activeProjects}</strong>
            <span>Portfolio projects</span>
          </article>
          <article className="metric-card">
            <strong>{featuredCount}</strong>
            <span>Media features</span>
          </article>
        </div>

        <div className="hero-actions">
          <Link className="action-link action-primary" to="/projects">
            View Projects
          </Link>
          <Link className="action-link" to="/contact">
            Contact Me
          </Link>
        </div>

        <SocialLinks profile={profile} />
      </header>

      <section className="section card motion-showcase">
        <SectionHeading
          kicker="Live"
          title="Engineering In Motion"
          blurb="A moving snapshot of the stack and delivery focus currently driving implementation work."
        />

        <div className="status-row">
          <span className="status-dot" aria-hidden="true" />
          <p>Available for impactful full-stack .NET and platform engineering opportunities.</p>
        </div>

        <div className="ticker" aria-label="Technology ticker">
          <div className="ticker-track">
            {tickerSkills.map((skill, i) => (
              <span className="ticker-pill" key={`${skill.name}-${i}`}>
                {skill.name}
              </span>
            ))}
          </div>
        </div>

        <div className="orbit-zone" aria-hidden="true">
          <div className="orbit-core" />
          <span className="orbit-dot orbit-dot-a" />
          <span className="orbit-dot orbit-dot-b" />
          <span className="orbit-dot orbit-dot-c" />
        </div>
      </section>

      <section className="section card">
        <SectionHeading
          kicker="Capabilities"
          title="Core Skills"
          blurb="Production-focused engineering across backend systems, test automation, and cloud delivery."
        />
        <div className="chips">
          {topSkills.map((skill, i) => (
            <span className="chip" key={i}>
              {skill.name}
            </span>
          ))}
        </div>
      </section>

      {profile.highlights && profile.highlights.length > 0 && (
        <section className="section card">
          <SectionHeading
            kicker="Highlights"
            title="Recognition"
            blurb="Key wins and milestones that shaped the current engineering trajectory."
          />
          <div className="project-grid">
            {profile.highlights.map((highlight, i) => (
              <article className="project" key={i}>
                <h3>{highlight.title}</h3>
                <p>{highlight.description}</p>
                {highlight.stats && highlight.stats.length > 0 && (
                  <div className="stats-row">
                    {highlight.stats.map((stat, j) => (
                      <div className="stat" key={j}>
                        <strong>{stat.value}</strong>
                        <span>{stat.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      <FeaturedInSection profile={profile} limit={3} />
    </>
  );
}

function ExperiencePage({ profile }: { profile: Profile }) {
  return (
    <>
      <section className="section card">
        <SectionHeading
          kicker="Career"
          title="Experience"
          blurb="A progression from quality engineering into full-stack delivery and technical ownership."
        />
        <div className="timeline">
          {profile.experience.map((job, i) => (
            <article className="timeline-item" key={i}>
              <h3>
                {job.role} <span>@ {job.org}</span>
              </h3>
              <p className="period">
                {formatDate(job.startDate)} -{" "}
                {job.current || !job.endDate ? "Present" : formatDate(job.endDate)}
              </p>
              <p className="location">{job.location}</p>
              <ul>
                {job.bullets.map((bullet, j) => (
                  <li key={j}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section split">
        <article className="card">
          <SectionHeading kicker="Academic" title="Education" />
          {profile.education.map((edu, i) => (
            <article className="mini-card" key={i}>
              <h3>{edu.degree}</h3>
              <p>{edu.school}</p>
              <p className="period">
                {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
              </p>
              {edu.notes && <p>{edu.notes}</p>}
            </article>
          ))}
        </article>

        <article className="card">
          <SectionHeading kicker="Credentials" title="Certifications" />
          {profile.certifications.map((cert, i) => (
            <article className="mini-card" key={i}>
              <h3>{cert.name}</h3>
              <p>{cert.issuer}</p>
              <p className="period">{cert.year}</p>
            </article>
          ))}
        </article>
      </section>
    </>
  );
}

function ProjectsPage({ profile }: { profile: Profile }) {
  return (
    <>
      <section className="section card">
        <SectionHeading
          kicker="Builds"
          title="Projects"
          blurb="Applied projects across data, product engineering, and hackathon execution."
        />
        <div className="project-grid">
          {profile.projects.map((project, i) => (
            <article className="project" key={i}>
              <p className="badge">{project.badge}</p>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <div className="chips">
                {project.stack.map((item, j) => (
                  <span className="chip" key={j}>
                    {item}
                  </span>
                ))}
              </div>
              {project.link && (
                <a href={project.link} target="_blank" rel="noopener noreferrer">
                  Read more
                </a>
              )}
            </article>
          ))}
        </div>
      </section>

      <FeaturedInSection profile={profile} />
    </>
  );
}

function ContactPage({ profile }: { profile: Profile }) {
  return (
    <section className="section card contact-card">
      <SectionHeading
        kicker="Connect"
        title="Contact"
        blurb="If you are building impactful systems, I would love to collaborate."
      />
      <p className="contact-lead">
        I am open to software engineering, data engineering, and quality engineering
        opportunities. Reach out and let us build impactful products.
      </p>

      <div className="contact-grid">
        <article className="mini-card">
          <h3>Email</h3>
          <p>
            <a href={`mailto:${profile.basics.email}`}>{profile.basics.email}</a>
          </p>
        </article>

        <article className="mini-card">
          <h3>Location</h3>
          <p>{profile.basics.location}</p>
        </article>

        {profile.basics.phone && (
          <article className="mini-card">
            <h3>Phone</h3>
            <p>{profile.basics.phone}</p>
          </article>
        )}

        {profile.basics.address && (
          <article className="mini-card">
            <h3>Address</h3>
            <p>{profile.basics.address}</p>
          </article>
        )}

        <article className="mini-card">
          <h3>Response Time</h3>
          <p>Usually within 24 hours for professional opportunities.</p>
        </article>
      </div>

      <SocialLinks profile={profile} />
    </section>
  );
}

function SiteLayout({
  themeMode,
  onThemeModeChange,
}: {
  themeMode: ThemeMode;
  onThemeModeChange: (mode: ThemeMode) => void;
}) {
  const profile = loadProfile();
  const location = useLocation();

  return (
    <main className="site-shell">
      <div className="orb orb-a" aria-hidden="true" />
      <div className="orb orb-b" aria-hidden="true" />

      <header className="topbar card">
        <p className="brand">KM</p>
        <nav className="site-nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
          <div className="topbar-actions">
            <select
              id="theme-mode"
              className="theme-select"
              value={themeMode}
              onChange={(event) => onThemeModeChange(event.target.value as ThemeMode)}
              aria-label="Theme mode"
            >
              <option value="system">Theme: System</option>
              <option value="dark">Theme: Dark</option>
              <option value="light">Theme: Light</option>
            </select>
          </div>
        </nav>
      </header>

      <div key={location.pathname} className="route-stage">
        <Routes>
          <Route path="/" element={<HomePage profile={profile} />} />
          <Route path="/experience" element={<ExperiencePage profile={profile} />} />
          <Route path="/projects" element={<ProjectsPage profile={profile} />} />
          <Route path="/contact" element={<ContactPage profile={profile} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <footer className="footer-note">
        <p>
          {profile.basics.name} | {new Date().getFullYear()}
        </p>
      </footer>
    </main>
  );
}

function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);

    if (saved === "light" || saved === "dark" || saved === "system") {
      return saved;
    }

    return "system";
  });
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    return getSystemTheme();
  });

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      document.documentElement.setAttribute("data-theme", themeMode === "system" ? "light" : themeMode);
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const updateResolvedTheme = () => {
      const systemTheme: ResolvedTheme = media.matches ? "dark" : "light";
      const next = themeMode === "system" ? systemTheme : themeMode;
      setResolvedTheme(next);
      document.documentElement.setAttribute("data-theme", next);
    };

    updateResolvedTheme();

    const handleChange = () => {
      if (themeMode === "system") {
        updateResolvedTheme();
      }
    };

    media.addEventListener("change", handleChange);

    return () => {
      media.removeEventListener("change", handleChange);
    };
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [themeMode]);

  useEffect(() => {
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  return (
    <BrowserRouter>
      <SiteLayout themeMode={themeMode} onThemeModeChange={setThemeMode} />
    </BrowserRouter>
  );
}

export default App;
