import React, { useState } from 'react';
import { ShieldCheck, LockKeyhole } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

const DEMO_USERS = [
  {
    email: 'admin@acms.com',
    password: 'Admin@123',
    role: 'Administrator',
  },
  {
    email: 'officer@acms.com',
    password: 'Officer@123',
    role: 'AICTE Officer',
  },
  {
    email: 'institution@acms.com',
    password: 'Institute@123',
    role: 'Institution User',
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Administrator');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    const user = DEMO_USERS.find(
      (u) =>
        u.email.toLowerCase() === email.trim().toLowerCase() &&
        u.password === password &&
        u.role === role
    );

    if (!user) {
      setError('Invalid email, password, or selected role.');
      return;
    }

    setLoading(true);

    try {
      sessionStorage.setItem(
        'acmsUser',
        JSON.stringify({
          email: user.email,
          role: user.role,
          loginTime: new Date().toISOString(),
        })
      );

      onLogin();
    } catch {
      setError('Unable to start your session. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-center mb-5">
          <div className="bg-blue-100 p-4 rounded-full">
            <ShieldCheck className="w-10 h-10 text-blue-700" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-slate-900">
          ACMS User Login
        </h1>

        <p className="text-sm text-slate-500 text-center mt-2 mb-7">
          AICTE Approval & Compliance Management System
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="role" className="block text-sm font-medium mb-2">
              User Role
            </label>

            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Administrator">Administrator</option>
              <option value="AICTE Officer">AICTE Officer</option>
              <option value="Institution User">Institution User</option>
            </select>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-semibold rounded-lg p-3 transition"
          >
            <LockKeyhole className="inline w-4 h-4 mr-2" />
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 rounded-lg bg-blue-50 p-3">
          <p className="text-sm font-semibold text-slate-700">
            Demo credentials
          </p>
          <p className="text-xs text-slate-600 mt-2">
            Admin: admin@acms.com / Admin@123
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Officer: officer@acms.com / Officer@123
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Institution: institution@acms.com / Institute@123
          </p>
        </div>

        <p className="text-xs text-slate-500 text-center mt-5">
          Authorized users only
        </p>
      </div>
    </div>
  );
};