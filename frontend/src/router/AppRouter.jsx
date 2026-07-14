import { Route, Routes } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import AdminLayout from '../layouts/AdminLayout'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import CartPage from '../pages/CartPage'
import CheckoutPage from '../pages/CheckoutPage'
import ProfilePage from '../pages/ProfilePage'
import MyOrdersPage from '../pages/MyOrdersPage'
import OrderDetailPage from '../pages/OrderDetailPage'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import ProtectedRoute from './ProtectedRoute'
import AdminRoute from './AdminRoute'
import AdminProductsPage from '../pages/admin/AdminProductsPage'
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage'
import AdminUsersPage from '../pages/admin/AdminUsersPage'
import AdminCreateProductPage from '../pages/admin/AdminCreateProductPage'
import AdminEditProductPage from '../pages/admin/AdminEditProductPage'
import AdminCreateCategoryPage from '../pages/admin/AdminCreateCategoryPage'
import AdminEditCategoryPage from '../pages/admin/AdminEditCategoryPage'

function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/recuperar-contrasena" element={<ForgotPasswordPage />} />

        <Route
          path="/carrito"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/finalizar-pedido"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mis-pedidos"
          element={
            <ProtectedRoute>
              <MyOrdersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mis-pedidos/:uuid"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="productos" element={<AdminProductsPage />} />
        <Route path="productos/nuevo" element={<AdminCreateProductPage />} />
        <Route path="productos/:uuid/editar" element={<AdminEditProductPage />} />

        <Route path="categorias" element={<AdminCategoriesPage />} />
        <Route path="categorias/nueva" element={<AdminCreateCategoryPage />} />
        <Route path="categorias/:uuid/editar" element={<AdminEditCategoryPage />} />

        <Route path="usuarios" element={<AdminUsersPage />} />
      </Route>
    </Routes>
  )
}

export default AppRouter