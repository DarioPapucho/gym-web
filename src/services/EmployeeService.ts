import axios from "axios";
import Employee from "../schemas/Employee";
import { EmployeeUpdate, EmployeeUpdateSchema } from "../schemas/EmployeeEschema";
const token = localStorage.getItem("authGimToken");
class EmployeeService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${import.meta.env.VITE_API_BASE_URL}/employees`;
  }

  async createEmployee(employeeData: EmployeeUpdate) {
    try {
      const response = await axios.post(this.baseUrl, employeeData,
        {
          headers: { 
            "Authorization": `Bearer ${token}` 
          }
        });
      return response.data;
    } catch (error) {
      console.error("Error creating employee:", error);
      throw error;
    }
  }

  async updateEmployee(employee: Partial<Employee>): Promise<Employee> {
    try {
      // Only include fields that are provided in the update
      const updateData: any = {};
      
      // Only add fields that are present in the employee object
      if (employee.name !== undefined) updateData.name = employee.name;
      if (employee.lastname !== undefined) updateData.lastname = employee.lastname;
      if (employee.password !== undefined && employee.password !== "") updateData.password = employee.password;
      if (employee.ci !== undefined) updateData.ci = employee.ci;
      if (employee.phone !== undefined) updateData.phone = employee.phone;
      if (employee.salary !== undefined) updateData.salary = Number(employee.salary);
      if (employee.workInDays !== undefined) updateData.workInDays = Number(employee.workInDays);
      if (employee.ocupation !== undefined) updateData.ocupation = employee.ocupation;
      
      // Parse through the schema to validate and transform
      const employeeData = EmployeeUpdateSchema.parse(updateData);
      
      // Make API call with only the changed fields
      const response = await axios.put(
        `${this.baseUrl}/${employee.id}`, 
        employeeData,
        {
          headers: { 
            "Authorization": `Bearer ${token}` 
          }
        }
      );
      
      console.log("Updated employee data:", employeeData);
      return response.data;
    } catch (error) {
      console.error("Error updating employee:", error);
      throw error;
    }
  }

  async deleteEmployee(employeeId: number): Promise<boolean> {
    const token = localStorage.getItem("authGimToken");
    try {
      await axios.delete(`${this.baseUrl}/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      try {
        await axios.get(`${this.baseUrl}/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return false;
      } catch (error) {
        console.log("Error" + error);
        return true;
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      return false;
    }
  }
}

export default new EmployeeService();