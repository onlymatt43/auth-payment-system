'use client';

import { useEffect, useRef, useState } from 'react';

export const dynamic = 'force-dynamic';

interface PointPackage {
  id: number;
  name: string;
  points: number;
  price_usd: number;
  paypal_plan_id: string | null;
  active: boolean;
}

interface PointConfig {
  point_dollar_value: number;
  point_minutes_value: number;
}

interface ProjectCost {
  id: number;
  project_slug: string;
  project_name: string;
  points_required: number;
  active: boolean;
}

interface StorefrontItem {
  id: number;
  title: string;
  subtitle: string | null;
  price_label: string | null;
  cta_label: string | null;
  cta_url: string | null;
  media_url: string | null;
  media_type: 'none' | 'image' | 'video';
  badge: string | null;
  active: number;
  sort_order: number;
}

function toNumber(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function csvEscape(value: string | number | boolean | null | undefined): string {
  const raw = String(value ?? '');
  if (raw.includes(',') || raw.includes('"') || raw.includes('\n')) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === ',' && !inQuotes) {
      out.push(current.trim());
      current = '';
      continue;
    }

    current += ch;
  }

  out.push(current.trim());
  return out;
}

function parseCsv(content: string): Array<Record<string, string>> {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const rows: Array<Record<string, string>> = [];

  for (let i = 1; i < lines.length; i += 1) {
    const cols = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};

    for (let j = 0; j < headers.length; j += 1) {
      row[headers[j]] = cols[j] ?? '';
    }

    rows.push(row);
  }

  return rows;
}

function asBool(input: string | undefined, fallback = true): boolean {
  if (input === undefined || input === '') return fallback;
  const normalized = input.toLowerCase().trim();
  return ['1', 'true', 'yes', 'oui', 'actif', 'active'].includes(normalized);
}

