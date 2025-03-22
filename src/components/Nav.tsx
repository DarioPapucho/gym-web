import { Link } from 'react-router-dom';
import { FaUserFriends, FaUserTie, FaHome, FaRegUserCircle, FaUserCircle } from 'react-icons/fa';

const Navbar = () => {
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
          <Link to="/gymEntrylog" className="flex items-center space-x-1 hover:text-gray-300 text-white transition duration-200">
            <FaUserCircle />
            <span>Registro de ingreso al gym</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
