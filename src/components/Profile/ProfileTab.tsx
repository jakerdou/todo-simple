import { useAuth } from '../../AuthContext';
// Import the app version from our version file
import { APP_VERSION } from '../../version';

export default function ProfileTab() {
  const { currentUser, logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }

  return (
    <div className="p-4">      
      <div className="bg-gray-100 p-4 rounded-lg dark:bg-gray-800">
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">Email</p>
          <p className="font-medium">{currentUser?.email}</p>
        </div>
        
        <div className="mt-6">
          <button 
            onClick={handleLogout}
            className="w-full py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>      </div>
      
      <div className="mt-6">
        <p className="text-center text-gray-500 text-sm">
          Version {APP_VERSION}
        </p>
      </div>
    </div>
  );
}
