import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Check } from 'lucide-react';
import { Loading, LazyImage, ProductCard } from '../../components';
import { useCart } from '../../context';
import { Product } from '../../types';
import { supabase } from '../../lib/supabase';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        setProduct(data);
        setSelectedSize(data.sizes[0] || '');
        setSelectedColor(data.colors[0] || '');

        // Fetch related products
        const { data: related } = await supabase
          .from('products')
          .select('*')
          .eq('category', data.category)
          .neq('id', id)
          .limit(4);
        setRelatedProducts(related || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product || !selectedSize || !selectedColor) return;
    addItem(product, selectedSize, selectedColor, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return (
      <div className="pt-20">
        <Loading />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">المنتج غير موجود</p>
          <button
            onClick={() => navigate('/products')}
            className="text-primary-700 font-medium"
          >
            العودة للمنتجات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16 md:pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-primary-700">الرئيسية</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary-700">المنتجات</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category}`} className="hover:text-primary-700">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-xl overflow-hidden bg-white shadow-sm">
              <LazyImage
                src={product.images[0] || 'https://via.placeholder.com/600'}
                alt={product.name}
                className="w-full h-full"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((img, index) => (
                  <div
                    key={index}
                    className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-white"
                  >
                    <LazyImage
                      src={img}
                      alt={`${product.name} - ${index + 1}`}
                      className="w-full h-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <span className="text-primary-600 font-medium">{product.category}</span>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
                {product.name}
              </h1>
              <p className="text-3xl font-bold text-primary-700 mt-4">
                {product.price.toLocaleString()} ج.س
              </p>
            </div>

            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            {/* Size */}
            {product.sizes.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">المقاس</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        selectedSize === size
                          ? 'border-primary-700 bg-primary-700 text-white'
                          : 'border-gray-300 hover:border-primary-700'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color */}
            {product.colors.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">اللون</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        selectedColor === color
                          ? 'border-primary-700 bg-primary-700 text-white'
                          : 'border-gray-300 hover:border-primary-700'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">الكمية</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-xl hover:bg-gray-100"
                >
                  -
                </button>
                <span className="text-xl font-medium w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-xl hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-green-600">متوفر في المخزون ({product.stock} قطعة)</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-red-600">نفذت الكمية</span>
                </>
              )}
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || !selectedColor || product.stock === 0}
              className={`w-full py-4 rounded-xl font-medium text-lg flex items-center justify-center gap-2 transition-colors ${
                addedToCart
                  ? 'bg-green-600 text-white'
                  : !selectedSize || !selectedColor || product.stock === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-700 text-white hover:bg-primary-800'
              }`}
            >
              {addedToCart ? (
                <>
                  <Check size={24} />
                  تمت الإضافة للسلة
                </>
              ) : (
                <>
                  <ShoppingBag size={24} />
                  إضافة للسلة
                </>
              )}
            </button>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">منتجات مشابهة</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
