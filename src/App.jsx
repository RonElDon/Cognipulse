import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { ThemeProvider } from '@/lib/ThemeContext';
import { LanguageProvider } from '@/lib/LanguageContext';
// Add page imports here
import AppLayout from './components/layout/AppLayout.jsx';
import OnboardingGate from './components/onboarding/OnboardingGate';
import Home from './pages/Home';
import Train from './pages/Train';
import Exercise from './pages/Exercise';
import Progress from './pages/Progress';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import History from './pages/History';
import NeuroDemo from './pages/NeuroDemo';
import Duel from './pages/Duel';
import BaselineAssessment from './pages/BaselineAssessment';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="font-black text-purple-600 text-lg">BrainBoost</div>
          <div className="text-slate-500 text-sm">Loading your brain...</div>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/train" element={<Train />} />
        <Route path="/exercise/:id" element={<Exercise />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/history" element={<History />} />
        <Route path="/neuro-demo" element={<NeuroDemo />} />
        <Route path="/duel" element={<Duel />} />
        <Route path="/baseline" element={<BaselineAssessment />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <QueryClientProvider client={queryClientInstance}>
            <Router>
              <OnboardingGate>
                <AuthenticatedApp />
              </OnboardingGate>
            </Router>
            <Toaster />
          </QueryClientProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App