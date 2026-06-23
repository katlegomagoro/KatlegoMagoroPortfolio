import { loadProfile } from "./data/loadProfile";
import type { Profile } from "./data/profile.types";
import {
  BrowserRouter,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

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

function FeaturedInSection({ profile }: { profile: Profile }) {
  if (!profile.featuredIn || profile.featuredIn.length === 0) {
    return null;
  }

  return (
    <section className="section card">
      <h2>Featured In</h2>
      <div className="project-grid">
        {profile.featuredIn.map((feature, i) => (
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
  const topSkills = profile.skills.slice(0, 12);
  const initials = profile.basics.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <>
      <header className="hero card">
        <div className="hero-grid">
          <div>
            <p className="eyebrow">Portfolio 2026</p>
            <h1>{profile.basics.name}</h1>
            <p className="hero-title">{profile.basics.title}</p>

            <div className="meta-row">
              <span>{profile.basics.location}</span>
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
        <SocialLinks profile={profile} />
      </header>

      <section className="section card">
        <h2>Core Skills</h2>
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
          <h2>Recognition</h2>
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

      <FeaturedInSection profile={profile} />
    </>
  );
}

function ExperiencePage({ profile }: { profile: Profile }) {
  return (
    <>
      <section className="section card">
        <h2>Experience</h2>
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
          <h2>Education</h2>
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
          <h2>Certifications</h2>
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
        <h2>Projects</h2>
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
      <h2>Contact</h2>
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
      </div>

      <SocialLinks profile={profile} />
    </section>
  );
}

function SiteLayout() {
  const profile = loadProfile();
  const location = useLocation();

  return (
    <main className="site-shell">
      <div className="orb orb-a" aria-hidden="true" />
      <div className="orb orb-b" aria-hidden="true" />

      <header className="topbar card">
        <p className="brand">KM</p>
        <nav className="site-nav" aria-label="Main navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}
          >
            Home
          </NavLink>
          <NavLink
            to="/experience"
            className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}
          >
            Experience
          </NavLink>
          <NavLink
            to="/projects"
            className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}
          >
            Projects
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}
          >
            Contact
          </NavLink>
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
  return (
    <BrowserRouter>
      <SiteLayout />
    </BrowserRouter>
  );
}

export default App;
