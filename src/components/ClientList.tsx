import { useState, useEffect } from 'react';
import axios from 'axios';
import { z } from 'zod';
import CreateClientButton from './CreateClientButton';
import DeleteClientButton from './DeleteClientButton';
import ModalCreateClient from './ModalCreateClient'; // Asegúrate de importar el modal correcto
import ClientSchema from '../schemas/ClientSchema';

type Client = z.infer<typeof ClientSchema>;

const ClientList = () => {
  const [clients, setClients] = useState<Client[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const token = localStorage.getItem("authGimToken");

  useEffect(() => {
    axios
      .get('http://20.197.226.113:5202/api/clients', {
        headers: { Authorization: "Bearer " + token }
      })
      .then(response => {
        setClients(response.data);
        console.log(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Hubo un error al cargar los clientes');
        setLoading(false);
      });
  }, [token]);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleSaveClient = (newClient: Client) => {
    setClients(prevClients => [...prevClients, newClient]); // Actualizar la lista de clientes con el nuevo cliente
  };

  if (loading) return <p className="text-center text-lg">Cargando...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Listado de Clientes</h1>

      <div className="flex justify-end mb-4">
        <CreateClientButton toggleModal={toggleModal} />
      </div>

      <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
            <tr>
              <th className="py-3 px-6 text-left">Nombre Completo</th>
              <th className="py-3 px-6 text-left">Número</th>
              <th className="py-3 px-6 text-left">Streak</th>
              <th className="py-3 px-6 text-left">Estado de Membresía</th>
              <th className="py-3 px-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {clients.map((client) => (
              <tr
                key={client.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition duration-200"
              >
                <td className="py-3 px-6">{client.name + " " + client.lastName}</td>
                <td className="py-3 px-6">{client.phone}</td>
                <td className="py-3 px-6">{client.streak}</td>
                <td className="py-3 px-6">
                  {/* Aquí deberías colocar la lógica para mostrar el estado de la membresía */}
                </td>
                <td className="py-3 px-6 text-center">
                  <DeleteClientButton clientId={client.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Crear Cliente */}
      <ModalCreateClient
        isOpen={isModalOpen}
        onClose={toggleModal}
        onSave={handleSaveClient}
      />
    </div>
  );
};

export default ClientList;
