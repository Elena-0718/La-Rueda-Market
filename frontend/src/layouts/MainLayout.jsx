import { Outlet } from 'react-router-dom'
import Header from '../components/Header'

function MainLayout() {
  return (
    <div className="min-h-screen bg-green-50">
      <Header />

      <Outlet />
    </div>
  )
}

export default MainLayout