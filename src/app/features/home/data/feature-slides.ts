export interface FeatureSlide {
  readonly title: string;
  readonly headingLine1: string;
  readonly headingLine2: string;
}

export const FEATURE_SLIDES: readonly FeatureSlide[] = [
  { title: 'Featured blog',      headingLine1: 'Journey Of', headingLine2: 'The Tarnished' },
  { title: 'Featured skills',    headingLine1: 'Know What',  headingLine2: 'I Know' },
  { title: 'Featured portfolio', headingLine1: 'See What',   headingLine2: 'I Did' },
  { title: 'Catch up',           headingLine1: 'Get my',     headingLine2: 'Resume' },
];
