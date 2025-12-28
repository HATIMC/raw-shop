import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(password);
    
    if (!success) {
      setError('Invalid password');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shop Admin Portal</h1>
          <p className="text-gray-600">Enter password to access the admin panel</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Enter password"
              className="input"
              autoFocus
            />
            {error && (
              <p className="text-red-600 text-sm mt-2">{error}</p>
            )}
          </div>

          <button type="submit" className="w-full btn btn-primary py-3">
            Login to Admin Panel
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Default password: <code className="bg-gray-100 px-2 py-1 rounded">admin123</code></p>
          <p className="mt-2 text-xs">Change password in authStore.ts</p>
        </div>
      </div>
    </div>
  );
}
