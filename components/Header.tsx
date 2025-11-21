import React from 'react';
import { Network } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center space-x-3">
          <div className="bg-brand-600 p-2 rounded-lg text-white shadow-sm">
            <Network size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">VLSM Architect</h1>
            <p className="text-xs text-slate-500 font-medium">IPv4 Subnet Calculator</p>
          </div>
        </div>
      </div>
    </header>
  );
};