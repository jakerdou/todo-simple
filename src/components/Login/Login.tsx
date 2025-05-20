import { useState } from 'react';
import { useAuth } from '../../AuthContext';

interface LoginProps {
  onBackToLanding?: () => void;
}

export default function Login({ onBackToLanding }: LoginProps) {
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
    }  }  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-md overflow-hidden p-6">
        <div className="flex items-center justify-between mb-6">
          {onBackToLanding && (
            <button 
              onClick={onBackToLanding}
              className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors"
              aria-label="Back to landing page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          <h2 className="text-2xl font-bold text-center flex-1 text-white">
            {isLogin ? 'Login to EasyHabits' : 'Join EasyHabits'}
          </h2>
          <div className="w-5"></div> {/* Spacer for balance */}
        </div>
        
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
              className="block w-full rounded-md border border-gray-600 bg-gray-700 py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="your@email.com"
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
              className="block w-full rounded-md border border-gray-600 bg-gray-700 py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-green-400 hover:text-green-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 rounded-md px-2 py-1"
          >
            {isLogin ? 'Need an account? Create one now' : 'Already have an account? Login'}
          </button>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-700 text-center">
          <p className="text-sm text-gray-400">
            {isLogin ? 'Welcome back to your habit tracking journey' : 'Start building better habits today'}
          </p>
        </div>
      </div>
    </div>
  );
}