export default function AdminPage() {
  const packageCsvInputRef = useRef<HTMLInputElement | null>(null);
  const projectCsvInputRef = useRef<HTMLInputElement | null>(null);

  const [packages, setPackages] = useState<PointPackage[]>([]);
  const [projects, setProjects] = useState<ProjectCost[]>([]);
  const [storefront, setStorefront] = useState<StorefrontItem[]>([]);
  const [config, setConfig] = useState<PointConfig>({ point_dollar_value: 0.10, point_minutes_value: 6 });

  const [newPackage, setNewPackage] = useState({ name: '', points: 0, price_usd: 0 });
  const [newConfig, setNewConfig] = useState({ dollar: 0.10, minutes: 6 });
  const [newStorefrontItem, setNewStorefrontItem] = useState({
    title: '',
    subtitle: '',
    price_label: '',
    cta_label: 'Soon',
    cta_url: '',
    media_url: '',
    media_type: 'none' as 'none' | 'image' | 'video',
    badge: '',
    active: true,
    sort_order: 100,
  });

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    try {
      const [pkgRes, projRes, confRes, storefrontRes] = await Promise.all([
        fetch('/api/admin/packages'),
        fetch('/api/admin/projects'),
        fetch('/api/admin/config'),
        fetch('/api/admin/storefront'),
      ]);

      const [pkgData, projData, confData, storefrontData] = await Promise.all([
        pkgRes.json(),
        projRes.json(),
        confRes.json(),
        storefrontRes.json(),
      ]);

      setPackages(
        (pkgData.packages || []).map((pkg: Record<string, unknown>) => ({
          id: toNumber(pkg.id),
          name: String(pkg.name || ''),
          points: toNumber(pkg.points),
          price_usd: toNumber(pkg.price_usd),
          paypal_plan_id: pkg.paypal_plan_id ? String(pkg.paypal_plan_id) : null,
          active: Boolean(pkg.active),
        }))
      );

      setProjects(
        (projData.projects || []).map((proj: Record<string, unknown>) => ({
          id: toNumber(proj.id),
          project_slug: String(proj.project_slug || ''),
          project_name: String(proj.project_name || ''),
          points_required: toNumber(proj.points_required),
          active: Boolean(proj.active),
        }))
      );

      setStorefront(storefrontData.items || []);
      setConfig(confData);
      setNewConfig({
        dollar: confData.point_dollar_value,
        minutes: confData.point_minutes_value,
      });
    } catch (error) {
      console.error('Failed to load admin data:', error);
    }
  }

  async function createPackage() {
    try {
      await fetch('/api/admin/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPackage),
      });
      setNewPackage({ name: '', points: 0, price_usd: 0 });
      await loadData();
    } catch {
      alert('Erreur lors de la création du package');
    }
  }

  function updatePackageDraft(id: number, patch: Partial<PointPackage>) {
    setPackages((prev) => prev.map((pkg) => (pkg.id === id ? { ...pkg, ...patch } : pkg)));
  }

  async function savePackage(pkg: PointPackage) {
    try {
      const res = await fetch('/api/admin/packages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pkg),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error || 'Erreur lors de la sauvegarde du package');
      }

      await loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde du package');
    }
  }

  function exportPackagesCsv() {
    const headers = ['id', 'name', 'points', 'price_usd', 'active'];
    const lines = [headers.join(',')];

    for (const pkg of packages) {
      lines.push([
        csvEscape(pkg.id),
        csvEscape(pkg.name),
        csvEscape(pkg.points),
        csvEscape(pkg.price_usd),
        csvEscape(pkg.active ? 1 : 0),
      ].join(','));
    }

    const blob = new Blob([`${lines.join('\n')}\n`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'admin-packages.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function importPackagesCsv(file: File) {
    try {
      const text = await file.text();
      const rows = parseCsv(text);

      if (!rows.length) {
        alert('CSV vide ou invalide.');
        return;
      }

      let created = 0;
      let updated = 0;
      let failed = 0;

      for (const row of rows) {
        const name = String(row.name || '').trim();
        const points = Number(row.points);
        const priceUsd = Number(row.price_usd);
        const active = asBool(row.active, true);
        const id = Number(row.id);

        if (!name || !Number.isFinite(points) || !Number.isFinite(priceUsd) || points <= 0 || priceUsd <= 0) {
          failed += 1;
          continue;
        }

        const payload = {
          name,
          points,
          price_usd: priceUsd,
          active,
        };

        let res: Response;
        if (Number.isFinite(id) && id > 0) {
          res = await fetch('/api/admin/packages', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...payload }),
          });
          if (res.ok) updated += 1;
        } else {
          res = await fetch('/api/admin/packages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (res.ok) created += 1;
        }

        if (!res.ok) failed += 1;
      }

      await loadData();
      alert(`Import packages terminé. Créés: ${created}, mis à jour: ${updated}, erreurs: ${failed}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur import CSV packages');
    }
  }

  async function updateConfig() {
    try {
      await fetch('/api/admin/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          point_dollar_value: newConfig.dollar,
          point_minutes_value: newConfig.minutes,
        }),
      });
      alert('Configuration mise à jour!');
      await loadData();
    } catch {
      alert('Erreur lors de la mise à jour');
    }
  }

  function updateProjectDraft(id: number, patch: Partial<ProjectCost>) {
    setProjects((prev) => prev.map((proj) => (proj.id === id ? { ...proj, ...patch } : proj)));
  }

  async function saveProject(project: ProjectCost) {
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(project),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error || 'Erreur lors de la sauvegarde du projet');
      }

      await loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde du projet');
    }
  }

  function exportProjectsCsv() {
    const headers = ['id', 'project_slug', 'project_name', 'points_required', 'active'];
    const lines = [headers.join(',')];

    for (const proj of projects) {
      lines.push([
        csvEscape(proj.id),
        csvEscape(proj.project_slug),
        csvEscape(proj.project_name),
        csvEscape(proj.points_required),
        csvEscape(proj.active ? 1 : 0),
      ].join(','));
    }

    const blob = new Blob([`${lines.join('\n')}\n`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'admin-projects.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function importProjectsCsv(file: File) {
    try {
      const text = await file.text();
      const rows = parseCsv(text);

      if (!rows.length) {
        alert('CSV vide ou invalide.');
        return;
      }

      const projectBySlug = new Map(projects.map((p) => [p.project_slug, p.id]));
      let updated = 0;
      let failed = 0;

      for (const row of rows) {
        let id = Number(row.id);
        const slug = String(row.project_slug || '').trim();

        if ((!Number.isFinite(id) || id <= 0) && slug) {
          id = projectBySlug.get(slug) ?? 0;
        }

        const pointsRequired = Number(row.points_required);
        const active = asBool(row.active, true);
        const projectName = String(row.project_name || '').trim();

        if (!id || !Number.isFinite(pointsRequired) || pointsRequired < 0) {
          failed += 1;
          continue;
        }

        const res = await fetch('/api/admin/projects', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id,
            project_slug: slug || undefined,
            project_name: projectName || undefined,
            points_required: pointsRequired,
            active,
          }),
        });

        if (res.ok) {
          updated += 1;
        } else {
          failed += 1;
        }
      }

      await loadData();
      alert(`Import projets terminé. Mis à jour: ${updated}, erreurs: ${failed}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur import CSV projets');
    }
  }

  async function createStorefrontItem() {
    try {
      const res = await fetch('/api/admin/storefront', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStorefrontItem),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.error || 'Erreur lors de la création de la carte vitrine');
      }

      setNewStorefrontItem({
        title: '',
        subtitle: '',
        price_label: '',
        cta_label: 'Soon',
        cta_url: '',
        media_url: '',
        media_type: 'none',
        badge: '',
        active: true,
        sort_order: 100,
      });

      await loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur lors de la création de la carte vitrine');
    }
  }

  function updateStorefrontDraft(id: number, patch: Partial<StorefrontItem>) {
    setStorefront((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  async function saveStorefrontItem(item: StorefrontItem) {
    try {
      const res = await fetch('/api/admin/storefront', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.error || 'Erreur lors de la sauvegarde de la carte vitrine');
      }

      await loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde de la carte vitrine');
    }
  }

  async function deleteStorefrontItem(id: number) {
    const confirmed = window.confirm('Supprimer cette carte vitrine ?');
    if (!confirmed) return;

    try {
      await fetch(`/api/admin/storefront?id=${id}`, {
        method: 'DELETE',
      });
      await loadData();
    } catch {
      alert('Erreur lors de la suppression de la carte vitrine');
    }
  }

  return (
    <main className="admin-points-page min-h-screen bg-gradient-to-br from-dark-darker via-dark-navy to-dark-blue text-white p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        <div>
          <h1 className="text-5xl md:text-6xl font-black gradient-text mb-2">ADMINISTRATION</h1>
          <p className="text-gray-400 text-sm tracking-widest">Points + Vitrine carrousel</p>
          <div className="h-1 mt-4 bg-gradient-to-r from-neon-yellow via-neon-pink to-neon-blue"></div>
        </div>

        <div>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-black">⚙️ CONFIGURATION</h2>
            <div className="flex-1 h-1 bg-gradient-to-r from-neon-pink to-transparent"></div>
          </div>

          <div className="neon-border-pink glass-dark rounded-3xl p-8">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-neon-pink text-xs tracking-widest font-bold mb-3">💵 VALEUR $ PAR POINT</label>
                <input
                  type="number"
                  step="0.001"
                  value={newConfig.dollar || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setNewConfig({ ...newConfig, dollar: Number.isNaN(val) ? 0 : val });
                  }}
                  className="w-full bg-dark-navy border border-neon-pink rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-pink transition"
                />
                <p className="text-xs text-gray-400 mt-2">
                  Actuel: <span className="text-neon-pink font-bold">${config.point_dollar_value}</span>
                </p>
              </div>
              <div>
                <label className="block text-neon-blue text-xs tracking-widest font-bold mb-3">⏱️ MINUTES PAR POINT</label>
                <input
                  type="number"
                  value={newConfig.minutes || ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setNewConfig({ ...newConfig, minutes: Number.isNaN(val) ? 0 : val });
                  }}
                  className="w-full bg-dark-navy border border-neon-blue rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue transition"
                />
                <p className="text-xs text-gray-400 mt-2">
                  Actuel: <span className="text-neon-blue font-bold">{config.point_minutes_value} min</span>
                </p>
              </div>
            </div>
            <button onClick={updateConfig} className="btn-yellow w-full">✅ METTRE À JOUR</button>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-black">🛍️ VITRINE</h2>
            <div className="flex-1 h-1 bg-gradient-to-r from-neon-yellow to-transparent"></div>
          </div>

          <div className="neon-border-yellow glass-dark rounded-3xl p-8 space-y-8">
            <div className="pb-8 border-b border-neon-yellow/30">
              <p className="text-neon-yellow text-xs tracking-widest font-bold mb-4">➕ NOUVELLE CARTE VITRINE</p>
              <div className="grid md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Titre"
                  value={newStorefrontItem.title}
                  onChange={(e) => setNewStorefrontItem({ ...newStorefrontItem, title: e.target.value })}
                  className="bg-dark-navy border border-neon-yellow rounded-lg px-4 py-2 text-white"
                />
                <input
                  type="text"
                  placeholder="Sous-titre"
                  value={newStorefrontItem.subtitle}
                  onChange={(e) => setNewStorefrontItem({ ...newStorefrontItem, subtitle: e.target.value })}
                  className="bg-dark-navy border border-neon-yellow rounded-lg px-4 py-2 text-white"
                />
                <input
                  type="text"
                  placeholder="Prix label (ex: $29)"
                  value={newStorefrontItem.price_label}
                  onChange={(e) => setNewStorefrontItem({ ...newStorefrontItem, price_label: e.target.value })}
                  className="bg-dark-navy border border-neon-yellow rounded-lg px-4 py-2 text-white"
                />
                <input
                  type="text"
                  placeholder="Texte bouton"
                  value={newStorefrontItem.cta_label}
                  onChange={(e) => setNewStorefrontItem({ ...newStorefrontItem, cta_label: e.target.value })}
                  className="bg-dark-navy border border-neon-yellow rounded-lg px-4 py-2 text-white"
                />
                <input
                  type="url"
                  placeholder="Lien bouton (optionnel)"
                  value={newStorefrontItem.cta_url}
                  onChange={(e) => setNewStorefrontItem({ ...newStorefrontItem, cta_url: e.target.value })}
                  className="bg-dark-navy border border-neon-yellow rounded-lg px-4 py-2 text-white"
                />
                <input
                  type="url"
                  placeholder="Media URL (image/video)"
                  value={newStorefrontItem.media_url}
                  onChange={(e) => setNewStorefrontItem({ ...newStorefrontItem, media_url: e.target.value })}
                  className="bg-dark-navy border border-neon-yellow rounded-lg px-4 py-2 text-white"
                />
                <select
                  value={newStorefrontItem.media_type}
                  onChange={(e) => setNewStorefrontItem({ ...newStorefrontItem, media_type: e.target.value as 'none' | 'image' | 'video' })}
                  className="bg-dark-navy border border-neon-yellow rounded-lg px-4 py-2 text-white"
                >
                  <option value="none">Aucun media</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
                <input
                  type="text"
                  placeholder="Badge (NEW, HOT, etc.)"
                  value={newStorefrontItem.badge}
                  onChange={(e) => setNewStorefrontItem({ ...newStorefrontItem, badge: e.target.value })}
                  className="bg-dark-navy border border-neon-yellow rounded-lg px-4 py-2 text-white"
                />
                <input
                  type="number"
                  placeholder="Ordre"
                  value={newStorefrontItem.sort_order}
                  onChange={(e) => setNewStorefrontItem({ ...newStorefrontItem, sort_order: parseInt(e.target.value, 10) || 0 })}
                  className="bg-dark-navy border border-neon-yellow rounded-lg px-4 py-2 text-white"
                />
              </div>
              <label className="mt-4 inline-flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={newStorefrontItem.active}
                  onChange={(e) => setNewStorefrontItem({ ...newStorefrontItem, active: e.target.checked })}
                />
                Actif
              </label>
              <button onClick={createStorefrontItem} className="btn-neon mt-4 w-full">CRÉER LA CARTE</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-neon-yellow text-xs tracking-widest font-bold border-b border-neon-yellow/30">
                    <th className="pb-4 text-left">TITRE</th>
                    <th className="pb-4 text-left">PRIX</th>
                    <th className="pb-4 text-left">BOUTON</th>
                    <th className="pb-4 text-left">URL</th>
                    <th className="pb-4 text-center">MEDIA</th>
                    <th className="pb-4 text-center">ORDRE</th>
                    <th className="pb-4 text-center">ACTIF</th>
                    <th className="pb-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {storefront.map((item) => (
                    <tr key={item.id} className="border-b border-neon-yellow/10">
                      <td className="py-3 pr-2">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateStorefrontDraft(item.id, { title: e.target.value })}
                          className="w-full bg-dark-navy border border-neon-yellow/40 rounded px-2 py-1 text-white"
                        />
                      </td>
                      <td className="py-3 pr-2">
                        <input
                          type="text"
                          value={item.price_label || ''}
                          onChange={(e) => updateStorefrontDraft(item.id, { price_label: e.target.value })}
                          className="w-full bg-dark-navy border border-neon-yellow/40 rounded px-2 py-1 text-white"
                        />
                      </td>
                      <td className="py-3 pr-2">
                        <input
                          type="text"
                          value={item.cta_label || ''}
                          onChange={(e) => updateStorefrontDraft(item.id, { cta_label: e.target.value })}
                          className="w-full bg-dark-navy border border-neon-yellow/40 rounded px-2 py-1 text-white"
                        />
                      </td>
                      <td className="py-3 pr-2">
                        <input
                          type="text"
                          value={item.cta_url || ''}
                          onChange={(e) => updateStorefrontDraft(item.id, { cta_url: e.target.value })}
                          className="w-full bg-dark-navy border border-neon-yellow/40 rounded px-2 py-1 text-white"
                        />
                      </td>
                      <td className="py-3 pr-2 text-center">
                        <select
                          value={item.media_type}
                          onChange={(e) => updateStorefrontDraft(item.id, { media_type: e.target.value as 'none' | 'image' | 'video' })}
                          className="bg-dark-navy border border-neon-yellow/40 rounded px-2 py-1 text-white"
                        >
                          <option value="none">none</option>
                          <option value="image">image</option>
                          <option value="video">video</option>
                        </select>
                      </td>
                      <td className="py-3 pr-2 text-center">
                        <input
                          type="number"
                          value={item.sort_order}
                          onChange={(e) => updateStorefrontDraft(item.id, { sort_order: parseInt(e.target.value, 10) || 0 })}
                          className="w-20 bg-dark-navy border border-neon-yellow/40 rounded px-2 py-1 text-white text-center"
                        />
                      </td>
                      <td className="py-3 text-center">
                        <input
                          type="checkbox"
                          checked={Boolean(item.active)}
                          onChange={(e) => updateStorefrontDraft(item.id, { active: e.target.checked ? 1 : 0 })}
                        />
                      </td>
                      <td className="py-3 text-right">
                        <div className="inline-flex gap-2">
                          <button onClick={() => saveStorefrontItem(item)} className="btn-neon">Save</button>
                          <button onClick={() => deleteStorefrontItem(item.id)} className="btn-yellow">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-black">📦 PACKAGES</h2>
            <div className="flex-1 h-1 bg-gradient-to-r from-neon-yellow to-transparent"></div>
          </div>

          <div className="neon-border-yellow glass-dark rounded-3xl p-8">
            <div className="mb-8 pb-8 border-b border-neon-yellow/30 space-y-4">
              <p className="text-neon-yellow text-xs tracking-widest font-bold mb-4">➕ CRÉER UN NOUVEAU PACKAGE</p>
              <div className="grid md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Nom"
                  value={newPackage.name}
                  onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                  className="bg-dark-navy border border-neon-yellow rounded-lg px-4 py-2 text-white"
                />
                <input
                  type="number"
                  placeholder="Points"
                  value={newPackage.points || ''}
                  onChange={(e) => setNewPackage({ ...newPackage, points: parseInt(e.target.value, 10) || 0 })}
                  className="bg-dark-navy border border-neon-yellow rounded-lg px-4 py-2 text-white"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Prix USD"
                  value={newPackage.price_usd || ''}
                  onChange={(e) => setNewPackage({ ...newPackage, price_usd: parseFloat(e.target.value) || 0 })}
                  className="bg-dark-navy border border-neon-yellow rounded-lg px-4 py-2 text-white"
                />
                <button onClick={createPackage} className="btn-neon">CRÉER</button>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button type="button" onClick={exportPackagesCsv} className="btn-yellow">EXPORT CSV PACKAGES</button>
                <button type="button" onClick={() => packageCsvInputRef.current?.click()} className="btn-neon">IMPORT CSV PACKAGES</button>
                <input
                  ref={packageCsvInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (file) await importPackagesCsv(file);
                    event.currentTarget.value = '';
                  }}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-neon-yellow text-xs tracking-widest font-bold border-b border-neon-yellow/30">
                    <th className="pb-4 text-left">NOM</th>
                    <th className="pb-4 text-center">POINTS</th>
                    <th className="pb-4 text-center">PRIX (USD)</th>
                    <th className="pb-4 text-center">$/PT</th>
                    <th className="pb-4 text-center">STATUT</th>
                    <th className="pb-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((pkg) => (
                    <tr key={pkg.id} className="border-b border-neon-yellow/10">
                      <td className="py-3 pr-2">
                        <input
                          type="text"
                          value={pkg.name}
                          onChange={(e) => updatePackageDraft(pkg.id, { name: e.target.value })}
                          className="w-full bg-dark-navy border border-neon-yellow/40 rounded px-2 py-1 text-white"
                        />
                      </td>
                      <td className="py-3 pr-2 text-center">
                        <input
                          type="number"
                          value={pkg.points}
                          onChange={(e) => updatePackageDraft(pkg.id, { points: parseInt(e.target.value, 10) || 0 })}
                          className="w-24 bg-dark-navy border border-neon-yellow/40 rounded px-2 py-1 text-white text-center"
                        />
                      </td>
                      <td className="py-3 pr-2 text-center">
                        <input
                          type="number"
                          step="0.01"
                          value={pkg.price_usd}
                          onChange={(e) => updatePackageDraft(pkg.id, { price_usd: parseFloat(e.target.value) || 0 })}
                          className="w-28 bg-dark-navy border border-neon-yellow/40 rounded px-2 py-1 text-white text-center"
                        />
                      </td>
                      <td className="py-3 text-center text-gray-400">${pkg.points > 0 ? (pkg.price_usd / pkg.points).toFixed(3) : '0.000'}</td>
                      <td className="py-3 text-center">
                        <label className="inline-flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={pkg.active}
                            onChange={(e) => updatePackageDraft(pkg.id, { active: e.target.checked })}
                          />
                          <span className={pkg.active ? 'text-neon-yellow font-bold' : 'text-gray-500'}>
                            {pkg.active ? 'ACTIF' : 'INACTIF'}
                          </span>
                        </label>
                      </td>
                      <td className="py-3 text-right">
                        <button onClick={() => savePackage(pkg)} className="btn-neon">SAVE</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-black">🎮 PROJETS</h2>
            <div className="flex-1 h-1 bg-gradient-to-r from-neon-blue to-transparent"></div>
          </div>

          <div className="neon-border-blue glass-dark rounded-3xl p-8 space-y-6">
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={exportProjectsCsv} className="btn-yellow">EXPORT CSV PROJETS</button>
              <button type="button" onClick={() => projectCsvInputRef.current?.click()} className="btn-neon">IMPORT CSV PROJETS</button>
              <input
                ref={projectCsvInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (file) await importProjectsCsv(file);
                  event.currentTarget.value = '';
                }}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-neon-blue text-xs tracking-widest font-bold border-b border-neon-blue/30">
                    <th className="pb-4 text-left">SLUG</th>
                    <th className="pb-4 text-left">NOM</th>
                    <th className="pb-4 text-center">POINTS REQUIS</th>
                    <th className="pb-4 text-center">DURÉE (CONFIG)</th>
                    <th className="pb-4 text-center">STATUT</th>
                    <th className="pb-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((proj) => {
                    const minutes = proj.points_required * config.point_minutes_value;
                    const hours = (minutes / 60).toFixed(1);
                    return (
                      <tr key={proj.id} className="border-b border-neon-blue/10">
                        <td className="py-3 pr-2">
                          <input
                            type="text"
                            value={proj.project_slug}
                            onChange={(e) => updateProjectDraft(proj.id, { project_slug: e.target.value })}
                            className="w-full bg-dark-navy border border-neon-blue/40 rounded px-2 py-1 text-white"
                          />
                        </td>
                        <td className="py-3 pr-2">
                          <input
                            type="text"
                            value={proj.project_name}
                            onChange={(e) => updateProjectDraft(proj.id, { project_name: e.target.value })}
                            className="w-full bg-dark-navy border border-neon-blue/40 rounded px-2 py-1 text-white"
                          />
                        </td>
                        <td className="py-3 text-center">
                          <input
                            type="number"
                            value={proj.points_required}
                            onChange={(e) => updateProjectDraft(proj.id, { points_required: parseInt(e.target.value, 10) || 0 })}
                            className="w-28 bg-dark-navy border border-neon-blue/40 rounded px-2 py-1 text-white text-center"
                          />
                        </td>
                        <td className="py-3 text-center text-gray-400">{hours}h ({minutes}min)</td>
                        <td className="py-3 text-center">
                          <label className="inline-flex items-center gap-2 text-xs">
                            <input
                              type="checkbox"
                              checked={proj.active}
                              onChange={(e) => updateProjectDraft(proj.id, { active: e.target.checked })}
                            />
                            <span className={proj.active ? 'text-neon-blue font-bold' : 'text-gray-500'}>
                              {proj.active ? 'ACTIF' : 'INACTIF'}
                            </span>
                          </label>
                        </td>
                        <td className="py-3 text-right">
                          <button onClick={() => saveProject(proj)} className="btn-neon">SAVE</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
