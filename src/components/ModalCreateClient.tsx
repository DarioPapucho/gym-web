import { useState } from "react";
import ClientSchema from "../schemas/ClientSchema";
import { z } from 'zod';
import ClientService from "../services/ClientService";
import Client from "../schemas/Client";

interface ModalCreateClientProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newClient: z.infer<typeof ClientSchema>) => void;
  }
  
  function ModalCreateClient({ isOpen, onClose, onSave }: ModalCreateClientProps) {
    const [newClient, setNewClient] = useState({
      name: "",
      lastname: "",
      username: "",
      password: "",
      phone: "",
      streak: 0,
      membership: [{
        id: 0,
        amount: 0,
        discount: 0,
        days: 0,
        initDate: "",
        finishDate: "",
        clientId: 0,
        client: "",
      }],
      workoutPlanTemplateId: 0,
      workoutPlanTemplate: "",
      lastWorkoutPlanAssignedDate: "",
    });
  
    if (!isOpen) return null;
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setNewClient((prev) => ({
        ...prev,
        [name]: value,
      }));
    };
  
    const handleSave = async () => {
      try {
        console.log(newClient);
        const validatedData = Client.parse(newClient);
        console.log(validatedData);
        const createdClient = await ClientService.createClient(validatedData);
        onSave(createdClient);
        onClose();
      } catch (error) {
        console.error("Error al guardar el cliente:", error);
      }
    };
  
    return (
      <div
        className="fixed inset-0 z-20 bg-transparent bg-opacity-20 flex justify-center items-center backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
            onClick={onClose}
          >
            &times;
          </button>
          <h2 className="text-2xl font-bold text-center mb-6">Crear Nuevo Cliente</h2>
          <form className="space-y-4">
            {[
              { id: "name", label: "Nombre", type: "text" },
              { id: "lastName", label: "Apellido", type: "text" },
              { id: "username", label: "Nombre de Usuario", type: "text" },
              { id: "password", label: "Contraseña", type: "password" },
              { id: "phone", label: "Teléfono", type: "text" },
              { id: "streak", label: "Streak", type: "number" },
            ].map(({ id, label, type }) => (
              <div key={id}>
                <label htmlFor={id} className="block text-gray-700 font-medium mb-1">
                  {label}
                </label>
                <input
                  type={type}
                  id={id}
                  name={id}
                  value={(newClient as any)[id]}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-200"
                />
              </div>
            ))}
  
            <div>
              <button
                type="button"
                className="w-full bg-blue-600 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition duration-200"
                onClick={handleSave}
              >
                Crear Cliente
              </button>
              <button
                type="button"
                className="my-4 w-full bg-red-400 hover:bg-red-500 text-white font-semibold py-3 rounded-lg transition duration-200"
                onClick={onClose}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  
  export default ModalCreateClient;