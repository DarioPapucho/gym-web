import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Employees from './pages/Employees';
import './App.css';
import Dashboard from './pages/DashBoard';
import Members from './pages/Members';
import AccesControlPage from './pages/AccesControl';
import MembershipPlan from './pages/MembershipPlan';



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Login/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/members" element={<Members/>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
        <Route path="/membership-plans" element={<ProtectedRoute><MembershipPlan /></ProtectedRoute>} />
        <Route path="/access-control" element={<ProtectedRoute><AccesControlPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}


export default App;