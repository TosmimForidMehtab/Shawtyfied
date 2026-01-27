import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/30 shadow-lg border-transparent',
  secondary: 'bg-pink-500 text-white hover:bg-pink-600 shadow-pink-500/30 shadow-lg border-transparent',
  outline: 'bg-transparent border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  danger: 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/30 shadow-lg border-transparent',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5',
  lg: 'px-8 py-3 text-lg',
};

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  className = '', 
  disabled,
  ...props 
}) => {
  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={`
        relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
        ${variants[variant]} 
        ${sizes[size]} 
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      {children}
    </motion.button>
  );
};

export default Button;
