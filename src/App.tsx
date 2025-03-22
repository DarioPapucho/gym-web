import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Employees from './pages/Employees';
import './App.css';
import Dashboard from './pages/DashBoard';
import Members from './pages/Members';
import GymEntryLog from './pages/GymEntryLog';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/members" element={<Members/>} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route element={<ProtectedRoute children={<Employees />} />}>
          <Route path="/employees" element={<Employees />} />
        </Route>
        <Route element={<ProtectedRoute children={<GymEntryLog />} />}>
          <Route path="/gymEntrylog" element={<GymEntryLog />} />
        </Route>
      </Routes>
    </Router>
  )
}


export default App;