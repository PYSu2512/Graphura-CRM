import React from 'react';

export const StatCard = ({ title, value, icon, accentColor = "#355872" }) => {
  return (
    <div 
      className="rounded-2xl p-4 flex items-center gap-3 shadow-md transition-all duration-300 hover:-translate-y-1"
      style={{ backgroundColor: accentColor, border: `1px solid ${accentColor}33` }}
    >
      {/* Icon Container */}
      <div 
        className="flex-shrink-0 w-[40px] h-[40px] rounded-[14px] flex items-center justify-center bg-white/20 text-white shadow-sm"
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center min-w-0 flex-1 text-white">
        <h3 className="text-[11px] font-bold uppercase tracking-wider leading-tight mb-1 whitespace-normal break-words opacity-90">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[24px] font-extrabold leading-none tracking-tight">
            {value}
          </span>
        </div>
      </div>
    </div>
  );
};
