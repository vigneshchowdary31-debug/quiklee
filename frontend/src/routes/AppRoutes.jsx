import React from 'react';
import InventoryDashboard from '../pages/InventoryDashboard';
import ProductDetail from '../pages/ProductDetail';
import InventoryForm from '../pages/InventoryForm';
import Reports from '../pages/Reports';
import Alerts from '../pages/Alerts';
import Suppliers from '../pages/Suppliers';
import SupplierOrders from '../pages/SupplierOrders';

const AppRoutes = [
  { path: '/dashboard', element: <InventoryDashboard /> },
  { path: '/add-product', element: <InventoryForm /> },
  { path: '/reports', element: <Reports /> },
  { path: '/alerts', element: <Alerts /> },
  { path: '/suppliers', element: <Suppliers /> },
  { path: '/supplier-orders', element: <SupplierOrders /> },
  { path: '/product/:id', element: <ProductDetail /> },
];

export default AppRoutes;
