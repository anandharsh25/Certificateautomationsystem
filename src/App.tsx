import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { Dashboard } from './components/Dashboard';
import { EventDetail } from './components/EventDetail';
import { CertificateGenerator } from './components/CertificateGenerator';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'login' | 'signup' | 'dashboard'>('login');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [generatingCerts, setGeneratingCerts] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session) {
        setUser(data.session.user);
        setView('dashboard');
      }
    } catch (err) {
      console.error('Session check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data?.user) {
        setUser(data.user);
        setView('dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const handleSignup = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-81a513d4/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ name, email, password }),
        }
      );

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Signup failed');
      }

      // Auto login after signup
      await handleLogin(email, password);
    } catch (err: any) {
      console.error('Signup error:', err);
      throw err;
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setView('login');
    setSelectedEvent(null);
  };

  const handleEventSelect = (event: any) => {
    setSelectedEvent(event);
  };

  const handleBackToDashboard = () => {
    setSelectedEvent(null);
  };

  const handleGenerateCertificates = (eventId: string) => {
    setGeneratingCerts(true);
    setSelectedEvent({ id: eventId });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-100">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        {view === 'login' ? (
          <Login
            onLogin={handleLogin}
            onSwitchToSignup={() => setView('signup')}
          />
        ) : (
          <Signup
            onSignup={handleSignup}
            onSwitchToLogin={() => setView('login')}
          />
        )}
      </div>
    );
  }

  if (selectedEvent && generatingCerts) {
    return (
      <CertificateGenerator
        eventId={selectedEvent.id}
        user={user}
        onBack={() => {
          setGeneratingCerts(false);
          setSelectedEvent(null);
        }}
      />
    );
  }

  if (selectedEvent) {
    return (
      <EventDetail
        event={selectedEvent}
        user={user}
        onBack={handleBackToDashboard}
      />
    );
  }

  return (
    <Dashboard
      user={user}
      onLogout={handleLogout}
      onEventSelect={handleEventSelect}
      onGenerateCertificates={handleGenerateCertificates}
    />
  );
}