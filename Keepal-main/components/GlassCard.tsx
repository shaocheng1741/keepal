import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;