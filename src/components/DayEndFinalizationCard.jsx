import React, { useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, Button, Input } from './common';

export const DayEndFinalizationCard = ({
  currentLiquidity,
  formatCurrency,
  closeDay,
  overallDiscrepancy
}) => {
  const [discrepancyNotesInput, setDiscrepancyNotesInput] = useState(currentLiquidity.reconciliationNotes || '');

  return (
    <Card className="p-6 border-amber-100 bg-amber-50/50 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-600" /> Day-End Finalization
      </h3>
      
      <div className="space-y-5">
        <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-amber-100 shadow-sm">
          <span className="text-slate-600 font-bold text-sm">Overall Discrepancy</span>
          <span className={`text-xl font-black ${Math.abs(overallDiscrepancy) > 0.01 ? 'text-red-600' : 'text-emerald-600'}`}>
            {formatCurrency(overallDiscrepancy)}
          </span>
        </div>

        {Math.abs(overallDiscrepancy) > 0.01 && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <Input
              label="Explanation for Discrepancy"
              value={discrepancyNotesInput}
              onChange={e => setDiscrepancyNotesInput(e.target.value)}
              placeholder="Why is there a shortage or surplus?"
              className="mb-0 shadow-sm"
            />
          </div>
        )}

        <Button
          onClick={() => closeDay(discrepancyNotesInput)}
          disabled={Math.abs(overallDiscrepancy) > 0.01 && !discrepancyNotesInput}
          className="w-full mt-2 py-4 text-base font-black shadow-lg shadow-blue-200"
          variant="primary"
          icon={RefreshCw}
        >
          {currentLiquidity.closingBalance !== null ? `Re-Close Day (${formatCurrency(currentLiquidity.closingBalance)})` : 'Finalize & Close Day'}
        </Button>
        
        {currentLiquidity.closingBalance !== null && (
          <p className="text-center text-[10px] text-slate-400 italic">Day finalized. Re-closing will carry over the latest balance to tomorrow.</p>
        )}
      </div>
    </Card>
  );
};
