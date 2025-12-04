import React, { useState, useEffect } from 'react';
import { X, Calculator, Wand2, Loader2, RefreshCw } from 'lucide-react';
import { Product } from '../types';
import { calculateMetrics, formatCurrency, formatPercent } from '../services/calculationService';
import { generateDescription } from '../services/geminiService';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  initialData?: Product;
}

const emptyProduct: Omit<Product, 'id' | 'createdAt'> = {
  name: '',
  category: '',
  sku: '',
  sellingPrice: 0,
  costPrice: 0,
  commissionPercent: 0,
  weightVolume: '',
  variation: '',
  shortDesc: '',
  longDesc: ''
};

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState(emptyProduct);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSkuTouched, setIsSkuTouched] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setIsSkuTouched(true); // Don't auto-update SKU for existing products
    } else {
      setFormData(emptyProduct);
      setIsSkuTouched(false); // Enable auto-update for new products
    }
  }, [initialData, isOpen]);

  const generateSKU = (name: string, category: string, variation: string) => {
    const clean = (str: string) => 
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
         .replace(/[^a-zA-Z0-9]/g, '') // Remove special chars
         .toUpperCase();

    const p1 = clean(category).substring(0, 3);
    const p2 = clean(name).substring(0, 4);
    const p3 = clean(variation).substring(0, 4);
    
    const parts = [p1, p2, p3].filter(p => p.length > 0);
    if (parts.length === 0) return '';
    return parts.join('-');
  };

  // Auto-generate SKU when fields change, if not touched
  useEffect(() => {
    if (!isOpen || initialData || isSkuTouched) return;

    const newSku = generateSKU(formData.name, formData.category, formData.variation);
    setFormData(prev => ({ ...prev, sku: newSku }));
  }, [formData.name, formData.category, formData.variation, isOpen, initialData, isSkuTouched]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'sku') {
      setIsSkuTouched(true);
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleForceRegenerateSku = () => {
    const newSku = generateSKU(formData.name, formData.category, formData.variation);
    setFormData(prev => ({ ...prev, sku: newSku }));
    setIsSkuTouched(false); // Reset touched state so it continues to auto-update until edited again
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: initialData?.id || crypto.randomUUID(),
      createdAt: initialData?.createdAt || Date.now()
    });
    onClose();
  };

  const handleGenerateDescription = async () => {
    if (!formData.name || !formData.category) {
      alert("Veuillez remplir le nom et la catégorie pour générer une description.");
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateDescription(formData.name, formData.category, formData.variation);
      setFormData(prev => ({
        ...prev,
        shortDesc: result.shortDesc,
        longDesc: result.longDesc
      }));
    } catch (e) {
      alert("Erreur lors de la génération. Vérifiez votre clé API ou réessayez.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Live Metrics for sidebar
  const metrics = calculateMetrics(formData.sellingPrice, formData.costPrice, formData.commissionPercent);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className="text-xl font-bold text-gray-900" id="modal-title">
                  {initialData ? 'Modifier le Produit' : 'Ajouter un Produit'}
                </h3>
                <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex flex-col lg:flex-row gap-8">
                {/* Form Fields Column */}
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nom du produit *</label>
                      <input type="text" name="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Catégorie Jumia *</label>
                      <input type="text" name="category" required value={formData.category} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                    </div>
                     <div>
                      <label className="block text-sm font-medium text-gray-700">Variation (Couleur/Taille)</label>
                      <input type="text" name="variation" value={formData.variation} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">SKU Vendeur *</label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input 
                          type="text" 
                          name="sku" 
                          required 
                          value={formData.sku} 
                          onChange={handleChange} 
                          className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-gray-300 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" 
                          placeholder="CAT-NOM-VAR"
                        />
                        <button
                          type="button"
                          onClick={handleForceRegenerateSku}
                          className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:text-emerald-600 hover:bg-gray-100"
                          title="Régénérer le SKU automatiquement"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Prix de Vente (FCFA) *</label>
                      <input type="number" min="0" name="sellingPrice" required value={formData.sellingPrice} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Commission Jumia (%) *</label>
                      <input type="number" min="0" max="100" step="0.1" name="commissionPercent" required value={formData.commissionPercent} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                     <div>
                      <label className="block text-sm font-medium text-gray-700">Coût d'achat (FCFA) *</label>
                      <input type="number" min="0" name="costPrice" required value={formData.costPrice} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium text-gray-700">Poids / Volume</label>
                       <input type="text" name="weightVolume" value={formData.weightVolume} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                    </div>
                  </div>

                  <div className="relative">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-700">Description courte</label>
                      <button 
                        type="button" 
                        onClick={handleGenerateDescription}
                        disabled={isGenerating}
                        className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-800 font-medium"
                      >
                        {isGenerating ? <Loader2 className="h-3 w-3 animate-spin"/> : <Wand2 className="h-3 w-3" />}
                        Générer avec IA
                      </button>
                    </div>
                    <textarea rows={2} name="shortDesc" value={formData.shortDesc} onChange={handleChange} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description longue</label>
                    <textarea rows={4} name="longDesc" value={formData.longDesc} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                  </div>
                </div>

                {/* Live Preview / Calculations Column */}
                <div className="w-full lg:w-72 bg-blue-50 p-6 rounded-xl border border-blue-100 h-fit">
                  <div className="flex items-center gap-2 mb-4 text-blue-800">
                    <Calculator className="h-5 w-5" />
                    <h4 className="font-bold text-lg">Aperçu Marges</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-blue-200">
                      <span className="text-sm text-blue-700">Prix Vente</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(formData.sellingPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-blue-200">
                      <span className="text-sm text-blue-700">Com. Jumia ({formData.commissionPercent}%)</span>
                      <span className="font-medium text-red-600">-{formatCurrency(metrics.commissionAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-blue-200 bg-white p-2 rounded">
                      <span className="text-sm font-bold text-gray-700">Montant Reçu</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(metrics.amountReceived)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-blue-200">
                      <span className="text-sm text-blue-700">Coût Produit</span>
                      <span className="font-medium text-gray-600">-{formatCurrency(formData.costPrice)}</span>
                    </div>
                    
                    <div className={`mt-4 p-4 rounded-lg text-center ${metrics.marginPercent > 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                       <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">Marge Nette</p>
                       <p className={`text-2xl font-bold ${metrics.marginPercent > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                         {formatCurrency(metrics.netMargin)}
                       </p>
                       <p className={`text-sm font-medium mt-1 ${metrics.marginPercent > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                         {formatPercent(metrics.marginPercent)} de rendement
                       </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:ml-3 sm:w-auto sm:text-sm">
                Enregistrer
              </button>
              <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
