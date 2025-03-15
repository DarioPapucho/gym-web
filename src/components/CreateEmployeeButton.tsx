interface CreateEmployeeButtonProps {
    toggleModal: () => void;
  }
  
  const CreateEmployeeButton = ({ toggleModal }: CreateEmployeeButtonProps) => (
    <div className="mb-4">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={toggleModal} 
      >
        Crear Empleado
      </button>
    </div>
  );
  
  export default CreateEmployeeButton;
  