import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

const Input = forwardRef(({
    label,
    error,
    icon: Icon,
    className = '',
    containerClassName = '',
    ...props
}, ref) => {
    return (
        <div className={`w-full ${containerClassName}`}>
            {label && (
                <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Icon className="h-5 w-5" />
                    </div>
                )}
                <input
                    ref={ref}
                    className={`
            w-full rounded-xl glass-input placeholder:text-slate-400 text-slate-900
            ${Icon ? 'pl-10' : 'pl-4'}
            pr-4 py-2.5
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${className}
          `}
                    {...props}
                />
            </div>
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-500 ml-1"
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
