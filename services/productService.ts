import { Product } from '../types';

const STORAGE_KEY = 'jumia_products_db_v1';

export const getProducts = (): Product[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading products", error);
    return [];
  }
};

export const saveProduct = (product: Product): Product[] => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === product.id);
  
  let newProducts;
  if (index >= 0) {
    // Update
    newProducts = [...products];
    newProducts[index] = product;
  } else {
    // Add
    newProducts = [product, ...products];
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts));
  return newProducts;
};

export const deleteProduct = (id: string): Product[] => {
  const products = getProducts();
  const newProducts = products.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts));
  return newProducts;
};