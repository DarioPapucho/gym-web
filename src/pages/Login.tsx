import { JSX, useState } from 'react';
import loginService from '../services/loginService.ts';
import { useNavigate } from 'react-router-dom';

const validation = async (ci: string, password: string) => {
  const res = await loginService(ci, password);
  
  if (res === "") {
    return;
  }
  
  localStorage.setItem('authGimToken', res);
  return res;
};

function Login(): JSX.Element {
  const [password, setPassword] = useState('');
  const [ci, setCi] = useState('');
  const [isCooldown, setIsCooldown] = useState(false); 
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (isCooldown) return; 

    setIsCooldown(true);
    const res = await validation(ci, password);
    
    if (res) {
      navigate('/employees');
    }
    
    setTimeout(() => setIsCooldown(false), 3000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <div className="bg-white p-6 rounded-md w-full max-w-sm border border-blue-500 shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-4">Iniciar Sesión</h2>

        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-gray-700">Carnet de Identidad</label>
            <input
              type="text"
              value={ci}
              onChange={(e) => setCi(e.target.value)}
              placeholder="Introduce tu CI"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Introduce tu contraseña"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={isCooldown} 
            className={`w-full py-2 rounded-md transition-colors ${
              isCooldown
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-800'
            }`}
          >
            {isCooldown ? 'Espera...' : 'Entrar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;