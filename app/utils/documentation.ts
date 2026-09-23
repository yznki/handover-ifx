/**
 * Documentation section identifier.
 */
export type DocumentationSectionIdentifier = "start" | "aida" | "cvc" | "valibridge" | "reference";

/**
 * Documentation page metadata.
 */
export interface DocumentationPageMetadata {
  /**
   * Content path.
   */
  path: string;

  /**
   * Page title.
   */
  title: string;

  /**
   * Page description.
   */
  description?: string;

  /**
   * Navigation section.
   */
  section?: DocumentationSectionIdentifier;

  /**
   * Ordering value inside the section.
   */
  order?: number;

  /**
   * Responsible owner.
   */
  owner?: string;

  /**
   * Last updated date label.
   */
  updated?: string;
}

/**
 * Documentation section configuration.
 */
export interface DocumentationSection {
  /**
   * Section identifier.
   */
  identifier: DocumentationSectionIdentifier;

  /**
   * Section label.
   */
  label: string;

  /**
   * Short description for index cards.
   */
  description: string;

  /**
   * Accent color classes.
   */
  accentClass: string;
}

export const documentationSections: DocumentationSection[] = [
  { identifier: "start", label: "Start here", description: "Mindset, people, timeline, and the work most likely to block the handover.", accentClass: "bg-violet-500" },
  { identifier: "aida", label: "AIDA", description: "Vision, workflows, architecture, deployment, planning hub, and current pipelines.", accentClass: "bg-blue-500" },
  { identifier: "cvc", label: "CVC", description: "Shared component library status, consumers, showcase, release flow, and local testing.", accentClass: "bg-emerald-500" },
  { identifier: "valibridge", label: "ValiBridge", description: "Short status notes because the team already knows the domain.", accentClass: "bg-amber-500" },
  { identifier: "reference", label: "Reference", description: "Glossary and shared terms for the handover.", accentClass: "bg-slate-500" }
];

/**
 * Finds section configuration by identifier.
 * @param sectionIdentifier - Section identifier from frontmatter.
 * @returns Section configuration.
 */
export function findDocumentationSection(sectionIdentifier?: DocumentationSectionIdentifier): DocumentationSection {
  return documentationSections.find((section) => section.identifier === sectionIdentifier) || documentationSections[0] as DocumentationSection;
}

/**
 * Counts words in plain text.
 * @param value - Text value to count.
 * @returns Word count.
 */
export function countWords(value: unknown): number {
  const textValue = typeof value === "string" ? value : JSON.stringify(value || "");

  return textValue.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Calculates reading time from plain text.
 * @param value - Text value.
 * @returns Human readable reading time.
 */
export function calculateReadingTime(value: unknown): string {
  const minutes = Math.max(1, Math.ceil(countWords(value) / 220));

  return `${minutes} min read`;
}

/**
 * Sorts documentation pages by section and order.
 * @param pages - Pages to sort.
 * @returns Sorted pages.
 */
export function sortDocumentationPages(pages: DocumentationPageMetadata[]): DocumentationPageMetadata[] {
  return [...pages].sort((firstPage, secondPage) => {
    const firstSectionIndex = documentationSections.findIndex((section) => section.identifier === firstPage.section);
    const secondSectionIndex = documentationSections.findIndex((section) => section.identifier === secondPage.section);
    const resolvedFirstSectionIndex = firstSectionIndex === -1 ? 999 : firstSectionIndex;
    const resolvedSecondSectionIndex = secondSectionIndex === -1 ? 999 : secondSectionIndex;

    if (resolvedFirstSectionIndex !== resolvedSecondSectionIndex) return resolvedFirstSectionIndex - resolvedSecondSectionIndex;

    return (firstPage.order || 999) - (secondPage.order || 999);
  });
}
