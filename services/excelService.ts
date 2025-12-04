import * as XLSX from 'xlsx';
import { Product } from '../types';
import { calculateMetrics } from './calculationService';

export const exportToExcel = (products: Product[]) => {
  // Transform data for the Excel sheet structure
  const data = products.map(product => {
    const metrics = calculateMetrics(product.sellingPrice, product.costPrice, product.commissionPercent);
    
    return {
      "Nom du produit": product.name,
      "Catégorie": product.category,
      "SKU Vendeur": product.sku,
      "Prix de vente": product.sellingPrice,
      "Commission %": `${product.commissionPercent}%`,
      "Commission FCFA": metrics.commissionAmount,
      "Montant reçu": metrics.amountReceived,
      "Coût du produit": product.costPrice,
      "Marge nette": metrics.netMargin,
      "Marge %": `${metrics.marginPercent.toFixed(2)}%`,
      "Poids / Volume": product.weightVolume,
      "Variation": product.variation,
      "Description courte": product.shortDesc,
      "Description longue": product.longDesc
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Produits");
  
  // Generate file name with date
  const date = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `A-Cosmetic_Jumia_Export_${date}.xlsx`);
};