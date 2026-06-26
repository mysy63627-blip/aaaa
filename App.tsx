import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { CartProvider, AdminProvider, useAdmin } from './context';
import { Header, Footer } from './components';
import {
  HomePage,
  ProductsPage,
  ProductDetailPage,
  CartPage,
  CheckoutPage,
} from './pages/customer';
import {
  AdminLayout,
  AdminLoginPage,
  DashboardPage,
  ProductsManagementPage,
  OrdersManagementPage,
  CustomersManagementPage,
  SettingsManagementPage,
  AdminsManagementPage,
} from './pages/admin';

function AdminRoute() {
  const { admin } = useAdmin();
  return admin ? <Outlet /> : <Navigate to="/admin/login" replace />;
}

function AdminRedirect() {
  const { admin } = useAdmin();
  return admin ? <Navigate to="/admin" replace /> : <AdminLoginPage />;
}

function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <AdminProvider>
        <Router>
          <Routes>
            {/* Customer Routes */}
            <Route
              path="/"
              element={
                <CustomerLayout>
                  <HomePage />
                </CustomerLayout>
              }
            />
            <Route
              path="/products"
              element={
                <CustomerLayout>
                  <ProductsPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/product/:id"
              element={
                <CustomerLayout>
                  <ProductDetailPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/cart"
              element={
                <CustomerLayout>
                  <CartPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/checkout"
              element={
                <CustomerLayout>
                  <CheckoutPage />
                </CustomerLayout>
              }
            />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminRedirect />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <DashboardPage />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <ProductsManagementPage />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <OrdersManagementPage />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/orders/:id"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <OrdersManagementPage />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/customers"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <CustomersManagementPage />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <SettingsManagementPage />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/admins"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminsManagementPage />
                  </AdminLayout>
                </AdminRoute>
              }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AdminProvider>
    </CartProvider>
  );
}

export default App;
