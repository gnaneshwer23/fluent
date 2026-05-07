/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from './lib/firebaseInit';
import { handleFirestoreError, OperationType } from './lib/errorHandling';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

// Components
import { LandingPage } from './components/LandingPage';
import { OnboardingFlow } from './components/OnboardingFlow';
import { FacultyHub } from './components/FacultyHub';
import { StudentDashboard } from './components/StudentDashboard';
import { ParentDashboard } from './components/ParentDashboard';
import { AdminCommand } from './components/AdminCommand';

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      if (u) {
        const userRef = doc(db, 'users', u.uid);
        unsubProfile = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setProfile(data);
            if (data.role) {
              // Only redirect if at root or landing
              if (location.pathname === '/' || location.pathname === '/onboarding') {
                navigate(`/${data.role}-dashboard`);
              }
            } else {
              navigate('/onboarding');
            }
          } else {
            navigate('/onboarding');
          }
          setLoading(false);
        }, (error) => {
          if (auth.currentUser) {
            handleFirestoreError(error, OperationType.GET, `users/${u.uid}`);
          }
        });
      } else {
        if (location.pathname !== '/') {
          navigate('/');
        }
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, [navigate]);

  const handleOnboardingComplete = async (nextView: string, onboardingData: any) => {
    if (!user) return;
    setProfile(onboardingData);
    navigate(`/${nextView}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-fluent-navy flex flex-col items-center justify-center p-8 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/10 rounded-full animate-[pulse_8s_infinite]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/10 rounded-full animate-[pulse_6s_infinite]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative z-10 flex flex-col items-center"
        >
          <div className="flex items-center gap-2 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-fluent-gold animate-pulse" />
            <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.4em]">Initialising Environment</span>
          </div>
          
          <div className="text-4xl font-serif font-bold text-white italic tracking-tight mb-4 flex items-center gap-3">
             Synthesis <span className="text-fluent-gold font-normal">✦</span>
          </div>
          
          <div className="w-64 h-[1px] bg-white/10 relative overflow-hidden">
             <motion.div 
               initial={{ x: "-100%" }}
               animate={{ x: "100%" }}
               transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
               className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-fluent-teal to-transparent shadow-[0_0_15px_rgba(27,79,94,0.8)]"
             />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/onboarding" element={<OnboardingFlow onComplete={handleOnboardingComplete} />} />
      <Route path="/teacher-dashboard" element={<FacultyHub profile={profile} onBack={() => auth.signOut()} />} />
      <Route path="/student-dashboard" element={<StudentDashboard profile={profile} onBack={() => auth.signOut()} />} />
      <Route path="/parent-dashboard" element={<ParentDashboard profile={profile} onBack={() => auth.signOut()} />} />
      <Route path="/admin-dashboard" element={<AdminCommand onBack={() => auth.signOut()} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

