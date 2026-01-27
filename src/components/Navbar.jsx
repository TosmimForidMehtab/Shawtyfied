import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link as LinkIcon,
  Home,
  BarChart3,
  PlusCircle,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const navItems = [
    { path: '/', label: 'Overview', icon: <Home size={18} /> },
    { path: '/my-urls', label: 'My URLs', icon: <LinkIcon size={18} /> },
    { path: '/shorten', label: 'Shorten', icon: <PlusCircle size={18} /> },
    { path: '/analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-4 z-50 mx-4 mb-8"
    >
      <div className="glass rounded-2xl px-4 md:px-6 py-3 max-w-7xl mx-auto flex justify-between items-center transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10">
        <Link to="/" className="flex items-center space-x-3 group">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.6, ease: "backOut" }}
            className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/30"
          >
            <LinkIcon size={22} />
          </motion.div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent group-hover:to-pink-600 transition-all">
            Shawtyfied
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {isAuthenticated && navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                relative px-4 py-2 rounded-xl flex items-center space-x-2 text-sm font-semibold transition-all duration-200
                ${isActive(item.path)
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-slate-500 hover:text-indigo-600 hover:bg-white/50'}
              `}
            >
              {item.icon}
              <span>{item.label}</span>
              {isActive(item.path) && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"
                />
              )}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut size={18} className="mr-2" />
              Logout
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-xl hover:bg-indigo-50 text-slate-600 transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 p-2"
          >
            <div className="glass rounded-2xl p-4 shadow-xl border border-white/40">
              <div className="space-y-1">
                {isAuthenticated ? (
                  <>
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all
                          ${isActive(item.path)
                            ? 'bg-indigo-50 text-indigo-600 font-semibold'
                            : 'text-slate-600 hover:bg-white/50'
                          }
                        `}
                      >
                        {item.icon}
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    ))}
                    <div className="pt-4 mt-2 border-t border-indigo-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium"
                      >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2 p-2">
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">Log In</Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsOpen(false)}>
                      <Button variant="primary" className="w-full">Get Started</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;