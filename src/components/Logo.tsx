import React from 'react';
import { Link } from 'react-router-dom';

export const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg'; withText?: boolean }> = ({ size = 'md', withText = true }) => {
  const s = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-14 w-14' : 'h-10 w-10';
  return (
    <Link to="/" className="flex items-center gap-3 group">
      <div className={`${s} relative rounded-xl bg-gradient-to-br from-blue-700 to-orange-500 flex items-center justify-center shadow-lg shadow-blue-900/40 group-hover:shadow-orange-500/40 transition-shadow`}>
        <img
          src="https://d64gsuwffb70l.cloudfront.net/6a01d99b871ec2be0303a5e7_1778506402792_6b42971f.jfif"
          alt="TutorConnect"
          className="h-full w-full rounded-xl object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg pointer-events-none">TC</span>
      </div>
      {withText && (
        <div className="leading-tight">
          <div className="font-bold text-base sm:text-lg bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
            TutorConnect
          </div>
          <div className="text-[10px] text-slate-400 hidden sm:block">Tutoring for everyone</div>
        </div>
      )}
    </Link>
  );
};
