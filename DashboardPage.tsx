import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, DollarSign, Package, Users, Eye } from 'lucide-react';
import { Loading } from '../../components';
import { Order } from '../../types';
import { supabase } from '../../lib/supabase';

export function DashboardPage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, productsRes, customersRes] = await Promise.all([
        supabase.from('orders').select('id, grand_total, created_at, status').order('created_at', { ascending: false }).limit(10),
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('customers').select('id', { count: 'exact' }),
      ]);

      // Calculate stats
      const allOrdersRes = await supabase.from('orders').select('grand_total');
      const totalSales = allOrdersRes.data?.reduce((sum, o) => sum + (o.grand_total || 0), 0) || 0;

      setStats({
        totalOrders: ordersRes.data?.length || 0,
        totalSales: totalSales,
        totalProducts: productsRes.count || 0,
        totalCustomers: customersRes.count || 0,
      });

      setRecentOrders(ordersRes.data?.map(o => ({
        ...o,
        customer_name: '',
        customer_phone: '',
        customer_address: '',
        region: '',
        items: [],
        total_price: o.grand_total || 0,
        delivery_price: 0,
        payment_status: 'pending',
      })) as Order[] || []);
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusLabels: Record<string, string> = {
    pending: 'قيد الانتظار',
    processing: 'قيد المعالجة',
    shipped: 'تم الشحن',
    delivered: 'تم التسليم',
    cancelled: 'ملغي',
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">إجمالي الطلبات</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="text-primary-700" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">إجمالي المبيعات</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalSales.toLocaleString()} ج.س</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-green-700" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">المنتجات</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="text-blue-700" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">العملاء</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalCustomers}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="text-purple-700" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">أحدث الطلبات</h2>
          <Link to="/admin/orders" className="text-primary-700 hover:underline">
            عرض الكل
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">رقم الطلب</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">التاريخ</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">المبلغ</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">الحالة</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">#{order.id.substring(0, 8).toUpperCase()}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('ar-SD')}
                  </td>
                  <td className="px-6 py-4 font-bold">{(order.grand_total || 0).toLocaleString()} ج.س</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="text-primary-700 hover:underline inline-flex items-center gap-1"
                    >
                      <Eye size={16} />
                      عرض
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
