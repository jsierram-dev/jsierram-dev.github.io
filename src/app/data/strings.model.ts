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
  /** Toggle label for a single clamped text block (app-clamped-text) — distinct from
   *  showMore/showLess, which page through a *list* of hidden entries instead. */
  readMore: string;
  readLess: string;
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
  /** Aria-label/title for the "x" button that clears an active layer filter — the reliable
   *  fallback for re-picking the same option in the <select> to deselect it (see
   *  onLayerMouseDown/onLayerChange in portfolio-panel.ts). */
  clearFilter: string;
  featuredBadge: string;
  /** Marks an adminOnly project, which only the site owner ever sees. */
  adminBadge: string;
  problem: string;
  role: string;
  outcome: string;
  liveDemo: string;
  repo: string;
  /** Side panel label above the tech-icon stack list in the project detail view. */
  stackLabel: string;
  /** Side panel label above the repo/demo link buttons in the project detail view. */
  linksLabel: string;
  /** Disabled link-button text when a project has no public repo (e.g. Similart). */
  repoPrivate: string;
  /** Disabled link-button text when a project has no live demo. */
  noLiveDemo: string;
  /** Summary label for the collapsed technical/architecture detail (project.role) in the
   *  project detail view — distinct from `role` (the dt label used when expanded). */
  viewTechnicalDetail: string;
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
  emailTitle: string;
  githubTitle: string;
  linkedinTitle: string;
  availabilityText: string;
  /** Has a "{n}" placeholder, replaced with the real contribution count once the build-time
   *  GitHub GraphQL fetch is wired up (see ROADMAP-portfolio.md "Investigación..." for the plan). */
  githubActivityLabel: string;
}
