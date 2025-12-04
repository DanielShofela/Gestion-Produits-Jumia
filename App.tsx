import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { SummaryStats } from './components/SummaryStats';
import { ProductTable } from './components/ProductTable';
import { ProductModal } from './components/ProductModal';
import { Product, ProductStats } from './types';
import { getProducts, saveProduct, deleteProduct } from './services/productService';
import { calculateMetrics } from './services/calculationService';
import { exportToExcel } from './services/excelService';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  // Load data on mount
  useEffect(() => {
    setProducts(getProducts());
  }, []);

  // Compute Dashboard Stats
  const stats: ProductStats = useMemo(() => {
    let totalRevenuePotential = 0;
    let totalNetMargin = 0;
    let totalMarginPercent = 0;

    products.forEach(p => {
      const m = calculateMetrics(p.sellingPrice, p.costPrice, p.commissionPercent);
      totalRevenuePotential += m.amountReceived;
      totalNetMargin += m.netMargin;
      totalMarginPercent += m.marginPercent;
    });

    return {
      totalProducts: products.length,
      totalRevenuePotential,
      totalNetMargin,
      averageMarginPercent: products.length > 0 ? totalMarginPercent / products.length : 0
    };
  }, [products]);

  const handleSaveProduct = (product: Product) => {
    const updatedProducts = saveProduct(product);
    setProducts(updatedProducts);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      const updatedProducts = deleteProduct(id);
      setProducts(updatedProducts);
    }
  };

  const openAddModal = () => {
    setEditingProduct(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleExport = () => {
    if (products.length === 0) {
      alert("Aucune donnée à exporter.");
      return;
    }
    exportToExcel(products);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 pb-20">
      <Header onAddClick={openAddModal} onExportClick={handleExport} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SummaryStats stats={stats} />
        
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Liste des Produits</h2>
            <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
              {products.length} réf.
            </span>
          </div>

          <ProductTable 
            products={products} 
            onEdit={openEditModal} 
            onDelete={handleDeleteProduct} 
          />
        </div>
      </main>

      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        initialData={editingProduct}
      />
    </div>
  );
}

export default App;