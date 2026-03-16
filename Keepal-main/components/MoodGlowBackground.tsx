
import React from 'react';
import { MOOD_THEMES } from '../constants';

interface MoodGlowBackgroundProps {
  mood: string;
}

const MoodGlowBackground: React.FC<MoodGlowBackgroundProps> = ({ mood }) => {
  const currentTheme = MOOD_THEMES[mood] || MOOD_THEMES['neutral'];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Background Gradient Layers for Smooth Cross-fade */}
      {Object.entries(MOOD_THEMES).map(([key, theme]) => (
        <div
          key={key}
          className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} transition-opacity duration-1000 ease-in-out will-change-[opacity]`}
          style={{ opacity: mood === key ? 1 : 0 }}
        />
      ))}

      {/* Orbs - Utilizing background-color for smooth transitions */}
      {/* Primary Orb */}
      <div
        className="absolute w-[40rem] h-[40rem] rounded-full blur-[128px] opacity-30 animate-pulse"
        style={{
          backgroundColor: currentTheme.glowPrimary,
          top: '-10%',
          left: '-10%',
          transition: 'background-color 1s ease-in-out',
        }}
      />
      {/* Secondary Orb */}
      <div
        className="absolute w-[30rem] h-[30rem] rounded-full blur-[96px] opacity-25 animate-pulse"
        style={{
          backgroundColor: currentTheme.glowSecondary,
          bottom: '10%',
          right: '-5%',
          animationDelay: '1.2s',
          transition: 'background-color 1s ease-in-out',
        }}
      />
      {/* Tertiary Orb */}
      <div
        className="absolute w-[20rem] h-[20rem] rounded-full blur-[64px] opacity-15 animate-pulse"
        style={{
          backgroundColor: currentTheme.glowPrimary,
          top: '50%',
          left: '40%',
          animationDelay: '2.4s',
          transition: 'background-color 1s ease-in-out',
        }}
      />
    </div>
  );
};

export default MoodGlowBackground;
