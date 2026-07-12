import React from 'react';

export default function Badge({ children }: any) {
  return (
    <span className="px-2 py-1 text-xs bg-slate-200 text-slate-800 rounded-full">
      {children}
    </span>
  );
}