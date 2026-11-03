// src/data/inflationEngine.js
/**
 * AI Price Inflation & Dynamic Mandi Recalculation Engine
 * 
 * Runs periodic macroeconomic updates (CPI inflation, Fuel Index, Seasonal demand, Supply arrival)
 * and recalculates fair market produce prices to demonstrate the Price Inflation Model to faculty.
 */

export const INITIAL_MACRO_FACTORS = {
  cpiIndex: 104.2,         // Consumer Price Index baseline
  fuelIndex: 72.8,        // Transport/Fuel cost index
  mandiArrivalFactor: 1.0, // Supply arrival rate (1.0 = normal, <1.0 = supply crunch, >1.0 = surplus)
  seasonalityFactor: 1.05, // Seasonal demand factor
  inflationTrend: 'stable' // 'surge' | 'deflation' | 'stable'
};

/**
 * Calculates new price using economic inflation formula:
 * Price_new = Base * (CPI / 100) * (Fuel / 70)^0.25 * (1 / SupplyFactor)^0.3 * SeasonalFactor * RandomFluctuation
 */
export function recalculateProductPriceWithInflation(product, macroFactors) {
  const base = product.basePrice || product.price;
  
  // Weights based on real agricultural economics
  const cpiWeight = (macroFactors.cpiIndex / 100);
  const fuelWeight = Math.pow(macroFactors.fuelIndex / 70, 0.22);
  const supplyWeight = Math.pow(1 / Math.max(0.6, macroFactors.mandiArrivalFactor), 0.28);
  const seasonWeight = macroFactors.seasonalityFactor || 1.0;

  // Modest realistic 1-3% random jitter to simulate micro-mandi bid variations
  const microJitter = 1 + (Math.random() * 0.04 - 0.02);

  const rawComputed = base * cpiWeight * fuelWeight * supplyWeight * seasonWeight * microJitter;
  const newPrice = Math.max(5, Math.round(rawComputed));

  // Justifiable packaging & small-quantity economics for retail consumers:
  // 1kg = standard 1.0x rate
  // 500g = 50% rate + small eco packaging rounding (e.g. half price rounded)
  // 200g = 20% rate + nominal micro-handling cost (e.g. Math.max(2, Math.round(1kg * 0.22)))
  const price1kg = newPrice;
  const price500g = Math.max(3, Math.round(newPrice * 0.52));
  const price200g = Math.max(2, Math.round(newPrice * 0.23));

  const delta = newPrice - (product.price || base);
  const percentChange = product.price ? (((newPrice - product.price) / product.price) * 100).toFixed(1) : '0.0';

  return {
    ...product,
    price: newPrice,
    aiRecommendedPrice: newPrice,
    price200g,
    price500g,
    price1kg,
    previousPrice: product.price || base,
    priceChangeDelta: delta,
    priceChangePercent: parseFloat(percentChange),
    lastInflationTimestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };
}

/**
 * Calculates justifiable 200g, 500g, and 1kg prices for any 1kg price
 */
export function getPortionPrices(perKgPrice) {
  const p = Math.max(5, Math.round(perKgPrice));
  return {
    '200g': Math.max(2, Math.round(p * 0.23)),
    '500g': Math.max(3, Math.round(p * 0.52)),
    '1kg': p
  };
}

/**
 * Shifts the macro indicators for the next 2-minute cycle
 */
export function generateNextMacroCycle(currentFactors) {
  // Random economic shock or natural progression
  const cpiShift = (Math.random() * 1.8 - 0.6); // slight upward bias for inflation simulation
  const nextCpi = Number(Math.max(98, Math.min(125, currentFactors.cpiIndex + cpiShift)).toFixed(1));

  const fuelShift = (Math.random() * 2.5 - 1.0);
  const nextFuel = Number(Math.max(65, Math.min(95, currentFactors.fuelIndex + fuelShift)).toFixed(1));

  const arrivalShift = (Math.random() * 0.16 - 0.08);
  const nextArrival = Number(Math.max(0.7, Math.min(1.4, currentFactors.mandiArrivalFactor + arrivalShift)).toFixed(2));

  let trend = 'stable';
  if (cpiShift > 0.4 || fuelShift > 1.0) trend = 'surge';
  else if (cpiShift < -0.2 && arrivalShift > 0.05) trend = 'cooling';

  return {
    cpiIndex: nextCpi,
    fuelIndex: nextFuel,
    mandiArrivalFactor: nextArrival,
    seasonalityFactor: Number((1.0 + (Math.random() * 0.1 - 0.05)).toFixed(2)),
    inflationTrend: trend,
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };
}
