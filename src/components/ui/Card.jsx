import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hoverEffect = false, ...props }) => {
    const hoverProps = hoverEffect ? {
        whileHover: { y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" },
        transition: { type: "spring", stiffness: 300 }
    } : {};

    return (
        <motion.div
            className={`glass-card p-6 ${className}`}
            {...hoverProps}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default Card;
