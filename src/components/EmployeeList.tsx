import React, { useState, useEffect } from 'react';
import { message, Form, Card, Button } from 'antd';
import { FaPlus, FaMoneyBillWave, FaHistory } from 'react-icons/fa';
import axios from 'axios';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import DataTable from './DataTable';
import EmployeeForm from './EmployeeForm';
import PaymentForm from './PaymentForm';
import PaymentHistory from './PaymentHistory';
import EmployeeService from '../services/EmployeeService';
import PaymentService from '../services/PaymentService';

// Define interfaces
interface Employee {
  id: number;
  name: string;
  lastname: string;
  ci: string;
  phone: string;
  password?: string;
  salary: number;
  workInDays: number;
  ocupation: string;
  payments?: Payment[];
  trainer?: any;
}

interface Payment {
  id: number;
  employeeId: number;
  amount: number;
  createdAt: string;
  description: string;
  monthPaid?: string | null;
  employee?: any;
}

interface EmployeeInput {
  name: string;
  lastname: string;
  ci: string;
  phone: string;
  password: string;
  salary: number;
  lastPayment: Date;
  workInDays: number;
  ocupation: string;
}

interface EmployeeUpdateInput extends Partial<EmployeeInput> {
  lastPayment: string;
}

interface PaymentInput {
  employeeId: number;
  amount: number;
  date: string;
  description: string;
}

