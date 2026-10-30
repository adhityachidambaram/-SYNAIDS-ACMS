
import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { RoleSwitcherBanner } from './components/common/RoleSwitcherBanner';
import { ToastContainer } from './components/common/Toast';

// Public and Login Pages
import { PublicLanding } from './pages/PublicLanding';
import { LoginPage } from './pages/LoginPage';

// Application Pages
import { Dashboard } from './pages/Dashboard';
import { ApplicationsList } from './pages/ApplicationsList';
import { NewApplicationWizard } from './pages/NewApplicationWizard';
import { ScrutinyWorkspace } from './pages/ScrutinyWorkspace';
import { DeficienciesPage } from './pages/DeficienciesPage';
import { EvcManagement } from './pages/EvcManagement';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { CompliancePage } from './pages/CompliancePage';
import { RoegGraphPage } from './pages/RoegGraphPage';
import { IncrementalRescrutinyPage } from './pages/IncrementalRescrutinyPage';
import { RegulatoryRulesPage } from './pages/RegulatoryRulesPage';
import { InstitutionsDirectory } from './pages/InstitutionsDirectory';
import { ReportsPage } from './pages/ReportsPage';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { UserManagementPage } from './pages/UserManagementPage';

import { UserRole } from './types';

const MainLayout: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<string>(
    '/app/dashboard'
  );

  // Remember the demo login for the current browser session.
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    () => sessionStorage.getItem('acms_logged_in') === 'true'
  );

  const { setRole } = useApp();

  // Navigate between application pages.
  const handleNavigate = (route: string) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle entry from the public portal.
  const handleEnterFromPublic = (role?: UserRole) => {
    if (role) {
      setRole(role);
    }

    setCurrentRoute('/app/dashboard');
  };

  // Handle successful demo login.
  const handleLogin = () => {
    sessionStorage.setItem('acms_logged_in', 'true');
    setIsLoggedIn(true);
    setCurrentRoute('/app/dashboard');
  };

  // Display the login page before opening the internal ACMS portal.
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Public portal landing page.
  if (currentRoute === '/public') {
    return (
      <div className="min-h-screen bg-[#F4F7FC]">
        <PublicLanding onEnterApp={handleEnterFromPublic} />
        <ToastContainer />
      </div>
    );
  }

  // Main ACMS application.
  return (
    <div className="min-h-screen bg-[#F4F7FC] flex flex-col font-sans">

      {/* Evaluation role switcher and demo tour */}
      <RoleSwitcherBanner onNavigate={handleNavigate} />

      {/* Application header */}
      <Header onNavigate={handleNavigate} />

      {/* Main workspace */}
      <div className="flex-1 flex overflow-hidden">

        {/* Persistent sidebar */}
        <Sidebar
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
        />

        {/* Dynamic page content */}
        <main className="flex-1 overflow-y-auto min-w-0 bg-[#F4F7FC]">

          {currentRoute === '/app/dashboard' && (
            <Dashboard onNavigate={handleNavigate} />
          )}

          {currentRoute === '/app/applications' && (
            <ApplicationsList onNavigate={handleNavigate} />
          )}

          {currentRoute === '/app/new-application' && (
            <NewApplicationWizard onNavigate={handleNavigate} />
          )}

          {currentRoute === '/app/documents-ocr' && (
            <NewApplicationWizard onNavigate={handleNavigate} />
          )}

          {currentRoute === '/app/scrutiny' && (
            <ScrutinyWorkspace onNavigate={handleNavigate} />
          )}

          {currentRoute === '/app/deficiencies' && (
            <DeficienciesPage onNavigate={handleNavigate} />
          )}

          {currentRoute === '/app/evc' && (
            <EvcManagement onNavigate={handleNavigate} />
          )}

          {currentRoute === '/app/approvals' && (
            <ApprovalsPage onNavigate={handleNavigate} />
          )}

          {currentRoute === '/app/compliance' && (
            <CompliancePage onNavigate={handleNavigate} />
          )}

          {currentRoute === '/app/roeg-graph' && (
            <RoegGraphPage onNavigate={handleNavigate} />
          )}

          {currentRoute === '/app/rescrutiny' && (
            <IncrementalRescrutinyPage
              onNavigate={handleNavigate}
            />
          )}

          {currentRoute === '/app/regulatory-rules' && (
            <RegulatoryRulesPage onNavigate={handleNavigate} />
          )}

          {currentRoute === '/app/institutions' && (
            <InstitutionsDirectory onNavigate={handleNavigate} />
          )}

          {currentRoute === '/app/reports' && (
            <ReportsPage onNavigate={handleNavigate} />
          )}

          {currentRoute === '/app/audit-trail' && (
            <AuditTrailPage onNavigate={handleNavigate} />
          )}

          {currentRoute === '/app/users' && (
            <UserManagementPage onNavigate={handleNavigate} />
          )}

        </main>
      </div>

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
};

// Application entry point.
export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
