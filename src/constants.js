import { Banknote, Smartphone, Globe } from 'lucide-react';

export const PROVIDERS = [
  { id: 'cash', label: 'Physical Cash', icon: Banknote, colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'wave', label: 'Wave', icon: Smartphone, colorClass: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'orange', label: 'Orange Money', icon: Smartphone, colorClass: 'bg-orange-100 text-orange-800 border-orange-200' },
  { id: 'aps', label: 'APS Transfer', icon: Globe, colorClass: 'bg-green-100 text-green-800 border-green-200' },
  { id: 'wu', label: 'Western Union', icon: Globe, colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { id: 'nafa', label: 'NAFA', icon: Globe, colorClass: 'bg-purple-100 text-purple-800 border-purple-200' },
];
