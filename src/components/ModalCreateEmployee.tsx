import React, { useState } from "react";
import { EmployeeUpdate, EmployeeUpdateSchema } from "../schemas/EmployeeEschema";
import CreateEmployee from "../services/createEmployee";

interface ModalCreateEmployeeProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newEmployee: EmployeeUpdate) => void;
}

function ModalCreateEmployee({ isOpen, onClose, onSave }: ModalCreateEmployeeProps) {
  const [newEmployee, setNewEmployee] = useState<EmployeeUpdate>({
    name: "",
    lastname: "",
    password: "",
    ci: "",
    phone: "",
    salary: 0,
    lastPayment: new Date(),
    workInDays: 0,
    ocupation: 0,
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEmployee((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const validatedData = EmployeeUpdateSchema.parse(newEmployee);
      console.log(validatedData);
      const createdEmployee = await CreateEmployee(validatedData);
      onSave(createdEmployee);
      onClose();
    } catch (error) {
      console.error("Error al guardar el empleado:", error);
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
        <h2 className="text-2xl font-bold text-center mb-6">Crear Nuevo Empleado</h2>
        <form className="space-y-4">
          {[
            { id: "ci", label: "Carnet de Identidad", type: "text" },
            { id: "password", label: "Contraseña", type: "password" },
            { id: "name", label: "Nombre", type: "text" },
            { id: "lastname", label: "Apellido", type: "text" },
            { id: "phone", label: "Teléfono", type: "text" },
            { id: "salary", label: "Salario", type: "number" },
            { id: "ocupation", label: "Ocupación", type: "text" },
          ].map(({ id, label, type }) => (
            <div key={id}>
              <label htmlFor={id} className="block text-gray-700 font-medium mb-1">
                {label}
              </label>
              <input
                type={type}
                id={id}
                name={id}
                value={(newEmployee as any)[id]}
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
            Crear Empleado
          </button>
          <button
          type="button"
          className=" my-4 w-full bg-red-400 hover:bg-red-500 text-white font-semibold py-3 rounded-lg transition duration-200"
          onClick={onClose}>
            Cancelar
          </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalCreateEmployee;
