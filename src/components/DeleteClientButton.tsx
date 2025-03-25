import ClientService from "../services/ClientService";

interface DeleteClientButtonProps {
  clientId: number;
}

function DeleteClientButton({ clientId }: DeleteClientButtonProps) {
  const handleDelete = async () => {
    const response = await ClientService.delete(clientId);
    console.log(response);
  };

  return (
    <button
      onClick={handleDelete}
      className="bg-red-500 hover:bg-red-700 text-white font-bold rounded"
    >
      Eliminar
    </button>
  );
}

export default DeleteClientButton;