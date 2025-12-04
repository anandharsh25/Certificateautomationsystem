import { useState } from 'react';
import { Award } from 'lucide-react';

interface SignupProps {
  onSignup: (name: string, email: string, password: string) => Promise<void>;
  onSwitchToLogin: () => void;
}

export function Signup({ onSignup, onSwitchToLogin }: SignupProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await onSignup(name, email, password);
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 glass-card rounded-xl mb-4 shadow-lg">
            <Award className="w-8 h-8 text-indigo-300" />
          </div>
          <h1 className="text-gray-100 mb-2 drop-shadow-lg">Welcome to EventEye</h1>
          <p className="text-gray-300 drop-shadow">Certificate Automation System</p>
        </div>

        <div className="glass-card rounded-xl shadow-xl p-8">
          <h2 className="text-gray-100 mb-6 drop-shadow">Create your account</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-lg text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-gray-200 mb-2 drop-shadow">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 glass-input rounded-lg focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 text-gray-100 placeholder-gray-400"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-gray-200 mb-2 drop-shadow">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 glass-input rounded-lg focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 text-gray-100 placeholder-gray-400"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-200 mb-2 drop-shadow">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 glass-input rounded-lg focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 text-gray-100 placeholder-gray-400"
                placeholder="••••••••"
                minLength={6}
              />
              <p className="text-gray-400 mt-1">
                Must be at least 6 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full glass-button text-gray-100 py-2 px-4 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-indigo-300 hover:text-indigo-200 underline"
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}