import React, { useState, useEffect } from 'react';
import { Eye, Filter } from 'lucide-react';
import { Loading, Modal } from '../../components';
import { Order } from '../../types';
import { supabase } from '../../lib/supabase';

export function OrdersManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const statusOptions = [
    { value: 'pending', label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'processing', label: 'قيد المعالجة', color: 'bg-blue-100 text-blue-800' },
    { value: 'shipped', label: 'تم الشحن', color: 'bg-purple-100 text-purple-800' },
    { value: 'delivered', label: 'تم التسليم', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'ملغي', color: 'bg-red-100 text-red-800' },
  ];

  const paymentStatusOptions = [
    { value: 'pending', label: 'في الانتظار', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'paid', label: 'مدفوع', color: 'bg-green-100 text-green-800' },
    { value: 'failed', label: 'فشل', color: 'bg-red-100 text-red-800' },
  ];

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }
      const { data, error } = await query;
      if (!error && data) {
        setOrders(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, field: 'status' | 'payment_status', value: string) => {
    try {
      await supabase
        .from('orders')
        .update({ [field]: value })
        .eq('id', orderId);
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, [field]: value });
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <h1 className="text-2xl font-bold text-gray-900">إدارة الطلبات</h1>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-500" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500"
          >
            <option value="">جميع الحالات</option>
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">رقم الطلب</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">العميل</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">التاريخ</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">المبلغ</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">حالة الطلب</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">الدفع</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">#{order.id.substring(0, 8).toUpperCase()}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-sm text-gray-500">{order.customer_phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('ar-SD')}
                  </td>
                  <td className="px-6 py-4 font-bold">{order.grand_total.toLocaleString()} ج.س</td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={e => updateOrderStatus(order.id, 'status', e.target.value)}
                      className={`px-3 py-1 rounded-full text-sm border-0 ${
                        statusOptions.find(s => s.value === order.status)?.color
                      }`}
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.payment_status}
                      onChange={e => updateOrderStatus(order.id, 'payment_status', e.target.value)}
                      className={`px-3 py-1 rounded-full text-sm border-0 ${
                        paymentStatusOptions.find(s => s.value === order.payment_status)?.color
                      }`}
                    >
                      {paymentStatusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-primary-700 hover:underline inline-flex items-center gap-1"
                    >
                      <Eye size={16} />
                      عرض
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`تفاصيل الطلب #${selectedOrder?.id.substring(0, 8).toUpperCase()}`}
        size="xl"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-3">معلومات العميل</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">الاسم:</span>
                  <p className="font-medium">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <span className="text-gray-500">الهاتف:</span>
                  <p className="font-medium">{selectedOrder.customer_phone}</p>
                </div>
                <div>
                  <span className="text-gray-500">المنطقة:</span>
                  <p className="font-medium">{selectedOrder.region}</p>
                </div>
                <div>
                  <span className="text-gray-500">العنوان:</span>
                  <p className="font-medium">{selectedOrder.customer_address}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">المنتجات</h3>
              <div className="space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 bg-gray-50 rounded-lg p-3">
                    <img
                      src={item.image || 'https://via.placeholder.com/80'}
                      alt={item.product_name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-gray-500">
                        {item.size} / {item.color} - {item.quantity} قطعة
                      </p>
                    </div>
                    <p className="font-bold">{(item.price * item.quantity).toLocaleString()} ج.س</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">المجموع الفرعي</span>
                <span>{selectedOrder.total_price.toLocaleString()} ج.س</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">التوصيل</span>
                <span>{selectedOrder.delivery_price.toLocaleString()} ج.س</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>الإجمالي</span>
                <span className="text-primary-700">{selectedOrder.grand_total.toLocaleString()} ج.س</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
