import React from 'react';
import { Form, Input, InputNumber, Button, Modal, FormInstance, Select } from 'antd';
import CargoEmpleado from '../enums/EmployeeOcupation';

interface Employee {
  id: number;
  name: string;
  lastname: string;
  ci: string;
  phone: string;
  password?: string;
  salary: number;
  lastPayment?: string;
  workInDays: number;
  ocupation: number;
}

interface EmployeeFormProps {
  visible: boolean;
  editingEmployee: Employee | null;
  loading: boolean;
  onCancel: () => void;
  onSave: () => void;
  form: FormInstance;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  visible,
  editingEmployee,
  loading,
  onCancel,
  onSave,
  form
}) => {
  // Determine if we're in edit mode (for conditional validation)
  const isEditMode = !!editingEmployee;
  
  // Generate occupation options from the enum
  const ocupationOptions = [
    { value: CargoEmpleado.SinAcceso, label: 'Sin Acceso' },
    { value: CargoEmpleado.AdminBasico, label: 'Admin Básico' },
    { value: CargoEmpleado.AdminMedio, label: 'Admin Medio' },
    { value: CargoEmpleado.AdminCompleto, label: 'Admin Completo' },
    { value: CargoEmpleado.Entrenador, label: 'Entrenador' },
  ];
  
  return (
    <Modal
      title={isEditMode ? 'Editar Empleado' : 'Crear Empleado'}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancelar
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={loading} 
          onClick={onSave}
        >
          {isEditMode ? 'Actualizar' : 'Crear'}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="name"
          label="Nombre"
          rules={[{ required: !isEditMode, message: 'Por favor ingrese el nombre' }]}
        >
          <Input placeholder="Ej: Juan" />
        </Form.Item>
        
        <Form.Item
          name="lastname"
          label="Apellido"
          rules={[{ required: !isEditMode, message: 'Por favor ingrese el apellido' }]}
        >
          <Input placeholder="Ej: Pérez" />
        </Form.Item>
        
        <Form.Item
          name="ci"
          label="Cédula de Identidad"
          rules={[{ required: !isEditMode, message: 'Por favor ingrese la cédula de identidad' }]}
        >
          <Input placeholder="Ej: 12345678" />
        </Form.Item>
        
        <Form.Item
          name="password"
          label="Contraseña"
          rules={[{ required: !isEditMode, message: 'Por favor ingrese la contraseña' }]}
          extra={isEditMode ? "Dejar en blanco para conservar la contraseña actual" : ""}
        >
          <Input.Password placeholder={isEditMode ? "Dejar en blanco para mantener contraseña actual" : "Contraseña"} />
        </Form.Item>
        
        <Form.Item
          name="phone"
          label="Teléfono"
          rules={[{ required: !isEditMode, message: 'Por favor ingrese el teléfono' }]}
        >
          <Input placeholder="Ej: 70123456" />
        </Form.Item>
        
        <Form.Item
          name="ocupation"
          label="Ocupación/Cargo"
          rules={[{ required: !isEditMode, message: 'Por favor seleccione la ocupación' }]}
        >
          <Select 
            placeholder="Seleccione la ocupación" 
            options={ocupationOptions}
          />
        </Form.Item>
        
        <Form.Item
          name="salary"
          label="Salario Mensual"
          rules={[{ required: !isEditMode, message: 'Por favor ingrese el salario' }]}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              precision={2}
              placeholder="Ej: 150.00"
              disabled={loading}
              stringMode={false}
              parser={value => value ? parseFloat(value.toString().replace(/[^\d.]/g, '')) : 0}
            />
            <span>Bs.</span>
          </div>
        </Form.Item>
        
        <Form.Item
          name="workInDays"
          label="Días de Trabajo"
          rules={[{ required: !isEditMode, message: 'Por favor ingrese los días de trabajo' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={1}
            max={31}
            placeholder="Ej: 22"
            stringMode={false}
            parser={value => value ? parseInt(value.toString().replace(/[^\d]/g, '')) : 0}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EmployeeForm;