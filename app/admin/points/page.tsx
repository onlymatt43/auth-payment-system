'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

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
  const [adminPassword, setAdminPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  
  // States
  const [packages, setPackages] = useState<PointPackage[]>([]);
  const [projects, setProjects] = useState<ProjectCost[]>([]);
  const [config, setConfig] = useState<PointConfig>({ point_dollar_value: 0.10, point_minutes_value: 6 });
  
  // Form states
  const [newPackage, setNewPackage] = useState({ name: '', points: 0, price_usd: 0 });
  const [newProject, setNewProject] = useState({ slug: '', name: '', points: 0 });
  const [newConfig, setNewConfig] = useState({ dollar: 0.10, minutes: 6 });

  useEffect(() => {
    if (authenticated) {
      loadData();
    }
  }, [authenticated]);

  async function loadData() {
    try {
      // Packages
      const pkgRes = await fetch('/api/admin/packages', {
        headers: { 'x-admin-password': adminPassword },
      });
      const pkgData = await pkgRes.json();
      setPackages(pkgData.packages || []);

      // Projects
      const projRes = await fetch('/api/admin/projects', {
        headers: { 'x-admin-password': adminPassword },
      });
      const projData = await projRes.json();
      setProjects(projData.projects || []);

      // Config
      const confRes = await fetch('/api/admin/config', {
        headers: { 'x-admin-password': adminPassword },
      });
      const confData = await confRes.json();
      setConfig(confData);
      setNewConfig({ dollar: confData.point_dollar_value, minutes: confData.point_minutes_value });
    } catch (error) {
      console.error('Failed to load admin data:', error);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    // Vérifier le mot de passe
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: adminPassword }),
    });
    
    if (res.ok) {
      setAuthenticated(true);
    } else {
      alert('Mot de passe incorrect');
    }
  }

  async function createPackage() {
    try {
      await fetch('/api/admin/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
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
          'x-admin-password': adminPassword,
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
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Chargement...</div>;
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6">Admin - Système de Points</h1>
          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            placeholder="Mot de passe admin"
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2 mb-4"
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold">
            Se connecter
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Administration - Système de Points</h1>

        {/* Configuration globale */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Configuration Globale</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Valeur $ par point</label>
              <input
                type="number"
                step="0.001"
                value={newConfig.dollar || ''}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setNewConfig({ ...newConfig, dollar: isNaN(val) ? 0 : val });
                }}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2"
              />
              <p className="text-xs text-zinc-500 mt-1">Actuel: ${config.point_dollar_value}</p>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Minutes par point</label>
              <input
                type="number"
                value={newConfig.minutes || ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setNewConfig({ ...newConfig, minutes: isNaN(val) ? 0 : val });
                }}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-4 py-2"
              />
              <p className="text-xs text-zinc-500 mt-1">Actuel: {config.point_minutes_value} min</p>
            </div>
          </div>
          <button onClick={updateConfig} className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded font-semibold">
            Mettre à jour
          </button>
        </div>

        {/* Packages */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Packages de Points</h2>
          
          {/* Form nouveau package */}
          <div className="grid md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-zinc-800">
            <input
              type="text"
              placeholder="Nom (Pack Starter)"
              value={newPackage.name}
              onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
              className="bg-zinc-800 border border-zinc-700 rounded px-4 py-2"
            />
            <input
              type="number"
              placeholder="Points (50)"
              value={newPackage.points || ''}
              onChange={(e) => setNewPackage({...newPackage, points: parseInt(e.target.value) || 0 })}
              className="bg-zinc-800 border border-zinc-700 rounded px-4 py-2"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Prix USD (5.00)"
              value={newPackage.price_usd || ''}
              onChange={(e) => setNewPackage({ ...newPackage, price_usd: parseFloat(e.target.value) || 0 })}
              className="bg-zinc-800 border border-zinc-700 rounded px-4 py-2"
            />
            <button onClick={createPackage} className="bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold">
              Créer
            </button>
          </div>

          {/* Liste packages */}
          <table className="w-full">
            <thead>
              <tr className="text-left text-zinc-400 text-sm">
                <th className="pb-2">Nom</th>
                <th className="pb-2">Points</th>
                <th className="pb-2">Prix (USD)</th>
                <th className="pb-2">$/pt</th>
                <th className="pb-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <tr key={pkg.id} className="border-t border-zinc-800">
                  <td className="py-3">{pkg.name}</td>
                  <td>{pkg.points}</td>
                  <td>${pkg.price_usd.toFixed(2)}</td>
                  <td className="text-zinc-500">${(pkg.price_usd / pkg.points).toFixed(3)}</td>
                  <td>
                    <span className={pkg.active ? 'text-green-500' : 'text-zinc-500'}>
                      {pkg.active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Coûts projets */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Coûts des Projets</h2>
          <table className="w-full">
            <thead>
              <tr className="text-left text-zinc-400 text-sm">
                <th className="pb-2">Slug</th>
                <th className="pb-2">Nom</th>
                <th className="pb-2">Points requis</th>
                <th className="pb-2">Durée (config actuelle)</th>
                <th className="pb-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((proj) => {
                const minutes = proj.points_required * config.point_minutes_value;
                const hours = (minutes / 60).toFixed(1);
                return (
                  <tr key={proj.id} className="border-t border-zinc-800">
                    <td className="py-3"><code className="text-sm bg-zinc-800 px-2 py-1 rounded">{proj.project_slug}</code></td>
                    <td>{proj.project_name}</td>
                    <td className="font-bold">{proj.points_required} pts</td>
                    <td className="text-zinc-400">{hours}h ({minutes}min)</td>
                    <td>
                      <span className={proj.active ? 'text-green-500' : 'text-zinc-500'}>
                        {proj.active ? 'Actif' : 'Inactif'}
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
  );
}
