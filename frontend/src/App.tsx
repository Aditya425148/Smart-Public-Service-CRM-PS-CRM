import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { SubmitPage } from './pages/SubmitPage';
import { BrowsePage } from './pages/BrowsePage';
import { ComplaintDetail } from './pages/DetailPage';
import { LandingPage } from './pages/LandingPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthComponent } from './components/Auth';
import './App.css';
import { AlertCircle, Loader } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-gray-900 hover:text-blue-600">
            <AlertCircle className="w-6 h-6 text-blue-600" />
            PS-CRM
          </Link>
          <div className="flex gap-4 text-sm">
            <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors">Home</Link>
            <Link to="/submit" className="text-gray-600 hover:text-gray-900 transition-colors">Report</Link>
            <Link to="/browse" className="text-gray-600 hover:text-gray-900 transition-colors">Browse</Link>
          </div>
        </div>
      </nav>

      {/* Auth Section */}
      <div className="bg-gray-100 border-b border-gray-200 py-4">
        <div className="max-w-4xl mx-auto px-4">
          <AuthComponent />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/complaint/:id" element={<ComplaintDetail />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-6 text-center text-sm text-gray-600">
        <p>Smart Public Service CRM v0.2.0 - Making civic services responsive</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
