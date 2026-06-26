import React, { useState, useEffect } from 'react';
import { Save, Loader2, Plus, Trash2, Edit, MapPin, Phone, Building, Store } from 'lucide-react';
import { Loading, Modal } from '../../components';
import { DeliveryRegion } from '../../types';
import { supabase } from '../../lib/supabase';

export function SettingsManagementPage() {
  const [regions, setRegions] = useState<DeliveryRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<DeliveryRegion | null>(null);

  const [formData, setFormData] = useState({
    bank_name: '',
    bank_account: '',
    bank_account_name: '',
    whatsapp_number: '',
    store_name: '',
    store_description: '',
  });

  const [regionForm, setRegionForm] = useState({
    region_name: '',
    price: '',
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, regionsRes] = await Promise.all([
        supabase.from('settings').select('*'),
        supabase.from('delivery_regions').select('*').order('price'),
      ]);

      if (settingsRes.data) {
        const settingsMap: Record<string, string> = {};
        settingsRes.data.forEach(s => {
          settingsMap[s.key] = s.value;
        });
        setFormData({
          bank_name: settingsMap.bank_name || '',
          bank_account: settingsMap.bank_account || '',
          bank_account_name: settingsMap.bank_account_name || '',
          whatsapp_number: settingsMap.whatsapp_number || '',
          store_name: settingsMap.store_name || '',
          store_description: settingsMap.store_description || '',
        });
      }

      if (regionsRes.data) {
        setRegions(regionsRes.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updates = Object.entries(formData).map(([key, value]) => ({
        key,
        value,
      }));

      for (const update of updates) {
        await supabase
          .from('settings')
          .upsert(update, { onConflict: 'key' });
      }
      fetchData();
    } finally {
      setSaving(false);
    }
  };

  const openAddRegionModal = () => {
    setEditingRegion(null);
    setRegionForm({ region_name: '', price: '', is_active: true });
    setIsRegionModalOpen(true);
  };

  const openEditRegionModal = (region: DeliveryRegion) => {
    setEditingRegion(region);
    setRegionForm({
      region_name: region.region_name,
      price: region.price.toString(),
      is_active: region.is_active,
    });
    setIsRegionModalOpen(true);
  };

  const handleRegionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const regionData = {
        region_name: regionForm.region_name,
        price: parseFloat(regionForm.price) || 0,
        is_active: regionForm.is_active,
      };

      if (editingRegion) {
        await supabase
          .from('delivery_regions')
          .update(regionData)
          .eq('id', editingRegion.id);
      } else {
        await supabase.from('delivery_regions').insert(regionData);
      }
      setIsRegionModalOpen(false);
      fetchData();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRegion = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المنطقة؟')) return;
    await supabase.from('delivery_regions').delete().eq('id', id);
    fetchData();
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>

      {/* Store Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Store size={20} />
          معلومات المتجر
        </h2>
        <form onSubmit={handleSettingsSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم المتجر</label>
              <input
                type="text"
                value={formData.store_name}
                onChange={e => setFormData({ ...formData, store_name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">وصف المتجر</label>
              <input
                type="text"
                value={formData.store_description}
                onChange={e => setFormData({ ...formData, store_description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Bank Settings */}
          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-4 flex items-center gap-2">
            <Building size={20} />
            بيانات البنك
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم البنك</label>
              <input
                type="text"
                value={formData.bank_name}
                onChange={e => setFormData({ ...formData, bank_name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم الحساب</label>
              <input
                type="text"
                value={formData.bank_account}
                onChange={e => setFormData({ ...formData, bank_account: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم صاحب الحساب</label>
              <input
                type="text"
                value={formData.bank_account_name}
                onChange={e => setFormData({ ...formData, bank_account_name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* WhatsApp */}
          <h3 className="text-lg font-bold text-gray-900 mt-6 mb-4 flex items-center gap-2">
            <Phone size={20} />
            رقم الواتساب
          </h3>

          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الواتساب (بدون +)</label>
            <input
              type="text"
              value={formData.whatsapp_number}
              onChange={e => setFormData({ ...formData, whatsapp_number: e.target.value })}
              placeholder="249995831217"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-primary-700 text-white px-6 py-2 rounded-lg hover:bg-primary-800 transition-colors disabled:bg-gray-400 flex items-center gap-2"
          >
            {saving && <Loader2 className="animate-spin" size={18} />}
            <Save size={18} />
            حفظ الإعدادات
          </button>
        </form>
      </div>

      {/* Delivery Regions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MapPin size={20} />
            مناطق التوصيل وأسعارها
          </h2>
          <button
            onClick={openAddRegionModal}
            className="flex items-center gap-2 bg-primary-700 text-white px-4 py-2 rounded-lg hover:bg-primary-800 transition-colors"
          >
            <Plus size={18} />
            إضافة منطقة
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">المنطقة</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">السعر</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">الحالة</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {regions.map(region => (
                <tr key={region.id}>
                  <td className="px-4 py-3">{region.region_name}</td>
                  <td className="px-4 py-3 font-bold">{region.price.toLocaleString()} ج.س</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        region.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {region.is_active ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openEditRegionModal(region)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteRegion(region.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Region Modal */}
      <Modal
        isOpen={isRegionModalOpen}
        onClose={() => setIsRegionModalOpen(false)}
        title={editingRegion ? 'تعديل المنطقة' : 'إضافة منطقة جديدة'}
      >
        <form onSubmit={handleRegionSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنطقة</label>
            <input
              type="text"
              value={regionForm.region_name}
              onChange={e => setRegionForm({ ...regionForm, region_name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">سعر التوصيل (ج.س)</label>
            <input
              type="number"
              value={regionForm.price}
              onChange={e => setRegionForm({ ...regionForm, price: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
              required
              min="0"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={regionForm.is_active}
              onChange={e => setRegionForm({ ...regionForm, is_active: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">نشط</label>
          </div>
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary-700 text-white py-2 rounded-lg hover:bg-primary-800 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="animate-spin" size={18} />}
              {editingRegion ? 'حفظ التعديلات' : 'إضافة'}
            </button>
            <button
              type="button"
              onClick={() => setIsRegionModalOpen(false)}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
