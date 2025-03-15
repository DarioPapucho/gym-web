import axios from "axios";
import Employee from "../schemas/Employee";
import { EmployeeUpdateSchema } from "../schemas/EmployeeEschema";
import { EmployeeUpdate } from "../schemas/EmployeeEschema.ts";

export async function updateEmployee(employee: Employee): Promise<Employee> {
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
    `http://20.197.226.113:5202/api/employees/${employee.id}`,
    {
      ...employeeData,
      lastPayment: employeeData.lastPayment.toISOString(),
    }
  );
  console.log("lo que se mando es: ", employeeData);

  return response.data;
}

