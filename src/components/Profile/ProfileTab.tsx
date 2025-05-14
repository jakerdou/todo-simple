import { useAuth } from '../../AuthContext';

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
      <h2 className="text-xl font-bold mb-4">Profile</h2>
      
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
        </div>
      </div>
    </div>
  );
}
