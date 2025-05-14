import { useState } from 'react';
import { useAuth } from '../../AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
      try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      if (error instanceof Error) {
        const errorMessage = error.message || 'An unknown error occurred';
        // Extract Firebase error code from message if present
        if (errorMessage.includes('auth/')) {
          const errorCode = errorMessage.match(/auth\/[\w-]+/)?.[0] || '';
          switch (errorCode) {
            case 'auth/email-already-in-use':
              setError('This email is already registered. Please log in or use a different email.');
              break;
            case 'auth/invalid-email':
              setError('Please enter a valid email address.');
              break;
            case 'auth/weak-password':
              setError('Password should be at least 6 characters long.');
              break;
            case 'auth/user-not-found':
            case 'auth/wrong-password':
              setError('Invalid email or password. Please try again.');
              break;
            case 'auth/too-many-requests':
              setError('Too many unsuccessful attempts. Please try again later.');
              break;
            default:
              setError(`Authentication failed: ${errorMessage}`);
          }
        } else {
          setError(`Error: ${errorMessage}`);
        }
      } else {
        setError('Failed to authenticate. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-md overflow-hidden p-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700 text-red-400 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-full rounded-md border border-gray-600 bg-gray-700 py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full rounded-md border border-gray-600 bg-gray-700 py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-400 hover:text-blue-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-1"
          >
            {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
