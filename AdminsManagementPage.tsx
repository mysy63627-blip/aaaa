import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, UserCog, Loader2 } from 'lucide-react';
import { Loading, Modal } from '../../components';
import { Admin } from '../../types';
import { supabase } from '../../lib/supabase';

export function AdminsManagementPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('id, email, name, role, created_at')
        .order('created_at', { ascending: true });
      if (!error && data) {
        setAdmins(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingAdmin(null);
    setFormData({ name: '', email: '', password: '', role: 'admin' });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (admin: Admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: '',
      role: admin.role,
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (editingAdmin) {
        // Update existing admin
        const updateData: Record<string, string> = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };

        if (formData.password) {
          updateData.password_hash = 'placeholder';
        }

        const { error } = await supabase
          .from('admins')
          .update({ name: formData.name, email: formData.email })
          .eq('id', editingAdmin.id);

        if (error) throw error;
      } else {
        // Create new admin
        if (!formData.password) {
          setError('كلمة المرور مطلوبة');
          setSaving(false);
          return;
        }

        const { error } = await supabase.from('admins').insert({
          name: formData.name,
          email: formData.email,
          password_hash: 'placeholder',
          role: formData.role,
        });

        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchAdmins();
    } catch {
      setError('حدث خطأ، يرجى المحاولة مرة أخرى');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المدير؟')) return;
    await supabase.from('admins').delete().eq('id', id);
    fetchAdmins();
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">إدارة المدراء</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-primary-700 text-white px-4 py-2 rounded-lg hover:bg-primary-800 transition-colors"
        >
          <Plus size={20} />
          إضافة مدير
        </button>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">المدير</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">البريد الإلكتروني</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">الصلاحية</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {admins.map(admin => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <UserCog size={18} className="text-primary-700" />
                      </div>
                      <span className="font-medium">{admin.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500" dir="ltr">{admin.email}</td>
                  <td className="px-6 py-4">
                    <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
                      {admin.role === 'admin' ? 'مدير كامل' : admin.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(admin)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(admin.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAdmin ? 'تعديل المدير' : 'إضافة مدير جديد'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
              required
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              كلمة المرور {editingAdmin && '(اتركها فارغة للإبقاء على كلمة المرور الحالية)'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
              placeholder="Admin123!"
              dir="ltr"
              required={!editingAdmin}
            />
            {!editingAdmin && (
              <p className="text-sm text-gray-500 mt-1">كلمة المرور الافتراضية: Admin123!</p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary-700 text-white py-2 rounded-lg hover:bg-primary-800 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="animate-spin" size={18} />}
              {editingAdmin ? 'حفظ التعديلات' : 'إضافة'}
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
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
