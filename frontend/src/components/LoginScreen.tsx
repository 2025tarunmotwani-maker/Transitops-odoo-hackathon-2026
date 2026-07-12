import React, { useState } from 'react';
import { User, Role } from '../types';
import { SEED_USERS } from '../data/seedData';
import { Shield, Key, Mail, Truck, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate authenticating against seed users
    setTimeout(() => {
      const match = SEED_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!match) {
        setError('Invalid credentials. Try our quick login options below!');
        setLoading(false);
        return;
      }

      // Password rules - simple password for seed users
      const expectedPassword = email.split('@')[0] === 'manager' ? 'admin123' : `${email.split('@')[0]}123`;
      if (password !== expectedPassword) {
        setError('Incorrect password. Please try again.');
        setLoading(false);
        return;
      }

      onLoginSuccess(match);
      setLoading(false);
    }, 450);
  };

  const handleQuickLogin = (user: User) => {
    const expectedPassword = user.email.split('@')[0] === 'manager' ? 'admin123' : `${user.email.split('@')[0]}123`;
    setEmail(user.email);
    setPassword(expectedPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-3">
          <div className="p-2.5 bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-xl shadow-xs shrink-0">
            <Truck className="h-6 w-6 text-zinc-400" />
          </div>
          <span className="text-2xl tracking-[4px] font-display uppercase font-semibold text-zinc-100">TransitOps</span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-display font-medium tracking-tight text-zinc-100">
          The Operational Sphere
        </h2>
        <p className="mt-2 text-center text-xs tracking-widest uppercase font-semibold text-zinc-500">
          Smart Transport Operations & Fleet Ledger
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-zinc-900 py-8 px-4 border border-zinc-800/80 sm:rounded-2xl sm:px-10 shadow-xl">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-950/40 border border-red-900/50 rounded-lg flex items-center gap-2 text-xs text-red-300"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </motion.div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs uppercase tracking-wider font-semibold text-zinc-400">
                Email address
              </label>
              <div className="mt-1.5 relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-zinc-700 text-sm"
                  placeholder="manager@transitops.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs uppercase tracking-wider font-semibold text-zinc-400">
                Password
              </label>
              <div className="mt-1.5 relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Key className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-zinc-700 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-zinc-100 rounded-full text-xs font-semibold uppercase tracking-wider text-zinc-950 bg-zinc-100 hover:bg-zinc-200 transition-colors duration-200 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Authenticating Sphere...' : 'Access Portal'}
              </button>
            </div>
          </form>

          <div className="mt-8 border-t border-zinc-800/80 pt-6">
            <div className="relative flex justify-center text-sm mb-4">
              <span className="px-3 bg-zinc-900 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Authorized Quick Entry
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {SEED_USERS.map((user) => {
                let badgeColor = 'bg-zinc-950/40 text-zinc-400 border border-zinc-800/80 hover:bg-zinc-850 hover:text-zinc-200';
                
                return (
                  <button
                    key={user.email}
                    type="button"
                    onClick={() => handleQuickLogin(user)}
                    className={`p-2.5 rounded-xl text-left text-xs transition-all duration-150 cursor-pointer ${badgeColor}`}
                  >
                    <div className="font-bold text-zinc-300 font-display text-sm">{user.name}</div>
                    <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mt-0.5">{user.role}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
