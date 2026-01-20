/**
 * Model for component variant guides (e.g., button variants, badge variants)
 * Used to display contextual documentation about different component variants
 */
export interface PdsVariantGuideModel {
  readonly variant: string;
  readonly title: string;
  readonly description: string;
  readonly whenToUse: string[];
  readonly examples: string[];
  readonly emphasis: 'high' | 'medium' | 'low';
}

/**
 * Model for color variations demo
 * Used to show different color options available for a component
 */
export interface PdsColorVariationModel {
  readonly value: string;
  readonly label: string;
}
