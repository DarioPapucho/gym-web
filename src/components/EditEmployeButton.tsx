import { useState } from "react";
import Employee from "../schemas/Employee";
import ModalEmployee from "./ModalEmployee";

interface EditEmployeButtonProps {
    EmployeeInformation: Employee;
}
    

const EditEmployeButton: React.FC<EditEmployeButtonProps> = ({ EmployeeInformation: employeeInfo }) => {

   const [isModalOpen, setIsModalOpen] = useState(false);
   const toggleModal = () => setIsModalOpen(!isModalOpen);

   return (
      <div>
         <ModalEmployee
        EmployeeInformation={employeeInfo}
        isOpen={isModalOpen}
        onClose={toggleModal}
      />
      <button
         className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all"
         onClick={toggleModal}
         >
            Editar
       </button>
     </div>
     
   );
 };
 

export default EditEmployeButton;