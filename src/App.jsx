import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyUrls from './pages/MyUrls';
import ShortenUrl from './pages/ShortenUrl';
import Analytics from './pages/Analytics';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';
import Redirect from './pages/Redirect';
import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col relative overflow-hidden">
          {/* Animated background elements */}
          <div className="fixed -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-purple-200/30 blur-[100px] animate-float" />
          <div className="fixed -bottom-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-indigo-200/30 blur-[100px] animate-pulse-slow" />

          <Routes>
            <Route element={<Layout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/my-urls" element={<PrivateRoute><MyUrls /></PrivateRoute>} />
              <Route path="/shorten" element={<PrivateRoute><ShortenUrl /></PrivateRoute>} />
              <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
            </Route>
            <Route path="/:url" element={<Redirect />} />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              className: '!bg-white/80 !backdrop-blur-md !border !border-white/20 !text-slate-800 !shadow-xl !rounded-xl',
              success: {
                iconTheme: {
                  primary: '#4f46e5',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

function Layout() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8 relative z-10 flex-grow">
        <Outlet />
      </main>
      {isAuthenticated && <ChatWidget />}
    </>
  );
}

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default App;
