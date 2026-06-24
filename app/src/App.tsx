import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { motion } from "framer-motion";
import { loadProfile } from "./data/loadProfile";
import type { Profile } from "./data/profile.types";
import { resolveAsset } from "./assetMap";
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
  { to: "/education", label: "Education" },
  { to: "/projects", label: "Projects" },
  { to: "/recognition", label: "Recognitions" },
  { to: "/contact", label: "Contacts" },
];

const THEME_STORAGE_KEY = "portfolio-theme-mode";

type ThemeMode = "system" | "light" | "dark";
type ResolvedTheme = "light" | "dark";

const SKILL_GROUP_ORDER = [
  "primary",
  "devops",
  "backend",
  "databases",
  "frontend",
  "testing",
  "languages",
  "integrations",
  "data",
  "practice",
] as const;

type SkillGroupKey = (typeof SKILL_GROUP_ORDER)[number];

const SKILL_GROUP_LABELS: Record<SkillGroupKey, string> = {
  primary: "Primary Stack",
  devops: "CI/CD and DevOps",
  backend: "Backend and APIs",
  databases: "Databases",
  frontend: "Frontend",
  testing: "Testing and QA",
  languages: "Other Languages",
  integrations: "Integrations and Workflow",
  data: "Data and Analytics",
  practice: "Engineering Practice",
};

const SKILL_GROUP_BY_CATEGORY: Record<string, SkillGroupKey> = {
  "primary-stack": "primary",
  devops: "devops",
  backend: "backend",
  database: "databases",
  frontend: "frontend",
  mobile: "frontend",
  testing: "testing",
  language: "languages",
  integration: "integrations",
  data: "data",
  practice: "practice",
};

// One consistent scroll-reveal pattern used across every section, rather
// than a different one-off animation per component — per the design
// system's "an orchestrated moment usually lands harder than scattered
// effects" guidance. Respects prefers-reduced-motion via Framer Motion's
// own default behavior on viewport-triggered animations.
function Reveal({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

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
  ].filter((item): item is { label: string; href: string } =>
    Boolean(item.href)
  );
}

