import { Banknote, Smartphone, Globe, Building } from 'lucide-react';

export const PROVIDERS = [
  { id: 'cash', label: 'Physical Cash', icon: Banknote, colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'wave', label: 'Wave', icon: Smartphone, colorClass: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'orange', label: 'Orange Money', icon: Smartphone, colorClass: 'bg-orange-100 text-orange-800 border-orange-200' },
  { id: 'aps', label: 'APS Transfer', icon: Globe, colorClass: 'bg-green-100 text-green-800 border-green-200' },
  { id: 'wu', label: 'Western Union', icon: Globe, colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { id: 'nafa', label: 'NAFA', icon: Globe, colorClass: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'bloom', label: 'Bloom Bank', icon: Building, colorClass: 'bg-rose-100 text-rose-800 border-rose-200' },
  { id: 'ansaar', label: 'Ansaar', icon: Building, colorClass: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
];
