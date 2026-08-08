// Shape of content.en.json / content.es.json — kept in sync by hand (see ROADMAP-portfolio.md
// "Modelo de datos"). Two complete, independent files per language rather than one shared file
// with a merge step: some duplication (techs, dates, links) in exchange for each file being a
// single, easy-to-hand-edit unit. Fields that are the same in both languages (tech names, dates,
// slugs/keys, urls) are still duplicated byte-for-byte on purpose — see the roadmap for why.

export type StackLayer = 'fe' | 'be' | 'db' | 'tp';

export interface TechRef {
  name: string;
  layer: StackLayer;
  /** Shown with extra emphasis on the project card's stack chips; optional. */
  primary?: boolean;
}

export interface CvSkills {
  languages: string;
  frontend: string;
  backend: string;
  databases: string;
  tools: string;
}

export interface Profile {
  role: string;
  location: string;
  /** IANA zone, e.g. "Europe/Madrid" — feeds the sidebar's real local-time clock. */
  timezone: string;
  about: string[];
  cv: {
    role: string;
    /** Professional Summary paragraph for the CV. Empty until real copy is written. */
    summary: string;
    skills: CvSkills;
  };
}

export interface Project {
  key: string;
  title: string;
  category: string;
  /** ISO date (YYYY-MM-DD), used for "most recent" sort. */
  date: string;
  featured: boolean;
  /** Path/URL to a hero screenshot once one exists; null falls back to the placeholder visual. */
  screenshot: string | null;
  liveUrl: string;
  repoUrl: string;
  techs: TechRef[];
  problem: string;
  role: string;
  outcome: string;
  /** Short stack-focused CV bullet, distinct wording from `outcome` on purpose. Null if this
   *  project doesn't get its own CV line (e.g. the portfolio site itself). */
  cvBullet: string | null;
}

export interface ExperienceEntry {
  role: string;
  company: string;
  link: string;
  startMonth: string;
  startYear: string;
  endMonth?: string;
  endYear: string;
  /** True for the current role — endMonth is omitted/ignored, "present" is shown instead. */
  current?: boolean;
  desc: string;
  achievements: string[];
  techs: string[];
}

export interface EducationEntry {
  title: string;
  org: string;
  month: string;
  year: string;
  desc: string;
  techs: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  year: string;
  url: string;
}

export interface SpokenLanguage {
  /** "es" | "en" — picks the flag icon; independent of the already-translated `language` name. */
  code: string;
  language: string;
  level: string;
}

export interface Content {
  profile: Profile;
  projects: Project[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  certifications: Certification[];
  languages: SpokenLanguage[];
}
