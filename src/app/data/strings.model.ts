// UI vocabulary — panel headings, button/filter labels, section labels — kept separate from
// content.*.json on purpose (see ROADMAP-portfolio.md "Idioma / i18n"): this is app text, not
// "my info". Every value here is real/final; unlike content.*.json there's no placeholder gap,
// none of this depends on the user's own career details.

export interface Strings {
  aboutHeading: string;
  resumeHeading: string;
  portfolioHeading: string;
  downloadPdf: string;
  backToProjects: string;
  sectionExperience: string;
  sectionEducation: string;
  sectionCertifications: string;
  sectionLanguages: string;
  /** Has a "{n}" placeholder, replaced with the hidden-entry count at render time. */
  showMore: string;
  showLess: string;
  categoryAll: string;
  layerLabels: {
    fe: string;
    be: string;
    db: string;
    tp: string;
  };
  sortFeatured: string;
  sortNewest: string;
  sortOldest: string;
  noMatch: string;
  featuredBadge: string;
  problem: string;
  role: string;
  outcome: string;
  liveDemo: string;
  repo: string;
  projectSingular: string;
  projectPlural: string;
  scanReference: string;
  scanDrawing: string;
  scanCaption: string;
  present: string;
  cvSections: {
    summary: string;
    skills: string;
    work: string;
    projects: string;
    education: string;
    certifications: string;
    languages: string;
  };
  cvSkillLabels: {
    languages: string;
    frontend: string;
    backend: string;
    databases: string;
    tools: string;
  };
  cvContactPlaceholder: string;
  cvCityPlaceholder: string;
  emailTitle: string;
  githubTitle: string;
  linkedinTitle: string;
  availabilityText: string;
  /** Has a "{n}" placeholder, replaced with the real contribution count once the build-time
   *  GitHub GraphQL fetch is wired up (see ROADMAP-portfolio.md "Investigación..." for the plan). */
  githubActivityLabel: string;
}
