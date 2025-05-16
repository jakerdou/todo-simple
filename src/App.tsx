import './App.css'
import { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext'
import Login from './components/Login/Login'
import TodoTab from './components/Todo/TodoTab';
import MonthlyTab from './components/Monthly/MonthlyTab';
import ProfileTab from './components/Profile/ProfileTab';

function DashboardContent() {
  const [activeTab, setActiveTab] = useState('todo');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Function to switch to Todo tab with a specific date
  const switchToTodoTab = (date: Date) => {
    setSelectedDate(date);
    setActiveTab('todo');
  };

  return (
    <div className="flex flex-col h-screen">      
      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-900">
        {activeTab === 'todo' && <TodoTab selectedDate={selectedDate} setSelectedDate={setSelectedDate} />}
        {activeTab === 'monthly' && <MonthlyTab selectedDate={selectedDate} setSelectedDate={setSelectedDate} switchToTodoTab={switchToTodoTab} />}
        {activeTab === 'profile' && <ProfileTab />}
      </div>
      
      {/* Bottom Tabs */}
      <div className="flex border-t" style={{ boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)' }}>
        <button
          className={`flex-1 py-4 text-center ${activeTab === 'todo' ? 'text-blue-500 border-t-2 border-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('todo')}
        >
          Todo
        </button>
        <button
          className={`flex-1 py-4 text-center ${activeTab === 'monthly' ? 'text-blue-500 border-t-2 border-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('monthly')}
        >
          Monthly
        </button>
        <button
          className={`flex-1 py-4 text-center ${activeTab === 'profile' ? 'text-blue-500 border-t-2 border-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-blue-400 text-xl font-medium">Loading...</div>
      </div>
    );
  }
  
  return currentUser ? <DashboardContent /> : <Login />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
