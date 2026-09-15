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
import StaffManagement from './pages/StaffManagement';
import Login from './pages/auth/Login';
import ProtectedRoute from './routes/ProtectedRoute';
import { ROLE_ACCESS } from './config/rbac';
import { useAuthStore } from './stores/authStore';
export default function App(){const hydrate=useAuthStore(s=>s.hydrate);useEffect(()=>{hydrate();const f=()=>hydrate();window.addEventListener('ffn:auth-expired',f);return()=>window.removeEventListener('ffn:auth-expired',f)},[hydrate]);return <Routes><Route path="/login" element={<Login/>}/><Route element={<ProtectedRoute/>}>
<Route element={<AdminShell/>}>
<Route element={<ProtectedRoute roles={ROLE_ACCESS.dashboard}/>}>
<Route index element={<Dashboard/>}/>
</Route>

<Route element={<ProtectedRoute roles={ROLE_ACCESS.customers}/>}>
<Route path="customers" element={<Customers/>}/>
<Route path="customers/:id" element={<CustomerDetail/>}/>
</Route>

<Route element={<ProtectedRoute roles={ROLE_ACCESS.households}/>}>
<Route path="households" element={<Households/>}/>
</Route>

<Route element={<ProtectedRoute roles={ROLE_ACCESS.nutrition}/>}>
<Route path="nutrition" element={<Nutrition/>}/>
</Route>

<Route element={<ProtectedRoute roles={ROLE_ACCESS.recipes}/>}>
<Route path="recipes" element={<Recipes/>}/>
</Route>

<Route element={<ProtectedRoute roles={ROLE_ACCESS.inventory}/>}>
<Route path="inventory" element={<Inventory/>}/>
</Route>

<Route element={<ProtectedRoute roles={ROLE_ACCESS.procurement}/>}>
<Route path="procurement" element={<Procurement/>}/>
</Route>

<Route element={<ProtectedRoute roles={ROLE_ACCESS.kitchen}/>}>
<Route path="kitchen" element={<Kitchen/>}/>
</Route>

<Route element={<ProtectedRoute roles={ROLE_ACCESS.orders}/>}>
<Route path="orders" element={<Orders/>}/>
</Route>

<Route element={<ProtectedRoute roles={ROLE_ACCESS.payments}/>}>
<Route path="payments" element={<Payments/>}/>
</Route>

<Route element={<ProtectedRoute roles={ROLE_ACCESS.deliveries}/>}>
<Route path="deliveries" element={<Deliveries/>}/>
</Route>

<Route element={<ProtectedRoute roles={ROLE_ACCESS.notifications}/>}>
<Route path="notifications" element={<Notifications/>}/>
</Route>

<Route element={<ProtectedRoute roles={ROLE_ACCESS.support}/>}>
<Route path="support" element={<Support/>}/>
</Route>

<Route element={<ProtectedRoute roles={ROLE_ACCESS.reports}/>}>
<Route path="reports" element={<Reports/>}/>
</Route>

<Route element={<ProtectedRoute roles={ROLE_ACCESS.ai}/>}>
<Route path="ai" element={<AdminAI/>}/>
</Route>

<Route element={<ProtectedRoute roles={ROLE_ACCESS.profile}/>}>
<Route path="profile" element={<Profile/>}/>
</Route>

<Route element={<ProtectedRoute roles={ROLE_ACCESS.settings}/>}>
<Route path="settings" element={<Settings/>}/>
</Route>

<Route element={<ProtectedRoute roles={ROLE_ACCESS.staff}/>}>
<Route path="staff" element={<StaffManagement/>}/>
</Route>

<Route path="*" element={<Navigate to="/" replace/>}/>
</Route>
</Route></Routes>}
