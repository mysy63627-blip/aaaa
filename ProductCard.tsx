import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { LazyImage } from './LazyImage';
import { useCart } from '../context';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.sizes.length > 0 && product.colors.length > 0) {
      addItem(product, product.sizes[0], product.colors[0]);
    }
  };

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
        <div className="relative aspect-square overflow-hidden">
          <LazyImage
            src={product.images[0] || 'https://via.placeholder.com/400x400?text=صورة'}
            alt={product.name}
            className="w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
          {product.stock <= 5 && product.stock > 0 && (
            <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
              آخر {product.stock} قطع
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold">نفذت الكمية</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <span className="text-sm text-gray-500">{product.category}</span>
          <h3 className="font-bold text-lg text-gray-900 mt-1 line-clamp-1">{product.name}</h3>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xl font-bold text-primary-700">{product.price.toLocaleString()} ج.س</span>
            {product.stock > 0 && (
              <button
                onClick={handleQuickAdd}
                className="p-2 bg-primary-700 text-white rounded-full hover:bg-primary-800 transition-colors"
                title="إضافة للسلة"
              >
                <ShoppingBag size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
