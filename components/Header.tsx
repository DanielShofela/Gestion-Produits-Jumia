import React from 'react';
import { Package, Plus, Download } from 'lucide-react';

interface HeaderProps {
  onAddClick: () => void;
  onExportClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAddClick, onExportClick }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">Gestion Produits Jumia</h1>
              <p className="text-xs text-gray-500 font-medium">A-Cosmetic Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onExportClick}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
            >
              <Download className="h-4 w-4" />
              Exporter Excel
            </button>
            <button
              onClick={onAddClick}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 rounded-lg text-sm font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm ring-offset-2 focus:ring-2 ring-emerald-500"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Ajouter un produit</span>
              <span className="sm:hidden">Ajouter</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};