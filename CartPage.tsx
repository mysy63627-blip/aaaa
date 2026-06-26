import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, MapPin } from 'lucide-react';
import { Loading } from '../../components';
import { useCart } from '../../context';
import { DeliveryRegion } from '../../types';
import { supabase } from '../../lib/supabase';

export function CartPage() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart();
  const [regions, setRegions] = useState<DeliveryRegion[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<DeliveryRegion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_regions')
        .select('*')
        .eq('is_active', true)
        .order('price');
      if (!error && data) {
        setRegions(data);
        if (data.length > 0) {
          setSelectedRegion(data[0]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const deliveryPrice = selectedRegion?.price || 0;
  const grandTotal = totalPrice + deliveryPrice;

  if (loading) {
    return (
      <div className="pt-20">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16 md:pt-20 pb-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">سلة التسوق</h1>
          <span className="text-gray-600">{totalItems} منتج</span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500 mb-4">سلة التسوق فارغة</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-primary-700 font-medium hover:underline"
            >
              تصفحي المنتجات
              <ArrowLeft size={18} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <div
                  key={`${item.product.id}-${item.size}-${item.color}`}
                  className="bg-white rounded-xl shadow-sm p-4 flex gap-4"
                >
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.product.images[0] || 'https://via.placeholder.com/200'}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.product.id}`}
                      className="font-medium text-gray-900 hover:text-primary-700 line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    <div className="text-sm text-gray-500 mt-1 space-y-1">
                      <p>المقاس: {item.size}</p>
                      <p>اللون: {item.color}</p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.size,
                              item.color,
                              item.quantity - 1
                            )
                          }
                          className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-10 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.size,
                              item.color,
                              item.quantity + 1
                            )
                          }
                          className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary-700">
                          {(item.product.price * item.quantity).toLocaleString()} ج.س
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.product.price.toLocaleString()} ج.س / قطعة
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id, item.size, item.color)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-4">ملخص الطلب</h2>

                {/* Region Selector */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin size={16} className="inline ml-1" />
                    منطقة التوصيل
                  </label>
                  <select
                    value={selectedRegion?.id || ''}
                    onChange={e => {
                      const region = regions.find(r => r.id === e.target.value);
                      setSelectedRegion(region || null);
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500"
                  >
                    {regions.map(region => (
                      <option key={region.id} value={region.id}>
                        {region.region_name} - {region.price.toLocaleString()} ج.س
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3 border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">المجموع الفرعي</span>
                    <span>{totalPrice.toLocaleString()} ج.س</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">تكلفة التوصيل</span>
                    <span>{deliveryPrice.toLocaleString()} ج.س</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-3">
                    <span>الإجمالي</span>
                    <span className="text-primary-700">{grandTotal.toLocaleString()} ج.س</span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="block w-full mt-6 py-3 bg-primary-700 text-white text-center rounded-xl font-medium hover:bg-primary-800 transition-colors"
                >
                  إتمام الطلب
                </Link>

                <Link
                  to="/products"
                  className="block w-full mt-3 py-3 border border-gray-300 text-gray-700 text-center rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  متابعة التسوق
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
