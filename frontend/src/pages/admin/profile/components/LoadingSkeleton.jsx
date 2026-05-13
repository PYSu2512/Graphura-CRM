import React from "react";

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
    <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    <div className="h-8 w-56 animate-pulse rounded-xl bg-slate-200" />
    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-28 animate-pulse rounded-3xl bg-slate-200" />
      ))}
    </div>
    <div className="mt-6 space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-72 animate-pulse rounded-3xl bg-slate-200" />
      ))}
    </div>
  </div>
);

export default LoadingSkeleton;
