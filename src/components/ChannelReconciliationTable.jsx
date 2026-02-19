import React from 'react';
import { Scale, Banknote, Building2, Smartphone, Globe } from 'lucide-react';
import { Card, Button, Badge, Input } from './common';
import { useLanguage } from '../context/LanguageContext';

export const ChannelReconciliationTable = ({ 
  currentLiquidity, 
  updateLiquidity, 
  stats, 
  formatCurrency, 
  createAdjustment,
  openingTotal,
  expectedClosingTotal,
  activeBalance,
  overallDiscrepancy
}) => {
  const { t } = useLanguage();
  const CHANNELS = [
    { id: 'cash', label: t('cash_on_hand') || 'Cash on Hand', icon: Banknote },
    { id: 'bank', label: t('bank_account') || 'Bank Account', icon: Building2 },
    { id: 'wave', label: t('wave_wallet') || 'Wave Wallet', icon: Smartphone },
    { id: 'aps', label: t('aps_wallet') || 'APS Wallet', icon: Globe },
    { id: 'orange', label: t('orange_money') || 'Orange Money', icon: Smartphone },
    { id: 'nafa', label: t('nafa_wallet') || 'NAFA Wallet', icon: Globe },
    { id: 'westernUnion', label: t('western_union') || 'Western Union', icon: Globe }
  ];

  const handleActualBalanceChange = (channelId, value) => {
    const parsed = value === '' ? 0 : parseFloat(value);
    updateLiquidity({ 
      actualBalances: { [channelId]: parsed } 
    });
  };

  const handleOpeningBalanceChange = (channelId, value) => {
    const parsed = value === '' ? 0 : parseFloat(value);
    updateLiquidity({ 
      openingBalances: { [channelId]: parsed } 
    });
  };

  return (
    <Card className="p-0 sm:p-6 overflow-hidden">
      <div className="p-6 pb-0 sm:pb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Scale className="w-5 h-5 text-blue-600" /> {t('channel_reconciliation')}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] sm:text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 min-w-[140px]">{t('channel')}</th>
              <th className="px-4 py-3 text-right">{t('opening')}</th>
              <th className="px-4 py-3 text-right whitespace-nowrap">{t('today_plus_minus')}</th>
              <th className="px-4 py-3 text-right">{t('expected')}</th>
              <th className="px-4 py-3 text-right min-w-[120px]">{t('actual')}</th>
              <th className="px-4 py-3 text-right">{t('diff')}</th>
              <th className="px-4 py-3 text-center print:hidden">{t('action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {CHANNELS.map(channel => {
              const opening = currentLiquidity?.openingBalances?.[channel.id] || 0;
              const channelStat = stats?.channelStats?.[channel.id] || { in: 0, out: 0 };
              const netToday = (channelStat.in || 0) - (channelStat.out || 0);
              const expected = opening + netToday;
              // Use currentLiquidity.actualBalances for the actual value
              const actual = currentLiquidity?.actualBalances?.[channel.id];
              // If actual balance is 0 or undefined, pre-fill with expected for easier reconciliation
              const displayActual = (actual === 0 && actual !== undefined) || actual === undefined ? expected : actual;

              const diff = (actual !== undefined ? actual : expected) - expected;
              const Icon = channel.icon;

              return (
                <tr key={channel.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500 shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-slate-700 text-xs sm:text-sm">{channel.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <input
                      type="number"
                      value={opening || ''}
                      onChange={(e) => handleOpeningBalanceChange(channel.id, e.target.value)}
                      disabled={!!currentLiquidity.closingBalance}
                      placeholder="0.00"
                      className="w-20 sm:w-24 text-right bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 outline-none transition-all disabled:opacity-50 font-mono text-xs sm:text-sm"
                    />
                  </td>
                  <td className={`px-4 py-4 text-right font-medium text-xs sm:text-sm ${netToday >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {netToday > 0 ? '+' : ''}{formatCurrency(netToday).replace('GMD', '')}
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-slate-600 text-xs sm:text-sm">
                    {formatCurrency(expected).replace('GMD', '')}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <input
                      type="number"
                      value={displayActual} 
                      onChange={(e) => handleActualBalanceChange(channel.id, e.target.value)}
                      placeholder="0.00"
                      className="w-20 sm:w-24 text-right border border-slate-200 rounded px-2 py-1.5 focus:border-blue-500 outline-none font-mono text-xs sm:text-sm"
                    />
                  </td>
                  <td className={`px-4 py-4 text-right font-black text-xs sm:text-sm ${Math.abs(diff) > 0.01 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {Math.abs(diff) > 0.01 ? formatCurrency(diff).replace('GMD', '') : '—'}
                  </td>
                  <td className="px-4 py-4 text-center print:hidden">
                    {Math.abs(diff) > 0.01 && (
                      <Button
                        variant="outline"
                        onClick={() => createAdjustment(channel.id, diff)}
                        className="py-1 px-2 text-[10px] h-7"
                      >
                        {t('action')}
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-900 text-white font-bold text-[10px] sm:text-xs">
            <tr>
              <td className="px-4 py-4 rounded-bl-xl">{t('totals')}</td>
              <td className="px-4 py-4 text-right whitespace-nowrap">{formatCurrency(openingTotal || 0).replace('GMD', '')}</td>
              <td className="px-4 py-4 text-right whitespace-nowrap">
                {((stats?.returnedToday || 0) - (stats?.issuedToday || 0)) >= 0 ? '+' : ''}
                {formatCurrency((stats?.returnedToday || 0) - (stats?.issuedToday || 0)).replace('GMD', '')}
              </td>
              <td className="px-4 py-4 text-right whitespace-nowrap">{formatCurrency(expectedClosingTotal || 0).replace('GMD', '')}</td>
              <td className="px-4 py-4 text-right whitespace-nowrap">{formatCurrency(activeBalance || 0).replace('GMD', '')}</td>
              <td className="px-4 py-4 text-right whitespace-nowrap">
                {formatCurrency(overallDiscrepancy || 0).replace('GMD', '')}
              </td>
              <td className="px-4 py-4 rounded-br-xl"></td>
            </tr>
          </tfoot>            
        </table>
      </div>
    </Card>
  );
};
