import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import AdminShell from './components/layout/AdminShell';
import Dashboard from './pages/Dashboard';
import Placeholder from './pages/Placeholder';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Households from './pages/Households';
import Nutrition from './pages/Nutrition';
import Recipes from './pages/Recipes';
import Inventory from './pages/Inventory';
import Kitchen from './pages/Kitchen';
import Support from './pages/Support';
import Procurement from './pages/Procurement';
import Orders from './pages/Orders';
import Payments from './pages/Payments';
import Deliveries from './pages/Deliveries';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import AdminAI from './pages/AdminAI';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './pages/auth/Login';
import ProtectedRoute from './routes/ProtectedRoute';
import { useAuthStore } from './stores/authStore';
export default function App(){const hydrate=useAuthStore(s=>s.hydrate);useEffect(()=>{hydrate();const f=()=>hydrate();window.addEventListener('ffn:auth-expired',f);return()=>window.removeEventListener('ffn:auth-expired',f)},[hydrate]);return <Routes><Route path="/login" element={<Login/>}/><Route element={<ProtectedRoute/>}><Route element={<AdminShell/>}><Route index element={<Dashboard/>}/><Route path="customers" element={<Customers/>}/><Route path="customers/:id" element={<CustomerDetail/>}/><Route path="households" element={<Households/>}/><Route path="nutrition" element={<Nutrition/>}/><Route path="recipes" element={<Recipes/>}/><Route path="inventory" element={<Inventory/>}/><Route path="procurement" element={<Procurement/>}/><Route path="kitchen" element={<Kitchen/>}/><Route path="orders" element={<Orders/>}/><Route path="payments" element={<Payments/>}/><Route path="deliveries" element={<Deliveries/>}/><Route path="notifications" element={<Notifications/>}/><Route path="support" element={<Support/>}/><Route path="reports" element={<Reports/>}/><Route path="ai" element={<AdminAI/>}/><Route path="profile" element={<Profile/>}/>
<Route path="settings" element={<Settings/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Route></Route></Routes>}
