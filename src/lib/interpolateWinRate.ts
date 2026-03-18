export function interpolateWinRate(curve: { price: number; winRate: number }[], price: number): number {
  const sorted = [...curve].sort((a, b) => a.price - b.price)
  if (price <= sorted[0].price) return sorted[0].winRate
  if (price >= sorted[sorted.length - 1].price) return sorted[sorted.length - 1].winRate
  const lower = sorted.filter(p => p.price <= price).at(-1)!
  const upper = sorted.find(p => p.price > price)!
  const t = (price - lower.price) / (upper.price - lower.price)
  return lower.winRate + t * (upper.winRate - lower.winRate)
}
