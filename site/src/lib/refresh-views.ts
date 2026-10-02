// Display-relevant projections of a project, shared by the server
// (build-time hashes) and the client (refresh.ts). No content.json import.
export type FetchedProject = Record<string, unknown> & { slug: string };

/** Fields that drive the home case-index rows. */
export function caseIndexView(p: FetchedProject) {
  return {
    slug: p.slug,
    nameFr: p.nameFr,
    nameEn: p.nameEn,
    sectorFr: p.sectorFr,
    sectorEn: p.sectorEn,
    tags: p.tags,
    liveUrl: p.liveUrl ?? null,
    liveUrlWithheld: p.liveUrlWithheld ?? !p.liveUrl,
    type: p.type,
    orderIndex: p.orderIndex,
  };
}

/** Fields that drive the case-study page text content. */
export function caseStudyView(p: FetchedProject) {
  return {
    nameFr: p.nameFr,
    nameEn: p.nameEn,
    sectorFr: p.sectorFr,
    sectorEn: p.sectorEn,
    summaryFr: p.summaryFr,
    summaryEn: p.summaryEn,
    problemFr: p.problemFr,
    problemEn: p.problemEn,
    solutionFr: p.solutionFr,
    solutionEn: p.solutionEn,
    featuresFr: p.featuresFr,
    featuresEn: p.featuresEn,
    metrics: p.metrics,
    architectureCaptionFr: p.architectureCaptionFr ?? null,
    architectureCaptionEn: p.architectureCaptionEn ?? null,
  };
}
