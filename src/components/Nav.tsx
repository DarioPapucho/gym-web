import { Link, useNavigate } from 'react-router-dom';
import { FaUserFriends, FaUserTie, FaHome, FaUserCircle, FaSignOutAlt  } from 'react-icons/fa';

const Navbar = () => {

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authGimToken');
    navigate('/login'); 
  };
  const openAccessControlWindow = () => {
    window.open('/access-control', '_blank', 'width=1024,height=768');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/dashboard" className="flex items-center text-2xl font-bold text-white space-x-2">
          <FaHome />
          <span>Onix Gym - Sport Center</span>
        </Link>
        <div className="flex space-x-6">
          <Link to="/members" className="flex items-center space-x-1 hover:text-gray-300 text-white transition duration-200">
            <FaUserFriends />
            <span>Miembros</span>
          </Link>
          <Link to="/employees" className="flex items-center space-x-1 hover:text-gray-300 text-white transition duration-200">
            <FaUserTie />
            <span>Empleados</span>
          </Link>
          
          <Link to="/membership-plans" className="flex items-center space-x-1 hover:text-gray-300 text-white transition duration-200">
            <FaUserCircle />
            <span>Planes de membresía</span>
          </Link>
          <button 
            onClick={openAccessControlWindow} 
            className="flex items-center space-x-1 hover:text-gray-300 text-white transition duration-200"
          >
            <FaUserCircle />
            <span>Control de acceso</span>
          </button>
          <button 
            onClick={handleLogout} 
            className="flex items-center space-x-1 hover:text-gray-300 text-white transition duration-200"
          >
            <FaSignOutAlt />
            <span>Salir</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;