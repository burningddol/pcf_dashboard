const KG_TO_TONNE = 1000;

export function computeTCO2e(amount: number, factorValue: number): number {
  return Math.round(((amount * factorValue) / KG_TO_TONNE) * 100) / 100;
}
