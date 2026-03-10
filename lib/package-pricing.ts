export function toNumber(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function getSecondActivePackageId(rows: Array<Record<string, unknown>>): number | null {
  const sorted = [...rows]
    .filter((row) => toNumber(row.active ?? 1) !== 0 && toNumber(row.price_usd) > 0)
    .sort((a, b) => toNumber(a.points) - toNumber(b.points) || toNumber(a.id) - toNumber(b.id));

  if (sorted.length < 2) return null;
  return toNumber(sorted[1].id);
}

export function applyPackagePricePolicy(packageId: number, basePriceUsd: number, secondActiveId: number | null): number {
  if (secondActiveId !== null && packageId === secondActiveId) {
    return 10;
  }
  return basePriceUsd;
}

export function normalizePackagesForShop(rows: Array<Record<string, unknown>>) {
  const secondActiveId = getSecondActivePackageId(rows);

  return rows.map((row) => {
    const packageId = toNumber(row.id);
    const basePrice = toNumber(row.price_usd);

    return {
      ...row,
      id: packageId,
      points: toNumber(row.points),
      active: toNumber(row.active ?? 1),
      price_usd: applyPackagePricePolicy(packageId, basePrice, secondActiveId),
    };
  });
}
