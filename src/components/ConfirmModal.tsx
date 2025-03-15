import React from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void; 
  onCancel: () => void;
  setIsModalOpen: (isOpen: boolean) => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = "¿Estás seguro?",
  message = "Esta acción no se puede deshacer.",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  setIsModalOpen,
}) => {
  if (!isOpen) return null;
  const handleConfirm = () => {
    onConfirm(); 
    setIsModalOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-30 bg-transparency bg-opacity-30 backdrop-blur-sm flex justify-center items-center"
      onClick={onCancel}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fadeIn"
        onClick={(e) => e.stopPropagation()} 
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">{title}</h2>
        <p className="text-gray-600 text-center">{message}</p>

        <div className="flex justify-between gap-4 mt-8">
          <button
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition duration-200"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition duration-200"
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
