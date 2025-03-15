import React from 'react';
import ModalCreateEmployee from './ModalCreateEmployee'; // Asegúrate de que la ruta sea correcta

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newEmployee: any) => void; // El tipo de `newEmployee` debe coincidir con tu tipo de empleado
}

const Modal = ({ isOpen, onClose, onSave }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-10 bg-transparent bg-opacity-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg w-96 max-w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-xl"
          onClick={onClose}
        >
          &times;
        </button>
        <ModalCreateEmployee isOpen={isOpen} onClose={onClose} onSave={onSave} />
      </div>
    </div>
  );
};

export default Modal;
