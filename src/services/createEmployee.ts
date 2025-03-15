import axios from "axios";
import { EmployeeUpdate } from "../schemas/EmployeeEschema";

const CreateEmployee = async (employeeData: EmployeeUpdate) => {
  try {
    const response = await axios.post(
      "http://20.197.226.113:5202/api/employees",
      employeeData
    );
    return response.data;
  } catch (error) {
    console.error("Error al crear el empleado:", error);
    throw error;
  }
};

export default CreateEmployee;

