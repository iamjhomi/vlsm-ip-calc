import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { SubnetRequirement } from '../types';

interface RequirementsFormProps {
  primaryCidr: string;
  setPrimaryCidr: (val: string) => void;
  requirements: SubnetRequirement[];
  setRequirements: React.Dispatch<React.SetStateAction<SubnetRequirement[]>>;
  onCalculate: () => void;
}

export const RequirementsForm: React.FC<RequirementsFormProps> = ({
  primaryCidr,
  setPrimaryCidr,
  requirements,
  setRequirements,
  onCalculate,
}) => {
  
  const addRequirement = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setRequirements([
      ...requirements,
      { id: newId, name: `Subnet ${String.fromCharCode(65 + requirements.length)}`, hostCount: 0 },
    ]);
  };

  const updateRequirement = (id: string, field: keyof SubnetRequirement, value: string | number) => {
    setRequirements(
      requirements.map((req) =>
        req.id === id ? { ...req, [field]: value } : req
      )
    );
  };

  const removeRequirement = (id: string) => {
    setRequirements(requirements.filter((req) => req.id !== id));
  };

  // Auto-add one subnet if empty
  useEffect(() => {
    if (requirements.length === 0) {
      addRequirement();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      {/* Primary Network Input */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Primary Network (CIDR)
        </label>
        <input
          type="text"
          value={primaryCidr}
          onChange={(e) => setPrimaryCidr(e.target.value)}
          placeholder="e.g. 192.168.1.0/24"
          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all outline-none font-mono text-slate-700"
        />
        <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
          <AlertCircle size={12} /> 
          The base block from which subnets will be carved.
        </p>
      </div>

      {/* Requirements List */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Subnet Requirements</h2>
          <button
            onClick={addRequirement}
            className="text-sm flex items-center gap-1.5 text-brand-600 hover:text-brand-700 font-medium bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-md transition-colors"
          >
            <Plus size={16} />
            Add Subnet
          </button>
        </div>

        <div className="space-y-3">
          {requirements.map((req, index) => (
            <div key={req.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex-1 w-full sm:w-auto">
                <label className="block text-xs text-slate-400 mb-1 sm:hidden">Name</label>
                <input
                  type="text"
                  value={req.name}
                  onChange={(e) => updateRequirement(req.id, 'name', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm"
                  placeholder="Subnet Name"
                />
              </div>
              <div className="w-full sm:w-40">
                <label className="block text-xs text-slate-400 mb-1 sm:hidden">Required Hosts</label>
                <input
                  type="number"
                  min="1"
                  value={req.hostCount === 0 ? '' : req.hostCount}
                  onChange={(e) => updateRequirement(req.id, 'hostCount', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none text-sm font-mono"
                  placeholder="Hosts"
                />
              </div>
              <button
                onClick={() => removeRequirement(req.id)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors self-end sm:self-center"
                title="Remove"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100">
          <button
            onClick={onCalculate}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex justify-center items-center gap-2"
          >
            Calculate Allocation
          </button>
        </div>
      </div>
    </div>
  );
};