function SocialLinks({ profile }: { profile: Profile }) {
  const links = socialEntries(profile);

  if (links.length === 0) {
    return null;
  }

  return (
    <nav
      className="mt-6 flex flex-wrap gap-4 font-mono text-sm text-primary"
      aria-label="Social links"
    >
      {links.map((item) => (
        <a
          key={item.label}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-secondary"
        >
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
    <div className="mb-8">
      <p className="font-mono text-sm tracking-[0.05em] uppercase text-primary">
        {kicker}
      </p>
      <h2 className="mt-2 font-headline text-3xl font-bold text-on-surface md:text-4xl">
        {title}
      </h2>
      {blurb && (
        <p className="mt-2 max-w-2xl text-on-surface-variant">{blurb}</p>
      )}
    </div>
  );
}

function IntroOverlay({
  message,
  onComplete,
}: {
  message: string;
  onComplete: () => void;
}) {
  const prefersReducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [typed, setTyped] = useState(() =>
    prefersReducedMotion ? message : ""
  );
  const [done, setDone] = useState(() => prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion || done) {
      return;
    }

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTyped(message.slice(0, index));

      if (index >= message.length) {
        window.clearInterval(timer);
        setDone(true);
      }
    }, 20);

    return () => {
      window.clearInterval(timer);
    };
  }, [done, message, prefersReducedMotion]);

  useEffect(() => {
    if (overlayRef.current) {
      overlayRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (done && overlayRef.current) {
      overlayRef.current.focus();
    }
  }, [done]);

  useEffect(() => {
    const handleEnter = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== "NumpadEnter") {
        return;
      }

      event.preventDefault();

      if (!done) {
        setTyped(message);
        setDone(true);
        return;
      }

      onComplete();
    };

    window.addEventListener("keydown", handleEnter);
    return () => {
      window.removeEventListener("keydown", handleEnter);
    };
  }, [done, message, onComplete]);

  const handleOverlayKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== "NumpadEnter") {
      return;
    }

    event.preventDefault();

    if (!done) {
      setTyped(message);
      setDone(true);
      return;
    }

    onComplete();
  };

  const wrappedLines = typed
    .split(" ")
    .filter((part) => part.length > 0)
    .reduce<string[]>((lines, word) => {
      const current = lines[lines.length - 1] ?? "";
      const next = current ? `${current} ${word}` : word;

      if (next.length > 72 && current) {
        lines.push(word);
      } else if (lines.length === 0) {
        lines.push(word);
      } else {
        lines[lines.length - 1] = next;
      }

      return lines;
    }, []);
  const displayLines = wrappedLines.length > 0 ? wrappedLines : [""];

  return (
    <div
      ref={overlayRef}
      className="intro-overlay"
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onKeyDown={handleOverlayKeyDown}
    >
      <div className="intro-card">
        <div className="intro-workbench">
          <div className="intro-pane">
            <div className="intro-windowbar" aria-hidden="true">
              <span className="intro-dot intro-dot-red" />
              <span className="intro-dot intro-dot-amber" />
              <span className="intro-dot intro-dot-green" />
              <span className="intro-tab">about-me.ts</span>
            </div>

            <div className="intro-editor">
              <div className="intro-editor-head" aria-hidden="true">
                <span className="intro-spinner" />
                <p className="intro-kicker">Booting Portfolio Session</p>
              </div>

              <div className="intro-code-editor" aria-live="polite">
                <div className="intro-gutter" aria-hidden="true">
                  {displayLines.map((_, index) => (
                    <span key={`ln-${index}`}>{index + 1}</span>
                  ))}
                </div>
                <div className="intro-code-block">
                  {displayLines.map((line, index) => {
                    const isLastLine = index === displayLines.length - 1;
                    return (
                      <p className="intro-code-line intro-code-message" key={`msg-${index}`}>
                        <span className="token-string">{line}</span>
                        {isLastLine && !done && (
                          <span className="type-caret" aria-hidden="true" />
                        )}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {done && (
          <button className="btn-primary mt-6" onClick={onComplete}>
            Press Enter to Continue
          </button>
        )}
      </div>
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
    <section className="mx-auto max-w-5xl px-4 py-16 md:px-16">
      <SectionHeading
        kicker="Media"
        title="Featured In"
        blurb="Selected interviews, press stories, and ecosystem recognition across South African tech."
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {featured.map((feature, i) => {
          const photo = resolveAsset(feature.image);
          return (
            <article key={i} className="bento-card">
              {photo && (
                <img
                  src={photo}
                  alt={feature.title}
                  className="mb-4 h-32 w-full rounded-lg object-cover"
                />
              )}
              <h3 className="font-headline text-lg font-semibold text-on-surface">
                {feature.title}
              </h3>
              <p className="mt-1 font-mono text-xs text-on-surface-variant">
                {feature.publisher} — {feature.date}
              </p>
              <p className="mt-3 text-sm text-on-surface-variant">
                {feature.summary}
              </p>
              <a
                href={feature.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block font-mono text-sm text-primary transition-colors hover:text-secondary"
              >
                Read article →
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function HomePage({ profile }: { profile: Profile }) {
  const heroRef = useRef<HTMLElement | null>(null);
  const groupedSkills = profile.skills.reduce<Record<SkillGroupKey, string[]>>(
    (acc, skill) => {
      const group = SKILL_GROUP_BY_CATEGORY[skill.category] ?? "practice";
      acc[group].push(skill.name);
      return acc;
    },
    {
      primary: [],
      devops: [],
      backend: [],
      databases: [],
      frontend: [],
      testing: [],
      languages: [],
      integrations: [],
      data: [],
      practice: [],
    }
  );
  const skillRows = SKILL_GROUP_ORDER.filter(
    (group) => groupedSkills[group].length > 0
  );
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
        onMouseMove={handleHeroMove}
        onMouseLeave={handleHeroLeave}
        className="relative mx-auto max-w-5xl px-4 pt-20 pb-16 md:px-16"
      >
        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="font-mono text-sm tracking-[0.05em] uppercase text-primary">
              Portfolio 2026
            </p>
            <h1 className="mt-3 font-headline text-4xl font-bold text-on-surface md:text-6xl">
              {profile.basics.name}
            </h1>
            <p className="mt-2 font-headline text-xl text-primary md:text-2xl">
              {profile.basics.title}
            </p>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-on-surface-variant">
              <span>{profile.basics.location}</span>
              {profile.basics.phone && <span>{profile.basics.phone}</span>}
              <span>
                <a
                  href={`mailto:${profile.basics.email}`}
                  className="underline-offset-4 hover:underline"
                >
                  {profile.basics.email}
                </a>
              </span>
            </div>
          </div>

          <div
            aria-label="Profile photo"
            className="h-32 w-32 overflow-hidden rounded-full border border-primary/20 md:h-40 md:w-40"
          >
            {profile.basics.headshot ? (
              <img
                src={profile.basics.headshot}
                alt={`${profile.basics.name} portrait`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                aria-hidden="true"
                className="flex h-full w-full items-center justify-center bg-surface-container font-headline text-3xl text-primary"
              >
                {initials}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 max-w-3xl">
          <p className="font-mono text-xs tracking-[0.05em] uppercase text-primary">
            Professional Summary
          </p>
          <div className="mt-3 space-y-4 text-base text-on-surface-variant md:text-lg">
            {profile.summary
              .split(/\n\n+/)
              .map((paragraph) => paragraph.trim())
              .filter(Boolean)
              .map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bento-card text-center">
            <strong className="block font-mono text-2xl text-primary">
              {Math.max(totalYears, 1)}+
            </strong>
            <span className="mt-1 block text-xs text-on-surface-variant">
              Years building software
            </span>
          </div>
          <div className="bento-card text-center">
            <strong className="block font-mono text-2xl text-primary">
              {activeProjects}
            </strong>
            <span className="mt-1 block text-xs text-on-surface-variant">
              Portfolio projects
            </span>
          </div>
          <div className="bento-card text-center">
            <strong className="block font-mono text-2xl text-primary">
              {featuredCount}
            </strong>
            <span className="mt-1 block text-xs text-on-surface-variant">
              Media features
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link className="btn-primary" to="/projects">
            View Portfolio
          </Link>
          <Link className="btn-ghost" to="/contact">
            Connect
          </Link>
        </div>

        <SocialLinks profile={profile} />
      </header>

      <section className="mx-auto max-w-5xl px-4 py-16 md:px-16">
        <Reveal>
          <SectionHeading
            kicker="Capabilities"
            title="Core Skills"
            blurb="Complete capability matrix across platform engineering, APIs, testing, delivery pipelines, and data work."
          />
          <div className="overflow-x-auto rounded-xl border border-primary/20 bg-surface/20">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-primary/20">
                  <th className="px-4 py-3 font-mono text-xs uppercase tracking-[0.05em] text-primary">
                    Category
                  </th>
                  <th className="px-4 py-3 font-mono text-xs uppercase tracking-[0.05em] text-primary">
                    Skills
                  </th>
                </tr>
              </thead>
              <tbody>
                {skillRows.map((group) => (
                  <tr key={group} className="border-b border-primary/10 align-top last:border-b-0">
                    <td className="w-56 px-4 py-4 font-headline text-sm font-semibold text-on-surface">
                      {SKILL_GROUP_LABELS[group]}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {groupedSkills[group].map((skill) => (
                          <span className="data-chip" key={`${group}-${skill}`}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>

    </>
  );
}

function RecognitionPage({ profile }: { profile: Profile }) {
  return (
    <>
      {profile.highlights && profile.highlights.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 py-16 md:px-16">
          <Reveal>
            <SectionHeading
              kicker="Highlights"
              title="Recognition"
              blurb="Key wins and milestones that shaped the current engineering trajectory."
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {profile.highlights.map((highlight, i) => (
                <article key={i} className="bento-card">
                  <h3 className="font-headline text-lg font-semibold text-on-surface">
                    {highlight.title}
                  </h3>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    {highlight.description}
                  </p>
                  {highlight.stats && highlight.stats.length > 0 && (
                    <div className="mt-4 flex gap-6">
                      {highlight.stats.map((stat, j) => (
                        <div key={j}>
                          <strong className="block font-mono text-lg text-secondary">
                            {stat.value}
                          </strong>
                          <span className="text-xs text-on-surface-variant">
                            {stat.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      <FeaturedInSection profile={profile} />
    </>
  );
}

function ExperiencePage({ profile }: { profile: Profile }) {
  return (
    <>
      <section className="mx-auto max-w-5xl px-4 py-16 md:px-16">
        <Reveal>
          <SectionHeading
            kicker="Career"
            title="Experience"
            blurb="A progression from quality engineering into full-stack delivery and technical ownership."
          />
          <div className="terminal-list">
            {profile.experience.map((job, i) => {
              const photo = resolveAsset(job.image);
              return (
                <article className="terminal-list-item" key={i}>
                  <p className="terminal-timestamp">
                    {formatDate(job.startDate)} —{" "}
                    {job.current || !job.endDate
                      ? "Present"
                      : formatDate(job.endDate)}
                  </p>
                  <h3 className="mt-1 font-headline text-lg font-semibold text-on-surface">
                    {job.role}{" "}
                    <span className="text-on-surface-variant">@ {job.org}</span>
                  </h3>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {job.location}
                  </p>
                  {photo && (
                    <img
                      src={photo}
                      alt={job.org}
                      className="mt-3 h-40 w-full rounded-lg object-cover md:h-48 md:w-80"
                    />
                  )}
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-on-surface-variant">
                    {job.bullets.map((bullet, j) => (
                      <li key={j}>{bullet}</li>
                    ))}
                  </ul>

                  {job.skills && job.skills.length > 0 && (
                    <div className="mt-4">
                      <p className="font-mono text-xs uppercase tracking-[0.05em] text-primary">
                        Skills
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {job.skills.map((skill, j) => (
                          <span className="data-chip" key={`${job.org}-skill-${j}`}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {job.keyWin && (
                    <div className="mt-4 rounded-lg border border-primary/30 bg-primary/10 p-3">
                      <p className="font-mono text-xs uppercase tracking-[0.05em] text-primary">
                        Key Win
                      </p>
                      <p className="mt-2 text-sm text-on-surface">{job.keyWin}</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </Reveal>
      </section>
    </>
  );
}

function EducationPage({ profile }: { profile: Profile }) {
  return (
    <>
      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 py-16 md:grid-cols-2 md:px-16">
        <Reveal>
          <article className="bento-card">
            <SectionHeading kicker="Academic" title="Education" />
            {profile.education.map((edu, i) => (
              <div key={i} className={i > 0 ? "mt-6" : ""}>
                <h3 className="font-headline text-base font-semibold text-on-surface">
                  {edu.degree}
                </h3>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {edu.school}
                </p>
                <p className="mt-1 font-mono text-xs text-primary">
                  {formatDate(edu.startDate)} — {formatDate(edu.endDate)}
                </p>
                {edu.notes && (
                  <p className="mt-2 text-sm text-on-surface-variant">
                    {edu.notes}
                  </p>
                )}
              </div>
            ))}
          </article>
        </Reveal>

        <Reveal delay={0.1}>
          <article className="bento-card">
            <SectionHeading kicker="Credentials" title="Certifications" />
            {profile.certifications.map((cert, i) => (
              <div key={i} className={i > 0 ? "mt-6" : ""}>
                <h3 className="font-headline text-base font-semibold text-on-surface">
                  {cert.name}
                </h3>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {cert.issuer}
                </p>
                <p className="mt-1 font-mono text-xs text-primary">
                  {cert.year}
                </p>
              </div>
            ))}
          </article>
        </Reveal>
      </section>
    </>
  );
}

function ProjectsPage({ profile }: { profile: Profile }) {
  return (
    <>
      <section className="mx-auto max-w-5xl px-4 py-16 md:px-16">
        <Reveal>
          <SectionHeading
            kicker="Builds"
            title="Projects"
            blurb="Applied projects across data, product engineering, and hackathon execution."
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {profile.projects.map((project, i) => {
              const photo = resolveAsset(project.image);
              return (
                <article className="bento-card" key={i}>
                  {photo && (
                    <img
                      src={photo}
                      alt={project.name}
                      className="mb-4 h-40 w-full rounded-lg object-cover"
                    />
                  )}
                  <p className="data-chip">{project.badge}</p>
                  <h3 className="mt-3 font-headline text-lg font-semibold text-on-surface">
                    {project.name}
                  </h3>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    {project.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.stack.map((item, j) => (
                      <span
                        key={j}
                        className="font-mono text-xs text-on-surface-variant"
                      >
                        {item}
                        {j < project.stack.length - 1 ? " ·" : ""}
                      </span>
                    ))}
                  </div>
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block font-mono text-sm text-primary transition-colors hover:text-secondary"
                    >
                      Read more →
                    </a>
                  )}
                </article>
              );
            })}
          </div>
        </Reveal>
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
        I am open to software engineering, data engineering, and quality
        engineering opportunities. Reach out and let us build impactful
        products.
      </p>

      <div className="contact-grid">
        <article className="mini-card">
          <h3>Email</h3>
          <p>
            <a href={`mailto:${profile.basics.email}`}>
              {profile.basics.email}
            </a>
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
  const [introDone, setIntroDone] = useState(false);
  const initials = profile.basics.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <main className="site-shell">
      {!introDone && (
        <IntroOverlay
          message={profile.objective ?? ""}
          onComplete={() => setIntroDone(true)}
        />
      )}

      <div className="orb orb-a" aria-hidden="true" />
      <div className="orb orb-b" aria-hidden="true" />

      <header className={`topbar card ${introDone ? "" : "is-hidden"}`}>
        <Link to="/" className="brand-avatar" aria-label="Home">
          {profile.basics.headshot ? (
            <img
              src={profile.basics.headshot}
              alt={`${profile.basics.name} avatar`}
              className="brand-avatar-image"
            />
          ) : (
            <span className="brand-avatar-fallback">{initials}</span>
          )}
        </Link>
        <nav className="site-nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `nav-link ${isActive ? "is-active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <div className="topbar-actions">
            <select
              id="theme-mode"
              className="theme-select"
              value={themeMode}
              onChange={(event) =>
                onThemeModeChange(event.target.value as ThemeMode)
              }
              aria-label="Theme mode"
            >
              <option value="system">Theme: System</option>
              <option value="dark">Theme: Dark</option>
              <option value="light">Theme: Light</option>
            </select>
          </div>
        </nav>
      </header>

      <div key={location.pathname} className={`route-stage ${introDone ? "" : "is-hidden"}`}>
        <Routes>
          <Route path="/" element={<HomePage profile={profile} />} />
          <Route
            path="/education"
            element={<EducationPage profile={profile} />}
          />
          <Route
            path="/recognition"
            element={<RecognitionPage profile={profile} />}
          />
          <Route
            path="/experience"
            element={<ExperiencePage profile={profile} />}
          />
          <Route
            path="/projects"
            element={<ProjectsPage profile={profile} />}
          />
          <Route path="/contact" element={<ContactPage profile={profile} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <footer className={`footer-note ${introDone ? "" : "is-hidden"}`}>
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
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() =>
    getSystemTheme()
  );
  const resolvedTheme: ResolvedTheme =
    themeMode === "system" ? systemTheme : themeMode;

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };

    media.addEventListener("change", handleChange);

    return () => {
      media.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolvedTheme);
  }, [resolvedTheme]);

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
