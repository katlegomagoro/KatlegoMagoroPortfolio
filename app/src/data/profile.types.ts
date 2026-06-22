// Mirrors the structure approved in profile_schema.json / ARCHITECTURE.md Section 4.5.
// Kept as plain types (no class/validation library) since this is a static,
// single-source-of-truth JSON file, not user-submitted data — Iteration 2's
// CV parser is what eventually writes new values into this shape.

export interface ProfileLinks {
  linkedin?: string;
  github?: string;
  twitter?: string;
  instagram?: string;
}

export interface ProfileBasics {
  name: string;
  title: string;
  location: string;
  email: string;
  phone?: string;
  links?: ProfileLinks;
}

export interface ProfileSkill {
  name: string;
  category: string;
}

export interface ProfileExperience {
  role: string;
  org: string;
  location: string;
  startDate: string;
  endDate: string | null;
  current?: boolean;
  bullets: string[];
}

export interface ProfileProject {
  name: string;
  badge: string;
  description: string;
  stack: string[];
  link?: string | null;
}

export interface ProfileEducation {
  degree: string;
  school: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

export interface ProfileCertification {
  name: string;
  issuer?: string;
  year: string;
}

export interface ProfileHighlightStat {
  value: string;
  label: string;
}

export interface ProfileHighlight {
  title: string;
  description: string;
  stats?: ProfileHighlightStat[];
}

export interface Profile {
  basics: ProfileBasics;
  summary: string;
  skills: ProfileSkill[];
  experience: ProfileExperience[];
  projects: ProfileProject[];
  education: ProfileEducation[];
  certifications: ProfileCertification[];
  highlights?: ProfileHighlight[];
}
