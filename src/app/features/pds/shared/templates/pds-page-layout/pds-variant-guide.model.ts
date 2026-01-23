export interface PdsVariantGuideModel {
  readonly variant: string;
  readonly title: string;
  readonly description: string;
  readonly whenToUse: string[];
  readonly examples: string[];
  readonly emphasis: 'high' | 'medium' | 'low';
}
