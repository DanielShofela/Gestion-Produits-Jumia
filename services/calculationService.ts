import { Product, CalculatedFields } from '../types';

export const calculateMetrics = (
  sellingPrice: number,
  costPrice: number,
  commissionPercent: number
): CalculatedFields => {
  // Ensure we don't work with NaNs
  const sPrice = sellingPrice || 0;
  const cPrice = costPrice || 0;
  const cPercent = commissionPercent || 0;

  const commissionAmount = sPrice * (cPercent / 100);
  const amountReceived = sPrice - commissionAmount;
  const netMargin = amountReceived - cPrice;
  
  // Avoid division by zero
  const marginPercent = cPrice > 0 ? (netMargin / cPrice) * 100 : 0;

  return {
    commissionAmount,
    amountReceived,
    netMargin,
    marginPercent
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPercent = (val: number): string => {
  return `${val.toFixed(2)}%`;
};