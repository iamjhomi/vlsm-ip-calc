import React, { useState } from 'react';
import { Header } from './components/Header';
import { RequirementsForm } from './components/RequirementsForm';
import { ResultsTable } from './components/ResultsTable';
import { isValidCidr, calculateVLSM } from './services/ipUtils';
import { SubnetRequirement, CalculationResult } from './types';

function App() {
  const [primaryCidr, setPrimaryCidr] = useState('192.168.0.0/24');
  const [requirements, setRequirements] = useState<SubnetRequirement[]>([]);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const handleCalculate = () => {
    if (!primaryCidr) {
      setResult({ subnets: [], error: "Please enter a primary network.", totalNeeded: 0, totalAllocated: 0, utilizationPct: 0 });
      return;
    }
    
    if (!isValidCidr(primaryCidr)) {
      setResult({ subnets: [], error: "Invalid Primary Network CIDR format.", totalNeeded: 0, totalAllocated: 0, utilizationPct: 0 });
      return;
    }

    if (requirements.length === 0) {
      setResult({ subnets: [], error: "Please add at least one subnet requirement.", totalNeeded: 0, totalAllocated: 0, utilizationPct: 0 });
      return;
    }

    const calcResult = calculateVLSM(primaryCidr, requirements);
    setResult(calcResult);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">
      <Header />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input Controls */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24">
              <RequirementsForm 
                primaryCidr={primaryCidr}
                setPrimaryCidr={setPrimaryCidr}
                requirements={requirements}
                setRequirements={setRequirements}
                onCalculate={handleCalculate}
              />
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8 xl:col-span-9">
            {result ? (
              <ResultsTable result={result} />
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-white/50 text-slate-400 p-8 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-600">Ready to Calculate</h3>
                <p className="max-w-sm mt-2">
                  Enter your primary network CIDR and list your subnet requirements on the left to generate an optimized VLSM allocation table.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} VLSM Architect. Developed by Homethagan.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;