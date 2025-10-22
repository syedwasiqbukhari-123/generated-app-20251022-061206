import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { HomePage } from '@/pages/HomePage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import { CustomersPage } from '@/pages/CustomersPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { DeliveriesPage } from '@/pages/DeliveriesPage';
import { EmployeesPage } from '@/pages/EmployeesPage';
import { FinancePage } from '@/pages/FinancePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { NAV_LINKS } from './lib/constants';
const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout>
          <Navigate to="/dashboard" replace />
        </AppLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <AppLayout>
          <HomePage />
        </AppLayout>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  ...NAV_LINKS
    .filter(link => link.href !== '/dashboard')
    .map(link => {
      let element;
      if (link.href === '/customers') {
        element = <CustomersPage />;
      } else if (link.href === '/inventory') {
        element = <InventoryPage />;
      } else if (link.href === '/orders') {
        element = <OrdersPage />;
      } else if (link.href === '/deliveries') {
        element = <DeliveriesPage />;
      } else if (link.href === '/employees') {
        element = <EmployeesPage />;
      } else if (link.href === '/finance') {
        element = <FinancePage />;
      } else if (link.href === '/settings') {
        element = <SettingsPage />;
      } else {
        element = <PlaceholderPage pageName={link.label} />;
      }
      return {
        path: link.href,
        element: (
          <ProtectedRoute allowedRoles={link.roles}>
            <AppLayout>
              {element}
            </AppLayout>
          </ProtectedRoute>
        ),
        errorElement: <RouteErrorBoundary />,
      };
    }),
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
);