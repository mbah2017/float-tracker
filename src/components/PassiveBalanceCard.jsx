import React from 'react';
import { Lock, Unlock, AlertTriangle } from 'lucide-react';
import { Card, Button, Badge, Input } from './common';

export const PassiveBalanceCard = ({
  currentLiquidity,
  updateLiquidity,
  isMaster,
  isPassiveUnlockOverride,
  togglePassiveUnlockOverride
}) => {
  const isPassiveLocked = (currentLiquidity?.passiveBalanceLastUpdated &&
    (new Date() - new Date(currentLiquidity.passiveBalanceLastUpdated)) < (30 * 24 * 60 * 60 * 1000)) &&
    !isPassiveUnlockOverride;

  return (
    <Card className="p-6 shadow-sm border-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Lock className="w-5 h-5 text-slate-400" /> Passive Balance
          </h3>
          <p className="text-xs text-slate-500">Fixed assets and long-term reserves</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isPassiveLocked ? (
            <Badge color="slate"><Lock className="w-3 h-3 mr-1" /> Locked</Badge>
          ) : (
            <Badge color="green"><Unlock className="w-3 h-3 mr-1" /> Open</Badge>
          )}
          {isMaster && (
            <Button
              variant="outline"
              onClick={togglePassiveUnlockOverride}
              className="text-[10px] py-1 px-2 h-7"
            >
              {currentLiquidity?.isPassiveUnlockOverride ? 'Enable Lock' : 'Admin Unlock'}
            </Button>
          )}
        </div>
      </div>
      
      <div className="relative">
        <Input
          label="Total Fixed Assets Value"
          type="number"
          value={currentLiquidity?.passiveBalance || ''}
          onChange={e => updateLiquidity({ passiveBalance: e.target.value })}
          disabled={isPassiveLocked}
          placeholder="0.00"
          icon={Lock}
        />
        {isPassiveLocked && (
          <div className="mt-2 text-[10px] text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-100 flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>This field is locked for 30 days to ensure asset stability. Last updated: {currentLiquidity?.passiveBalanceLastUpdated ? new Date(currentLiquidity.passiveBalanceLastUpdated).toLocaleDateString() : 'N/A'}</span>
          </div>
        )}
      </div>
    </Card>
  );
};
