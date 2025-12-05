import { useState } from 'react';
import { LandingPage } from '../src/components/LandingPage';
import { StudentDashboard } from '../src/components/StudentDashboard';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'student' | 'professor' | null>(null);
  const [selectedInstitute, setSelectedInstitute] = useState<string>('');

  const handleLogin = (role: 'student' | 'professor', institute: string) => {
    setUserRole(role);
    setSelectedInstitute(institute);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setSelectedInstitute('');
  };

  if (!isLoggedIn) {
    return <LandingPage onLogin={handleLogin} />;
  }

  // For now, only student dashboard is implemented
  // Professor dashboard can be added similarly
  if (userRole === 'student') {
    return <StudentDashboard onLogout={handleLogout} />;
  }

  // Placeholder for professor view
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl mb-4">Professor Dashboard</h1>
        <p className="text-gray-600 mb-6">Coming soon...</p>
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
