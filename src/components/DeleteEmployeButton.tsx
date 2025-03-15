import { useState } from "react";
import deleteEmployee from "../services/DeleteEmployee";
import ConfirmModal from "./ConfirmModal";

interface DeleteEmployeeButtonProps {
    employeeId: number;
}
function DeleteEmployeeButton({ employeeId }: DeleteEmployeeButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDelete = async () => {
        const response = await deleteEmployee(employeeId);
        console.log(response);
    }

    return (
        <div>
        <button
        onClick={() => setIsModalOpen(true)}
         className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all">
            Eliminar
        </button>
        <ConfirmModal
        isOpen={isModalOpen}
        title="Eliminar Registro"
        message="¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        onConfirm={handleDelete}
        onCancel={() => setIsModalOpen(false)}
        setIsModalOpen={setIsModalOpen}
      />
      </div>
    )
}


export default DeleteEmployeeButton