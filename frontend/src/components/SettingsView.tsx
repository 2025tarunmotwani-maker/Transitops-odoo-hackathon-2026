import React, { useEffect, useState } from 'react';
import { ShieldCheck, Search, Save, CheckCircle2 } from 'lucide-react';
import { AppSettings } from '../types';

const roles = [
  { role: 'Fleet Manager', fleet: '✓', drivers: '✓', trips: '✓', fuelExp: '✓', analytics: '✓' },
  { role: 'Dispatcher', fleet: 'View', drivers: '–', trips: '✓', fuelExp: '–', analytics: '–' },
  { role: 'Safety Officer', fleet: '–', drivers: '✓', trips: 'View', fuelExp: '–', analytics: '–' },
  { role: 'Financial Analyst', fleet: 'View', drivers: '–', trips: '–', fuelExp: '✓', analytics: '✓' }
];

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
}

export default function SettingsView({ settings, onSaveSettings }: SettingsViewProps) {
  const [depotName, setDepotName] = useState(settings.depotName);
  const [currency, setCurrency] = useState(settings.currency);
  const [distanceUnit, setDistanceUnit] = useState(settings.distanceUnit);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDepotName(settings.depotName);
    setCurrency(settings.currency);
    setDistanceUnit(settings.distanceUnit);
  }, [settings]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const updatedSettings: AppSettings = {
      depotName,
      currency,
      distanceUnit
    };
    onSaveSettings(updatedSettings);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="min-h-full">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Settings & RBAC</h1>
          <p className="mt-1 text-sm text-zinc-500">Configure depot preferences and access controls for your fleet roles.</p>
        </div>
        <div className="w-full md:w-1/3">
          <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-transparent pl-12 pr-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-[0_0_0_1px_rgba(148,163,184,0.05)]">
          <h2 className="text-xs uppercase tracking-[0.35em] text-zinc-500 mb-5">General</h2>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="text-[10px] uppercase tracking-[0.35em] text-zinc-500 mb-2 block">Depot Name</label>
              <input
                value={depotName}
                onChange={(e) => setDepotName(e.target.value)}
                className="w-full rounded-3xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 focus:border-sky-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.35em] text-zinc-500 mb-2 block">Currency</label>
              <input
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-3xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 focus:border-sky-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.35em] text-zinc-500 mb-2 block">Distance Unit</label>
              <input
                value={distanceUnit}
                onChange={(e) => setDistanceUnit(e.target.value)}
                className="w-full rounded-3xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 focus:border-sky-500 outline-none"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-3xl bg-sky-600 px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-sky-500 transition"
            >
              <Save className="h-4 w-4" />
              Save changes
            </button>
            {saved && (
              <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/15 px-4 py-3 text-sm text-emerald-300 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                Settings updated
              </div>
            )}
          </form>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-[0_0_0_1px_rgba(148,163,184,0.05)]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xs uppercase tracking-[0.35em] text-zinc-500">Role-Based Access (RBAC)</h2>
              <p className="text-[11px] text-zinc-500 mt-1">Permissions matrix for fleet control areas.</p>
            </div>
            <div className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-zinc-400">Live</div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.35em] text-zinc-500">
                  <th className="pb-4 pr-6 font-semibold">Role</th>
                  <th className="pb-4 pr-6 font-semibold">Fleet</th>
                  <th className="pb-4 pr-6 font-semibold">Drivers</th>
                  <th className="pb-4 pr-6 font-semibold">Trips</th>
                  <th className="pb-4 pr-6 font-semibold">Fuel/Exp.</th>
                  <th className="pb-4 font-semibold">Analytics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {roles.map((row) => (
                  <tr key={row.role} className="h-16">
                    <td className="pr-6 font-semibold text-slate-100">{row.role}</td>
                    <td className="pr-6">{row.fleet}</td>
                    <td className="pr-6">{row.drivers}</td>
                    <td className="pr-6">{row.trips}</td>
                    <td className="pr-6">{row.fuelExp}</td>
                    <td>{row.analytics}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
