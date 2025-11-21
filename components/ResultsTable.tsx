import React from 'react';
import { Download, AlertTriangle, CheckCircle2, PieChart } from 'lucide-react';
import { CalculationResult } from '../types';

interface ResultsTableProps {
  result: CalculationResult | null;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ result }) => {
  if (!result) return null;

  if (result.error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mt-6 animate-in fade-in zoom-in duration-300">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700 font-medium">
              Calculation Error: {result.error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const exportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result.subnets, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "vlsm_calculation.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="text-sm font-medium text-slate-500">Total Subnets</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">{result.subnets.length}</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
               <PieChart size={20} />
            </div>
            <h3 className="text-sm font-medium text-slate-500">Utilization</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-slate-800">{result.utilizationPct.toFixed(1)}%</p>
            <span className="text-xs text-slate-500">of primary block</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div 
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(result.utilizationPct, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
               <Download size={20} />
            </div>
            <h3 className="text-sm font-medium text-slate-500">Export Data</h3>
          </div>
          <button 
            onClick={exportJson}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
          >
            Download JSON Result
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Subnet Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Needs</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Allocated</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Network Address</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Range</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Broadcast</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mask</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Wasted</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {result.subnets.map((subnet, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{subnet.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-500">{subnet.neededHosts} Hosts</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900 font-mono">/{subnet.cidr}</div>
                    <div className="text-xs text-slate-400">{subnet.totalAddresses} total IPs</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-brand-600 font-mono font-medium">{subnet.networkAddress}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600 font-mono text-xs">
                      {subnet.firstUsable} - <br/>
                      {subnet.lastUsable}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-500 font-mono text-xs">{subnet.broadcastAddress}</div>
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs text-slate-500 font-mono">
                      M: {subnet.subnetMask}<br/>
                      W: {subnet.wildcardMask}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      subnet.wastedAddresses > 20 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {subnet.wastedAddresses}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};