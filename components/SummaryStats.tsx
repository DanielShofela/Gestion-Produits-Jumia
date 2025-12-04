import React from 'react';
import { TrendingUp, DollarSign, Archive, PieChart } from 'lucide-react';
import { formatCurrency, formatPercent } from '../services/calculationService';
import { ProductStats } from '../types';

interface SummaryStatsProps {
  stats: ProductStats;
}

export const SummaryStats: React.FC<SummaryStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard 
        title="Total Produits" 
        value={stats.totalProducts.toString()} 
        icon={<Archive className="h-5 w-5 text-blue-600" />}
        color="bg-blue-50"
      />
      <StatCard 
        title="Est. Revenu" 
        value={formatCurrency(stats.totalRevenuePotential)} 
        icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
        color="bg-emerald-50"
      />
      <StatCard 
        title="Total Marge Nette" 
        value={formatCurrency(stats.totalNetMargin)} 
        icon={<DollarSign className="h-5 w-5 text-indigo-600" />}
        color="bg-indigo-50"
      />
      <StatCard 
        title="Marge Moyenne" 
        value={formatPercent(stats.averageMarginPercent)} 
        icon={<PieChart className="h-5 w-5 text-orange-600" />}
        color="bg-orange-50"
      />
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
    <div className={`p-2 rounded-lg ${color}`}>
      {icon}
    </div>
  </div>
);