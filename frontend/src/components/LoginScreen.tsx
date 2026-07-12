import React, { useState } from 'react';
import { User, Role } from '../types';
import { SEED_USERS } from '../data/seedData';
import { Shield, Key, Mail, Truck, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

const ROLE_LABELS: Record<Role, string> = {
  'Fleet Manager': 'Fleet Manager',
  'Driver': 'Dispatcher',
  'Safety Officer': 'Safety Officer',
  'Financial Analyst': 'Financial Analyst',
};

const ROLE_DESCRIPTIONS: Array<{ label: string; value: Role }> = [
  { label: "Fleet Manager", value: "Fleet Manager" },
  { label: "Dispatcher", value: "Driver" },
  { label: "Safety Officer", value: "Safety Officer" },
  { label: "Financial Analyst", value: "Financial Analyst" },
];

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('manager@transitops.com');
  const [password, setPassword] = useState('admin123');
  const [role, setRole] = useState<Role>('Fleet Manager');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  setError("");
  setLoading(true);

  console.log({
    email,
    password,
  });

  try {
    const response = await fetch("http://localhost:8081/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Login failed");
      return;
    }

    // Verify selected role matches backend role
    if (data.user.role !== role) {
      setError("Selected role does not match your account.");
      return;
    }

    localStorage.setItem("user", JSON.stringify(data.user));

    onLoginSuccess(data.user);
  } catch (err) {
    console.error(err);
    setError("Unable to connect to server.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 lg:p-12">
      <header className="text-center mb-10">
        <div className="inline-flex items-center gap-3">
          <div className="p-3 bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-2xl shadow-sm">
            <Truck className="h-7 w-7 text-amber-300" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-zinc-500 font-semibold">TransiTOps</p>
          </div>
        </div>
        <h1 className="mt-4 text-5xl font-display font-bold tracking-tight text-zinc-100">
          Smart Transport Operations Platform
          </h1>
      </header>

      <main className="w-full max-w-xl">
        <div className="w-full bg-zinc-900/95 border border-zinc-800 shadow-2xl rounded-[2.5rem] p-12 lg:p-16">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-3xl border border-red-500/50 bg-red-950/40 px-4 py-3 text-sm text-red-200"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}

          <div className="mb-10 text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-amber-300 font-semibold mb-3">Sign in to your account</p>
            <h2 className="text-4xl font-display font-semibold tracking-tight text-zinc-100">
              Enter your credentials to continue
            </h2>
          </div>

          <form className="space-y-7" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs uppercase tracking-wider font-semibold text-zinc-400">
                Email address
              </label>
              <div className="mt-2 relative rounded-3xl border border-zinc-800 bg-zinc-950/90">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-zinc-500">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-3xl border-none bg-transparent py-4 pl-14 pr-5 text-base text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
                  placeholder="manager@transitops.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs uppercase tracking-wider font-semibold text-zinc-400">
                Password
              </label>
              <div className="mt-2 relative rounded-3xl border border-zinc-800 bg-zinc-950/90">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-zinc-500">
                  <Key className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-3xl border-none bg-transparent py-4 pl-14 pr-5 text-base text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-xs uppercase tracking-wider font-semibold text-zinc-400">
                Role (RBAC)
              </label>
              <div className="mt-2 rounded-3xl border border-zinc-800 bg-zinc-950/90 relative">
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full appearance-none rounded-3xl border-none bg-transparent py-4 px-6 text-base text-zinc-100 focus:outline-none pr-10"
                >
                  {ROLE_DESCRIPTIONS.map((item) => (
                    <option key={item.value} value={item.value} className="bg-zinc-950 text-zinc-100">
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 text-xs lg:text-sm text-zinc-400">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-400 focus:ring-amber-300"
                />
                Remember me
              </label>
              <button type="button" className="text-amber-300 hover:text-amber-200 font-semibold">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-amber-500 px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-12 border-t border-zinc-800/80 pt-8">
            <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-500 font-semibold mb-5 text-center lg:text-left">
              Access is scoped by role after login
            </p>
            <ul className="space-y-3.5 text-sm lg:text-base text-zinc-300">
              <li className="flex gap-3 items-center">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                Fleet Manager – Fleet, Maintenance
              </li>
              <li className="flex gap-3 items-center">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                Dispatcher – Dashboard, Trips
              </li>
              <li className="flex gap-3 items-center">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                Safety Officer – Drivers, Compliance
              </li>
              <li className="flex gap-3 items-center">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                Financial Analyst – Fuel & Expenses, Analytics
              </li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="mt-12 text-center text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-semibold">
          TRANSITOPS © 2026 · RBAC ENABLED
      </footer>
    </div>
  );
}