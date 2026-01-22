'use client';

import { useState } from 'react';
import { LandingPage } from '../src/components/LandingPage';
import { StudentDashboard } from '../src/components/StudentDashboard';
import { ProfessorDashboard } from '../src/components/ProfessorDashboard';

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

  if (userRole === 'student') {
    return <StudentDashboard onLogout={handleLogout} />;
  }

  if (userRole === 'professor') {
    return <ProfessorDashboard onLogout={handleLogout} />;
  }
}