const EmployeeList: React.FC = () => {
  // States
  const [employeeForm] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeModalVisible, setEmployeeModalVisible] = useState<boolean>(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState<boolean>(false);
  const [allPaymentsModalVisible, setAllPaymentsModalVisible] = useState<boolean>(false);
  const [loadingEmployee, setLoadingEmployee] = useState<boolean>(false);
  const [loadingPayment, setLoadingPayment] = useState<boolean>(false);
  const [employeePayments, setEmployeePayments] = useState<Payment[]>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [employeesData, setEmployeesData] = useState<Employee[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // Column definitions
  const columns: ColumnsType<Employee> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: '8%',
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Apellido',
      dataIndex: 'lastname',
      key: 'lastname',
      sorter: (a, b) => a.lastname.localeCompare(b.lastname),
    },
    {
      title: 'CI',
      dataIndex: 'ci',
      key: 'ci',
    },
    {
      title: 'Teléfono',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Ocupación',
      dataIndex: 'ocupation',
      key: 'ocupation',
    },
    {
      title: 'Salario',
      dataIndex: 'salary',
      key: 'salary',
      render: (salary) => `${salary.toFixed(2)} Bs.`,
    },
    {
      title: 'Último Pago',
      key: 'lastPayment',
      render: (_, record) => {
        if (record.payments && record.payments.length > 0) {
          // Sort payments by date (newest first)
          const sortedPayments = [...record.payments].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          const latestPayment = sortedPayments[0];
          return dayjs(latestPayment.createdAt).format('DD/MM/YYYY');
        }
        return 'Sin pagos';
      },
    },
  ];

  // Load employees on mount
  useEffect(() => {
    loadEmployees(pagination.current, pagination.pageSize);
  }, []);

  // Function to load employees
  const loadEmployees = async (page: number, pageSize: number) => {
    setTableLoading(true);
    try {
      // Using the actual EmployeeService instead of direct fetch
      const token = localStorage.getItem("authGimToken");
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/employees?page=${page}&pageSize=${pageSize}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Check the structure of the response and handle accordingly
      const responseData = response.data;
      console.log("API Response:", responseData); // Debug log to see the actual structure
      
      // Handle different possible response structures
      const employees = Array.isArray(responseData) 
        ? responseData // If the response is directly an array
        : responseData.data || responseData.employees || []; // If it's an object with a data or employees property
      
      setEmployeesData(employees);
      setPagination({
        ...pagination,
        current: page,
        pageSize: pageSize,
        total: responseData.total || employees.length,
      });
    } catch (error) {
      console.error('Error al cargar empleados:', error);
      message.error('No se pudieron cargar los empleados');
    } finally {
      setTableLoading(false);
    }
  };

  // Handle table changes
  const handleTableChange = (newPagination: any) => {
    loadEmployees(newPagination.current, newPagination.pageSize);
  };

  // Open modal to create employee
  const handleCreateEmployee = () => {
    setEditingEmployee(null);
    employeeForm.resetFields();
    setEmployeeModalVisible(true);
  };

  // Open modal to edit employee
  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    employeeForm.setFieldsValue({
      name: employee.name,
      lastname: employee.lastname,
      ci: employee.ci,
      phone: employee.phone,
      salary: employee.salary,
      workInDays: employee.workInDays,
      ocupation: employee.ocupation,
      // Omitting password for security reasons
    });
    setEmployeeModalVisible(true);
  };

  // Delete employee
  const handleDeleteEmployee = async (employee: Employee) => {
    setTableLoading(true);
    try {
      await EmployeeService.deleteEmployee(employee.id);
      message.success('Empleado eliminado correctamente');
      loadEmployees(pagination.current, pagination.pageSize);
      return true;
    } catch (error) {
      console.error('Error al eliminar empleado:', error);
      message.error('Error al eliminar el empleado');
      setTableLoading(false);
      return false;
    }
  };

  const handleSaveEmployee = async () => {
    try {
      // Only validate the fields that have values
      const values = employeeForm.getFieldsValue();
      const touchedFields = employeeForm.getFieldsValue(true);
      const fieldsToValidate = Object.keys(touchedFields);
      
      await employeeForm.validateFields(fieldsToValidate);
      setLoadingEmployee(true);
      
      if (editingEmployee) {
        // Update existing employee - only send changed fields
        const updateData: Partial<Employee> = {
          id: editingEmployee.id
        };
        
        // Only add fields that have been changed
        Object.keys(values).forEach(key => {
          if (values[key] !== undefined && values[key] !== null && values[key] !== '') {
            // Handle type conversions for numeric fields
            if (key === 'salary' || key === 'workInDays') {
              updateData[key] = Number(values[key]);
            } else {
              updateData[key] = values[key];
            }
          }
        });
        
        // Don't send empty password
        if (updateData.password === '') {
          delete updateData.password;
        }
        
        await EmployeeService.updateEmployee(updateData);
        message.success('Empleado actualizado correctamente');
      } else {
        // Validate all required fields for new employee
        await employeeForm.validateFields([
          'name', 'lastname', 'ci', 'phone', 'password', 
          'salary', 'workInDays', 'ocupation'
        ]);
        
        // Create new employee
        const newEmployee: EmployeeInput = {
          ...values,
          lastPayment: new Date(), // Default to current date for new employee
        };
        
        await EmployeeService.createEmployee(newEmployee);
        message.success('Empleado creado correctamente');
      }
      
      setEmployeeModalVisible(false);
      employeeForm.resetFields();
      setEditingEmployee(null);
      loadEmployees(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Error al guardar empleado:', error);
      if (error instanceof Error) {
        message.error(`Error al guardar el empleado: ${error.message}`);
      } else {
        message.error('Error al guardar el empleado');
      }
    } finally {
      setLoadingEmployee(false);
    }
  };

  // Open payment modal
  const openPaymentModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setPaymentModalVisible(true);
    paymentForm.resetFields();
    
    // Set default values
    const today = dayjs();
    paymentForm.setFieldsValue({
      paymentDate: today,
      amount: employee.salary,
      description: `Pago de salario a ${employee.name} ${employee.lastname}`
    });
  };

  // Save payment
  const handleSavePayment = async () => {
    try {
      await paymentForm.validateFields();
      const formValues = paymentForm.getFieldsValue();
      
      if (!selectedEmployee) return;
      
      setLoadingPayment(true);
      
      const newPayment = {
        employeeId: selectedEmployee.id,
        amount: formValues.amount,
        description: formValues.description,
        monthPaid: formValues.paymentDate ? formValues.paymentDate.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]') : null
      };
      
      // Add the payment
      await PaymentService.addPayment(newPayment);
      
      message.success(`Pago registrado correctamente para ${selectedEmployee.name}`);
      setPaymentModalVisible(false);
      // Reload data to show the updated payments
      loadEmployees(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Error al guardar pago:', error);
      message.error('Error al registrar pago');
    } finally {
      setLoadingPayment(false);
    }
  };

  // View all payments
  const viewAllPayments = (employee: Employee) => {
    setSelectedEmployee(employee);
    // Use the payments already included in the employee object
    setEmployeePayments(employee.payments || []);
    setAllPaymentsModalVisible(true);
  };

  // Context menu items
  const contextMenuItems = (employee: Employee) => [
    {
      key: 'addPayment',
      label: 'Registrar Pago',
      icon: <FaMoneyBillWave />,
      onClick: () => openPaymentModal(employee),
    },
    {
      key: 'viewPayments',
      label: 'Ver historial de pagos',
      icon: <FaHistory />,
      onClick: () => viewAllPayments(employee),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <Card title="Gestión de Empleados" extra={
        <Button 
          type="primary" 
          onClick={handleCreateEmployee}
          disabled={tableLoading}
        >
          <FaPlus className="mr-2" /> Nuevo Empleado
        </Button>
      }>
        <DataTable<Employee>
          data={employeesData}
          columns={columns}
          onEdit={handleEditEmployee}
          onDelete={handleDeleteEmployee}
          enableContextMenu={true}
          contextMenuItems={contextMenuItems}
          rowKey="id"
          loading={tableLoading}
          onTableChange={handleTableChange}
          total={pagination.total}
        />
      </Card>
      
      {/* Modal components */}
      <EmployeeForm 
        visible={employeeModalVisible}
        editingEmployee={editingEmployee}
        loading={loadingEmployee}
        onCancel={() => setEmployeeModalVisible(false)}
        onSave={handleSaveEmployee}
        form={employeeForm}
      />
      
      <PaymentForm 
        visible={paymentModalVisible}
        selectedEmployee={selectedEmployee}
        loading={loadingPayment}
        form={paymentForm}
        onCancel={() => setPaymentModalVisible(false)}
        onSave={handleSavePayment}
      />
      
      <PaymentHistory 
        visible={allPaymentsModalVisible}
        selectedEmployee={selectedEmployee}
        payments={employeePayments}
        onClose={() => setAllPaymentsModalVisible(false)}
      />
    </div>
  );
};

export default EmployeeList;