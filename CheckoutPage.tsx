import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, User, Phone, Home, Loader2 } from 'lucide-react';
import { Loading } from '../../components';
import { useCart } from '../../context';
import { DeliveryRegion } from '../../types';
import { supabase } from '../../lib/supabase';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const [regions, setRegions] = useState<DeliveryRegion[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [orderData, setOrderData] = useState<{
    customerName: string;
    customerPhone: string;
    customerCity: string;
    customerAddress: string;
    items: Array<{
      product_name: string;
      size: string;
      color: string;
      quantity: number;
      price: number;
    }>;
    grandTotal: number;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    region: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [regionsRes, settingsRes] = await Promise.all([
        supabase.from('delivery_regions').select('*').eq('is_active', true).order('price'),
        supabase.from('settings').select('*'),
      ]);

      if (regionsRes.data) {
        setRegions(regionsRes.data);
        if (regionsRes.data.length > 0) {
          setFormData(prev => ({ ...prev, region: regionsRes.data![0].id }));
        }
      }
      if (settingsRes.data) {
        const settingsMap: Record<string, string> = {};
        settingsRes.data.forEach(s => {
          settingsMap[s.key] = s.value;
        });
        setSettings(settingsMap);
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedRegion = regions.find(r => r.id === formData.region);
  const deliveryPrice = selectedRegion?.price || 0;
  const grandTotal = totalPrice + deliveryPrice;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'الاسم مطلوب';
    if (!formData.phone.trim()) newErrors.phone = 'رقم الهاتف مطلوب';
    else if (!/^\d+$/.test(formData.phone)) newErrors.phone = 'رقم الهاتف غير صحيح';
    if (!formData.address.trim()) newErrors.address = 'العنوان مطلوب';
    if (!formData.region) newErrors.region = 'المنطقة مطلوبة';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (items.length === 0) return;

    setSubmitting(true);
    try {
      const orderItems = items.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        image: item.product.images[0] || '',
      }));

      const regionName = selectedRegion?.region_name || '';

      const { data, error } = await supabase
        .from('orders')
        .insert({
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_address: formData.address,
          region: regionName,
          items: orderItems,
          total_price: totalPrice,
          delivery_price: deliveryPrice,
          grand_total: grandTotal,
          status: 'pending',
          payment_status: 'pending',
        })
        .select('id')
        .single();

      if (!error && data) {
        // Save customer
        await supabase.from('customers').upsert({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          region: regionName,
          total_orders: 1,
        }, { onConflict: 'phone' });

        // Store order data for confirmation
        setOrderData({
          customerName: formData.name,
          customerPhone: formData.phone,
          customerCity: regionName,
          customerAddress: formData.address,
          items: orderItems.map(item => ({
            product_name: item.product_name,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            price: item.price,
          })),
          grandTotal: grandTotal,
        });
        setOrderId(data.id);
        clearCart();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-20">
        <Loading />
      </div>
    );
  }

  if (orderId && orderData) {
    return (
      <PaymentConfirmation
        orderId={orderId}
        settings={settings}
        orderData={orderData}
      />
    );
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-background pt-16 md:pt-20 pb-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">إتمام الطلب</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User size={20} />
              معلومات العميل
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="أدخلي اسمك الكامل"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone size={16} className="inline ml-1" />
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="مثال: 0912345678"
                  dir="ltr"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Home size={16} className="inline ml-1" />
                  العنوان التفصيلي
                </label>
                <textarea
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="أدخلي عنوانك التفصيلي"
                  rows={3}
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin size={16} className="inline ml-1" />
                  المنطقة
                </label>
                <select
                  value={formData.region}
                  onChange={e => setFormData({ ...formData, region: e.target.value })}
                  className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 ${
                    errors.region ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">اختر المنطقة</option>
                  {regions.map(region => (
                    <option key={region.id} value={region.id}>
                      {region.region_name} - {region.price.toLocaleString()} ج.س
                    </option>
                  ))}
                </select>
                {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region}</p>}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">ملخص الطلب</h2>

            <div className="space-y-3 mb-4">
              {items.map(item => (
                <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-3">
                  <img
                    src={item.product.images[0] || 'https://via.placeholder.com/100'}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 line-clamp-1">{item.product.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.size} / {item.color} - {item.quantity} قطعة
                    </p>
                    <p className="text-primary-700 font-medium mt-1">
                      {(item.product.price * item.quantity).toLocaleString()} ج.س
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">المجموع الفرعي</span>
                <span>{totalPrice.toLocaleString()} ج.س</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">تكلفة التوصيل</span>
                <span>{deliveryPrice.toLocaleString()} ج.س</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>الإجمالي</span>
                <span className="text-primary-700">{grandTotal.toLocaleString()} ج.س</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-primary-700 text-white rounded-xl font-medium text-lg hover:bg-primary-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                جاري تأكيد الطلب...
              </>
            ) : (
              'تأكيد الطلب'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function PaymentConfirmation({
  orderId,
  settings,
  orderData,
}: {
  orderId: string;
  settings: Record<string, string>;
  orderData: {
    customerName: string;
    customerPhone: string;
    customerCity: string;
    customerAddress: string;
    items: Array<{
      product_name: string;
      size: string;
      color: string;
      quantity: number;
      price: number;
    }>;
    grandTotal: number;
  };
}) {
  const whatsappNumber = settings.whatsapp_number || '249995831217';
  const bankName = settings.bank_name || 'بنك الخرطوم';
  const bankAccount = settings.bank_account || '7705834';
  const accountName = settings.bank_account_name || 'محمد عيسى موسى هارون';

  // Build dynamic product list
  const productsList = orderData.items
    .map(
      (item) =>
        `• ${item.product_name} - مقاس ${item.size} - لون ${item.color} × ${item.quantity} = ${(item.price * item.quantity).toLocaleString()} ج.س`
    )
    .join('\n');

  const message = `مرحباً، أود تأكيد تحويل طلبي رقم #${orderId.substring(0, 8).toUpperCase()}
الاسم: ${orderData.customerName}
الهاتف: ${orderData.customerPhone}
المدينة: ${orderData.customerCity}
العنوان: ${orderData.customerAddress}
المنتجات:
${productsList}
الإجمالي: ${orderData.grandTotal.toLocaleString()} ج.س
سوف يتم تحويل المبلغ عبر بنكك`;

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="min-h-screen bg-background pt-16 md:pt-20 pb-8">
      <div className="max-w-lg mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">تم تأكيد طلبك!</h1>
          <p className="text-gray-600 mb-6">رقم الطلب: {orderId.substring(0, 8).toUpperCase()}</p>

          <div className="bg-gray-50 rounded-lg p-6 text-right mb-6">
            <h2 className="font-bold text-gray-900 mb-4">بيانات التحويل البنكي</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-500">البنك:</span>
                <p className="font-medium">{bankName}</p>
              </div>
              <div>
                <span className="text-gray-500">رقم الحساب:</span>
                <p className="font-medium text-primary-700 text-lg">{bankAccount}</p>
              </div>
              <div>
                <span className="text-gray-500">اسم صاحب الحساب:</span>
                <p className="font-medium">{accountName}</p>
              </div>
            </div>
          </div>

          <p className="text-gray-600 mb-6">
            يرجى تحويل المبلغ إلى الحساب البنكي أعلاه ثم إرسال إيصال التحويل عبر الواتساب لتأكيد طلبك
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.89c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            تواصل معنا عبر الواتساب
          </a>
        </div>
      </div>
    </div>
  );
}
