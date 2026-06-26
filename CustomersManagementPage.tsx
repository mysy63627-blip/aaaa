import React, { useState, useEffect } from 'react';
import { Search, Phone, User } from 'lucide-react';
import { Loading } from '../../components';
import { Customer } from '../../types';
import { supabase } from '../../lib/supabase';

export function CustomersManagementPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setCustomers(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    c =>
      c.name.includes(searchQuery) ||
      c.phone.includes(searchQuery) ||
      c.region?.includes(searchQuery)
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">إدارة العملاء</h1>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="بحث بالاسم أو الهاتف أو المنطقة..."
          className="w-full border border-gray-300 rounded-lg pr-10 pl-4 py-2 focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">العميل</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">الهاتف</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">المنطقة</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">عدد الطلبات</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCustomers.map(customer => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <User size={18} className="text-primary-700" />
                      </div>
                      <span className="font-medium">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={`tel:${customer.phone}`}
                      className="text-primary-700 hover:underline inline-flex items-center gap-1"
                    >
                      <Phone size={14} />
                      {customer.phone}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{customer.region || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
                      {customer.total_orders} طلبات
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(customer.created_at).toLocaleDateString('ar-SD')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            لا يوجد عملاء
          </div>
        )}
      </div>
    </div>
  );
}
