

import { useState, useEffect } from 'react';
// FIX: Use namespace import for react-router-dom to fix module resolution errors.
import * as ReactRouterDom from "react-router-dom";
import HomePage from './components/HomePage';
import AdminPage from './components/AdminPage';
import AppDetailPage from './components/AppDetailPage';
import ClientAuthPage from './components/ClientAuthPage';
import ClientDashboardPage from './components/ClientDashboardPage';
import AboutPage from './components/AboutPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useWebsiteDetails } from './hooks/useWebsiteDetails';
import LoadingSpinner from './components/LoadingSpinner';

const IntroAnimation: React.FC<{ onFinished: () => void }> = ({ onFinished }) => {
  const [stage, setStage] = useState('blur-in');
  const { details, loading } = useWebsiteDetails();

  useEffect(() => {
    const timer1 = setTimeout(() => setStage('text-in'), 500);
    const timer2 = setTimeout(() => setStage('fade-out'), 2500);
    const timer3 = setTimeout(onFinished, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onFinished]);
  
  if (loading) return null; // Wait for details to load

  const showCustomLogo = details && details.introLogoUrl;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-1000 ${
        stage === 'fade-out' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div
        className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out ${
          stage === 'blur-in' ? 'blur-md' : 'blur-none'
        }`}
        style={{ backgroundImage: `url('${details?.introImageUrl || "https://picsum.photos/1920/1080?grayscale&blur=2"}')` }}
      ></div>
      <div
        className={`z-10 transition-all duration-1000 ease-in-out ${
          stage === 'text-in' || stage === 'fade-out' ? 'opacity-100 scale-100' : 'opacity-0 scale-125'
        }`}
      >
        {showCustomLogo ? (
            <img src={details.introLogoUrl} alt="Company Logo" className="max-w-xs md:max-w-md max-h-48 object-contain"/>
        ) : (
             <h1 className="text-5xl md:text-7xl font-extrabold text-white">
                <span className="text-orange-500 text-glow">JSTYP</span>.me
            </h1>
        )}
      </div>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { currentUser, loading } = useAuth();
    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--background-color)] flex items-center justify-center">
                <LoadingSpinner size={16} />
            </div>
        );
    }
    return currentUser ? children : <ReactRouterDom.Navigate to="/auth" />;
};

const ThemeApplicator: React.FC<{children: React.ReactNode}> = ({children}) => {
    const { details, loading } = useWebsiteDetails();
    
    useEffect(() => {
        if (!loading && details) {
            const root = document.documentElement;
            root.style.setProperty('--glow-color', details.themeColor);
            root.style.setProperty('--background-color', details.backgroundColor);
            root.style.setProperty('--text-color', details.textColor);
            root.style.setProperty('--card-color', details.cardColor);
            root.style.setProperty('--border-color', details.borderColor);
            root.style.setProperty('--font-family', details.fontFamily);
        }
    }, [details, loading]);
    
    return <>{children}</>;
}


const AppRoutes: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);

  if (showIntro) {
    return <IntroAnimation onFinished={() => setShowIntro(false)} />;
  }

  return (
    <ReactRouterDom.HashRouter>
      <ThemeApplicator>
          <ReactRouterDom.Routes>
            <ReactRouterDom.Route path="/" element={<HomePage />} />
            <ReactRouterDom.Route path="/about" element={<AboutPage />} />
            <ReactRouterDom.Route path="/app/:id" element={<AppDetailPage />} />
            <ReactRouterDom.Route path="/admin" element={<AdminPage />} />
            <ReactRouterDom.Route path="/auth" element={<ClientAuthPage />} />
            <ReactRouterDom.Route path="/dashboard" element={<ProtectedRoute><ClientDashboardPage /></ProtectedRoute>} />
          </ReactRouterDom.Routes>
      </ThemeApplicator>
    </ReactRouterDom.HashRouter>
  );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;