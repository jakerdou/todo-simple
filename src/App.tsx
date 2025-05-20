import './App.css'
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './AuthContext'
import Login from './components/Login/Login'
import TodoTab from './components/Todo/TodoTab';
import MonthlyTab from './components/Monthly/MonthlyTab';
import ProfileTab from './components/Profile/ProfileTab';
import IOSDetector from './components/UI/IOSDetector';
import InstallPrompt from './components/UI/InstallPrompt';
import BasicLandingPage from './components/Landing/BasicLandingPage';
import { DocumentCheckIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline';

function DashboardContent() {
  const [activeTab, setActiveTab] = useState('todo');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  
  // Check if app is running as standalone PWA
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (!isStandalone) {
      const timer = setTimeout(() => {
        setShowInstallBanner(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Function to switch to Todo tab with a specific date
  const switchToTodoTab = (date: Date) => {
    setSelectedDate(date);
    setActiveTab('todo');
  };

  return (
    <IOSDetector>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="bg-gray-800 py-3 px-4 text-center border-b border-gray-700">
          <h1 className="text-xl font-bold text-green-500">EasyHabits</h1>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-gray-900">
          {activeTab === 'todo' && <TodoTab selectedDate={selectedDate} setSelectedDate={setSelectedDate} />}
          {activeTab === 'monthly' && <MonthlyTab selectedDate={selectedDate} setSelectedDate={setSelectedDate} switchToTodoTab={switchToTodoTab} />}
          {activeTab === 'profile' && <ProfileTab />}
        </div>
        
        {/* Installation Prompt */}
        {showInstallBanner && <InstallPrompt />}
        
        {/* Bottom Tabs */}
        <div className="flex border-t" style={{ boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)' }}>
          <button
            className={`flex-1 py-2 text-center flex flex-col items-center ${activeTab === 'todo' ? 'text-green-500 border-t-2 border-green-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('todo')}
          >
            <DocumentCheckIcon className="h-6 w-6 mb-1" />
            <span>Habits</span>
          </button>
          <button
            className={`flex-1 py-2 text-center flex flex-col items-center ${activeTab === 'monthly' ? 'text-green-500 border-t-2 border-green-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('monthly')}
          >
            <CalendarIcon className="h-6 w-6 mb-1" />
            <span>Calendar</span>
          </button>
          <button
            className={`flex-1 py-2 text-center flex flex-col items-center ${activeTab === 'profile' ? 'text-green-500 border-t-2 border-green-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('profile')}
          >
            <UserIcon className="h-6 w-6 mb-1" />
            <span>Profile</span>
          </button>
        </div>
      </div>
    </IOSDetector>
  );
}

function AppContent() {
  const { currentUser, loading } = useAuth();
  const [showLanding, setShowLanding] = useState(true);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-green-500 text-xl font-medium flex flex-col items-center">
          <div className="mb-3 h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
          <div>Loading EasyHabits...</div>
        </div>
      </div>
    );
  }
  
  // Show landing page if user is not logged in and landing is active
  if (!currentUser) {
    return showLanding 
      ? <BasicLandingPage onGetStarted={() => setShowLanding(false)} /> 
      : <Login onBackToLanding={() => setShowLanding(true)} />;
  }
  
  // If user is logged in, show dashboard
  return <DashboardContent />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
