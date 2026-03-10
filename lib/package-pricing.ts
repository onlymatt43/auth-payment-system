export function toNumber(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export interface EffectivePackage extends Record<string, unknown> {
  id: number;
  points: number;
  price_usd: number;
  active: number;
  ratio_points_per_usd: number;
}

function applyFixedPriceRules(packageId: number, basePriceUsd: number, secondActiveId: number | null): number {
  if (secondActiveId !== null && packageId === secondActiveId) {
    return 10;
  }
  return basePriceUsd;
}

function getSecondActivePackageId(sortedActiveRows: Array<Record<string, unknown>>): number | null {
  if (sortedActiveRows.length < 2) return null;
  return toNumber(sortedActiveRows[1].id);
}

export function buildEffectivePackageCatalog(rows: Array<Record<string, unknown>>): EffectivePackage[] {
  const sortedActiveRows = [...rows]
    .filter((row) => toNumber(row.active ?? 1) !== 0 && toNumber(row.price_usd) > 0)
    .sort((a, b) => toNumber(a.points) - toNumber(b.points) || toNumber(a.id) - toNumber(b.id));

  const secondActiveId = getSecondActivePackageId(sortedActiveRows);

  const catalog: EffectivePackage[] = [];
  let previousRatio = 10;

  for (const row of sortedActiveRows) {
    const packageId = toNumber(row.id);
    const basePoints = Math.max(1, toNumber(row.points));
    const effectivePriceUsd = applyFixedPriceRules(packageId, toNumber(row.price_usd), secondActiveId);

    const minimumRatio = catalog.length === 0 ? Math.max(previousRatio, basePoints / Math.max(effectivePriceUsd, 1)) : previousRatio * 1.1;
    const minimumPointsForRatio = Math.ceil(effectivePriceUsd * minimumRatio);
    const effectivePoints = Math.max(basePoints, minimumPointsForRatio);
    const ratio = effectivePoints / Math.max(effectivePriceUsd, 0.01);

    previousRatio = ratio;

    catalog.push({
      ...row,
      id: packageId,
      points: effectivePoints,
      price_usd: effectivePriceUsd,
      active: 1,
      ratio_points_per_usd: ratio,
    });
  }

  return catalog;
}

export function findEffectivePackage(rows: Array<Record<string, unknown>>, packageId: number): EffectivePackage | null {
  const catalog = buildEffectivePackageCatalog(rows);
  return catalog.find((pkg) => pkg.id === packageId) ?? null;
}

export function normalizePackagesForShop(rows: Array<Record<string, unknown>>) {
  return buildEffectivePackageCatalog(rows);
}
