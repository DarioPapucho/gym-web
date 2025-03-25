import axios from "axios";
import Employee from "../schemas/Employee";
import { EmployeeUpdate, EmployeeUpdateSchema } from "../schemas/EmployeeEschema";

class EmployeeService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${import.meta.env.VITE_API_BASE_URL}/employees`;
  }

  async createEmployee(employeeData: EmployeeUpdate) {
    try {
      const response = await axios.post(this.baseUrl, employeeData);
      return response.data;
    } catch (error) {
      console.error("Error creating employee:", error);
      throw error;
    }
  }

  async updateEmployee(employee: Employee): Promise<Employee> {
    const employeeData: EmployeeUpdate = EmployeeUpdateSchema.parse({
      name: employee.name,
      lastname: employee.lastname,
      password: employee.password,
      ci: employee.ci,
      phone: employee.phone,
      salary: employee.salary,
      lastPayment: employee.lastPayment,
      workInDays: employee.workInDays,
      ocupation: employee.ocupation,
    });

    const response = await axios.put(
      `${this.baseUrl}/${employee.id}`, 
      { 
        ...employeeData, 
        lastPayment: employeeData.lastPayment.toISOString() 
      }
    );
    
    console.log("Updated employee data:", employeeData);
    return response.data;
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