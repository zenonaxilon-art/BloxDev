/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Marketplace } from './pages/Marketplace';
import { ProductDetail } from './pages/ProductDetail';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { Messages } from './pages/Messages';
import { Dashboard } from './pages/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="product/:id" element={<ProductDetail />} />
          
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
          <Route path="messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="dashboard" element={<ProtectedRoute requireSeller><Dashboard /></ProtectedRoute>} />
          
          <Route path="*" element={<div className="text-center py-20">Page Not Found</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
