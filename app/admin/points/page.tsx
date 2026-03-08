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

export default function AdminPage() {
  const { data: session, status } = useSession();

  // States
  const [packages, setPackages] = useState<PointPackage[]>([]);
  const [projects, setProjects] = useState<ProjectCost[]>([]);
  const [config, setConfig] = useState<PointConfig>({ point_dollar_value: 0.10, point_minutes_value: 6 });
  
  // Form states
  const [newPackage, setNewPackage] = useState({ name: '', points: 0, price_usd: 0 });
  const [newProject, setNewProject] = useState({ slug: '', name: '', points: 0 });
  const [newConfig, setNewConfig] = useState({ dollar: 0.10, minutes: 6 });

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      loadData();
    }
  }, [status, session]);

  async function loadData() {
    try {
      // Packages
      const pkgRes = await fetch('/api/admin/packages', {
      });
      const pkgData = await pkgRes.json();
      setPackages(pkgData.packages || []);

      // Projects
      const projRes = await fetch('/api/admin/projects', {
      });
      const projData = await projRes.json();
      setProjects(projData.projects || []);

      // Config
      const confRes = await fetch('/api/admin/config', {
      });
      const confData = await confRes.json();
      setConfig(confData);
      setNewConfig({ dollar: confData.point_dollar_value, minutes: confData.point_minutes_value });
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
      loadData();
    } catch (error) {
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
      loadData();
    } catch (error) {
      alert('Erreur lors de la mise à jour');
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
            <p className="text-gray-400 text-sm tracking-widest mb-6">
              Cette page est réservée aux administrateurs.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-dark-darker via-dark-navy to-dark-blue text-white p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black gradient-text mb-2">ADMINISTRATION</h1>
          <p className="text-gray-400 text-sm tracking-widest">Système de Points & Configuration</p>
          <div className="h-1 mt-4 bg-gradient-to-r from-neon-yellow via-neon-pink to-neon-blue"></div>
        </div>

        {/* Configuration globale */}
        <div className="mb-12">
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
                    setNewConfig({ ...newConfig, dollar: isNaN(val) ? 0 : val });
                  }}
                  className="w-full bg-dark-navy border border-neon-pink rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-pink transition"
                />
                <p className="text-xs text-gray-400 mt-2">Actuel: <span className="text-neon-pink font-bold">${config.point_dollar_value}</span></p>
              </div>
              <div>
                <label className="block text-neon-blue text-xs tracking-widest font-bold mb-3">⏱️ MINUTES PAR POINT</label>
                <input
                  type="number"
                  value={newConfig.minutes || ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setNewConfig({ ...newConfig, minutes: isNaN(val) ? 0 : val });
                  }}
                  className="w-full bg-dark-navy border border-neon-blue rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-blue transition"
                />
                <p className="text-xs text-gray-400 mt-2">Actuel: <span className="text-neon-blue font-bold">{config.point_minutes_value} min</span></p>
              </div>
            </div>
            <button onClick={updateConfig} className="btn-yellow w-full">
              ✅ METTRE À JOUR
            </button>
          </div>
        </div>

        {/* Packages */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-black">📦 PACKAGES</h2>
            <div className="flex-1 h-1 bg-gradient-to-r from-neon-yellow to-transparent"></div>
          </div>

          <div className="neon-border-yellow glass-dark rounded-3xl p-8">
            {/* Form nouveau package */}
            <div className="mb-8 pb-8 border-b border-neon-yellow/30">
              <p className="text-neon-yellow text-xs tracking-widest font-bold mb-4">➕ CRÉER UN NOUVEAU PACKAGE</p>
              <div className="grid md:grid-cols-5 gap-4">
                <input
                  type="text"
                  placeholder="Nom (Pack Starter)"
                  value={newPackage.name}
                  onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                  className="bg-dark-navy border border-neon-yellow rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-yellow transition"
                />
                <input
                  type="number"
                  placeholder="Points (50)"
                  value={newPackage.points || ''}
                  onChange={(e) => setNewPackage({...newPackage, points: parseInt(e.target.value) || 0 })}
                  className="bg-dark-navy border border-neon-yellow rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-yellow transition"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Prix USD (5.00)"
                  value={newPackage.price_usd || ''}
                  onChange={(e) => setNewPackage({ ...newPackage, price_usd: parseFloat(e.target.value) || 0 })}
                  className="bg-dark-navy border border-neon-yellow rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-yellow transition"
                />
                <button onClick={createPackage} className="btn-neon">
                  CRÉER
                </button>
              </div>
            </div>

            {/* Liste packages */}
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
                    <tr key={pkg.id} className="border-b border-neon-yellow/10 hover:border-neon-yellow/30 transition">
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

        {/* Coûts projets */}
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
                      <tr key={proj.id} className="border-b border-neon-blue/10 hover:border-neon-blue/30 transition">
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
