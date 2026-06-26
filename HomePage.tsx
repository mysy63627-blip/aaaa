import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { ProductCard, Loading, LazyImage } from '../../components';
import { Product } from '../../types';
import { supabase } from '../../lib/supabase';

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const categories = ['فساتين', 'عبايات', 'بلوزات', 'بناطيل', 'إكسسوارات'];

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase.from('products').select('*').order('created_at', { ascending: false });
      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }
      const { data, error } = await query;
      if (!error && data) {
        setProducts(data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        <div className="absolute inset-0">
          <LazyImage
            src="https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg"
            alt="فاشون ستاي"
            className="w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        </div>
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <Sparkles className="w-10 h-10 text-secondary-500 mb-4" />
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
            فاشون ستاي
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mb-8">
            اكتشفي عالم الأناقة والجمال مع تشكيلة مميزة من الملابس والإكسسوارات العصرية
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-primary-700 text-white px-8 py-4 rounded-full font-medium hover:bg-primary-800 transition-colors"
          >
            تصفحي المنتجات
            <ArrowLeft size={20} />
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white border-b sticky top-16 md:top-20 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('')}
              className={`flex-shrink-0 px-6 py-2 rounded-full font-medium transition-colors ${
                !selectedCategory
                  ? 'bg-primary-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              الكل
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-6 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {selectedCategory || 'جميع المنتجات'}
            </h2>
          </div>

          {loading ? (
            <Loading />
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">لا توجد منتجات</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">جودة عالية</h3>
              <p className="text-gray-600">منتجات بأعلى جودة وأفضل الخامات</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">توصيل سريع</h3>
              <p className="text-gray-600">توصيل لجميع الولايات</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v1m0 0v1m0-1h1m-1 0H9" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">أسعار منافسة</h3>
              <p className="text-gray-600">أفضل الأسعار مع ضمان الجودة</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
