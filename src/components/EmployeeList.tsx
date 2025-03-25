import { useEffect, useState } from 'react';
import Employee from '../schemas/Employee';
import axios from 'axios';
import EditEmployeButton from './EditEmployeButton';
import CreateEmployeeButton from './CreateEmployeeButton';
import Modal from './Modal';
import EmployeeService from '../services/EmployeeService';
import DeleteEmployeeButton from './DeleteEmployeButton';

const EmployeeList = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); 

  useEffect(() => {
    axios
      .get('http://20.197.226.113:5202/api/employees')
      .then((response) => {
        const employeeList = response.data.map(
          (emp: Employee) =>
            new Employee(
              emp.id,
              emp.name,
              emp.lastname,
              emp.password,
              emp.ci,
              emp.phone,
              emp.salary,
              emp.lastPayment.toString(),
              emp.workInDays,
              emp.ocupation,
              emp.trainer
            )
        );
        setEmployees(employeeList);
        setLoading(false);
      })
      .catch(() => {
        setError('Hubo un error al cargar los empleados');
        setLoading(false);
      });
  }, []);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  if (loading) return <p className="text-center text-lg">Cargando...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Listado de Empleados</h1>
      
      <div className="flex justify-end mb-4">
        <CreateEmployeeButton toggleModal={toggleModal} />
      </div>

      <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-300 text-gray-900 uppercase text-sm leading-normal">
            <tr>
              <th className="py-3 px-6 text-left">CI</th>
              <th className="py-3 px-6 text-left">Nombre</th>
              <th className="py-3 px-6 text-left">Apellido</th>
              <th className="py-3 px-6 text-left">Teléfono</th>
              <th className="py-3 px-6 text-left">Salario</th>
              <th className="py-3 px-6 text-left">Último Pago</th>
              <th className="py-3 px-6 text-left">Ocupación</th>
              <th className="py-3 px-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-black text-sm font-light bg-white">
            {employees.map((employee) => (
              <tr
                key={employee.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition duration-200"
              >
                <td className="py-3 px-6">{employee.ci}</td>
                <td className="py-3 px-6">{employee.name}</td>
                <td className="py-3 px-6">{employee.lastname}</td>
                <td className="py-3 px-6">{employee.phone}</td>
                <td className="py-3 px-6">{employee.salary}</td>
                <td className="py-3 px-6">{employee.getFormattedLastPayment()}</td>
                <td className="py-3 px-6">{employee.ocupation}</td>
                <td className="py-3 px-6 flex items-center justify-center space-x-2">
                  <EditEmployeButton EmployeeInformation={employee} />
                  <DeleteEmployeeButton employeeId={employee.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={toggleModal} onSave={EmployeeService.createEmployee} />
    </div>
  );
};

export default EmployeeList;
