'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

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

export default function AdminPage() {
  const { data: session, status } = useSession();

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
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      void loadData();
    }
  }, [status, session]);

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

      setPackages(pkgData.packages || []);
      setProjects(projData.projects || []);
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

  async function createStorefrontItem() {
    try {
      await fetch('/api/admin/storefront', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStorefrontItem),
      });

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
    } catch {
      alert('Erreur lors de la création de la carte vitrine');
    }
  }

  function updateStorefrontDraft(id: number, patch: Partial<StorefrontItem>) {
    setStorefront((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  async function saveStorefrontItem(item: StorefrontItem) {
    try {
      await fetch('/api/admin/storefront', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      await loadData();
    } catch {
      alert('Erreur lors de la sauvegarde de la carte vitrine');
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-darker via-dark-navy to-dark-blue flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse glow-blue">⚡</div>
          <p className="text-white text-lg glow-blue">Chargement...</p>
        </div>
      </div>
    );
  }

  if (status === 'authenticated' && session?.user?.role !== 'admin') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-dark-darker via-dark-navy to-dark-blue flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="neon-border-yellow glass-dark rounded-3xl p-12 text-center">
            <h1 className="text-4xl font-black gradient-text mb-2">ACCÈS REFUSÉ</h1>
            <p className="text-gray-400 text-sm tracking-widest mb-6">Cette page est réservée aux administrateurs.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-dark-darker via-dark-navy to-dark-blue text-white p-6 md:p-12">
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
            <div className="mb-8 pb-8 border-b border-neon-yellow/30">
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
                  </tr>
                </thead>
                <tbody>
                  {packages.map((pkg) => (
                    <tr key={pkg.id} className="border-b border-neon-yellow/10">
                      <td className="py-4 font-bold">{pkg.name}</td>
                      <td className="py-4 text-center text-neon-yellow">{pkg.points}</td>
                      <td className="py-4 text-center">${pkg.price_usd.toFixed(2)}</td>
                      <td className="py-4 text-center text-gray-400">${(pkg.price_usd / pkg.points).toFixed(3)}</td>
                      <td className="py-4 text-center">
                        <span className={pkg.active ? 'text-neon-yellow font-bold' : 'text-gray-500'}>
                          {pkg.active ? '✓ ACTIF' : '✗ INACTIF'}
                        </span>
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

          <div className="neon-border-blue glass-dark rounded-3xl p-8">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-neon-blue text-xs tracking-widest font-bold border-b border-neon-blue/30">
                    <th className="pb-4 text-left">SLUG</th>
                    <th className="pb-4 text-left">NOM</th>
                    <th className="pb-4 text-center">POINTS REQUIS</th>
                    <th className="pb-4 text-center">DURÉE (CONFIG)</th>
                    <th className="pb-4 text-center">STATUT</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((proj) => {
                    const minutes = proj.points_required * config.point_minutes_value;
                    const hours = (minutes / 60).toFixed(1);
                    return (
                      <tr key={proj.id} className="border-b border-neon-blue/10">
                        <td className="py-4"><code className="bg-dark-navy px-3 py-1 rounded text-neon-blue text-xs">{proj.project_slug}</code></td>
                        <td className="py-4 font-bold">{proj.project_name}</td>
                        <td className="py-4 text-center text-neon-blue">{proj.points_required} pts</td>
                        <td className="py-4 text-center text-gray-400">{hours}h ({minutes}min)</td>
                        <td className="py-4 text-center">
                          <span className={proj.active ? 'text-neon-blue font-bold' : 'text-gray-500'}>
                            {proj.active ? '✓ ACTIF' : '✗ INACTIF'}
                          </span>
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
