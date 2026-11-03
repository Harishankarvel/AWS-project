// Seasonal and Festive Dynamic Pricing Engine (Amazon.in / E-Commerce Algorithmic Model)

/**
 * Indian Festive Calendar & Pricing Seasons:
 * 1. Pre-Festive Surge (Month before major festivals):
 *    - Example: August / September before Navratri/Diwali
 *    - Increased demand anticipation: algorithms raise baseline rates (+12% to +20%)
 *    - Sellers maximize margin on high-demand early inventory.
 * 
 * 2. Festive Season (The Great Indian Festival / Diwali Sale):
 *    - Example: October / November
 *    - Heavy volume discounts & bundle promotions: prices lowered (-15% to -25%)
 *    - Dynamic margin sharing:
 *        * Sellers achieve 3x to 5x order volume, yielding significantly higher net profit.
 *        * Platform/Admin takes reduced commission percentage on massive volume (high cumulative profit).
 * 
 * 3. Harvest Flush / Post-Festive Recovery:
 *    - Balanced stabilization based on arrival quantity & live mandi index.
 */

export const FESTIVE_SEASONS = {
  regular: {
    id: 'regular',
    name: 'Standard Season',
    multiplier: 1.0,
    tag: 'Standard Market Rate',
    bannerText: 'Fair daily market prices based on standard mandi supply & demand.',
    sellerMargin: '22%',
    adminCommission: '5%',
    customerDiscount: '0%'
  },
  pre_festive: {
    id: 'pre_festive',
    name: 'Pre-Festive High Demand (Pre-Diwali / Dussehra)',
    multiplier: 1.18, // +18% price increase before festivals
    tag: '📈 Pre-Festive Surge Active (+18%)',
    bannerText: 'Pre-festive demand anticipation in effect. Inventory rates optimized to maximize seller margins ahead of festival rush.',
    sellerMargin: '32%',
    adminCommission: '6%',
    customerDiscount: '0%'
  },
  festive_sale: {
    id: 'festive_sale',
    name: 'Grand Festive Mega Sale (Diwali / Pongal / Eid)',
    multiplier: 0.82, // -18% discount during festival
    tag: '🎉 Festive Mega Deal Active (-18% OFF)',
    bannerText: 'Great Indian Festive Produce Sale is LIVE! Deep festive discounts active. High order volume drives 4x profit for farmers & platform.',
    sellerMargin: '28% (on 4x volume)',
    adminCommission: '3.5% (high volume yield)',
    customerDiscount: '18% OFF'
  },
  harvest_flush: {
    id: 'harvest_flush',
    name: 'Post-Festive Fresh Harvest Flush',
    multiplier: 0.90,
    tag: '🌾 Fresh Harvest Saver (-10%)',
    bannerText: 'Peak farm harvest season. Bountiful arrivals passed on as direct customer savings with high farmer turnover.',
    sellerMargin: '20%',
    adminCommission: '4.5%',
    customerDiscount: '10% OFF'
  }
};

/**
 * Calculates dynamic price for an item according to active season
 */
export function calculateDynamicPrice(basePrice, seasonId = 'regular') {
  const season = FESTIVE_SEASONS[seasonId] || FESTIVE_SEASONS.regular;
  const calculated = Math.round(basePrice * season.multiplier);
  return {
    price: calculated,
    basePrice: basePrice,
    season,
    sellerProfitPerUnit: Math.round(calculated * (seasonId === 'pre_festive' ? 0.32 : seasonId === 'festive_sale' ? 0.28 : 0.22)),
    adminProfitPerUnit: Math.round(calculated * (seasonId === 'pre_festive' ? 0.06 : seasonId === 'festive_sale' ? 0.035 : 0.05)),
  };
}
