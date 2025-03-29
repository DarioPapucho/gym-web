import React from 'react';
import { Form, Input, InputNumber, Button, Modal, FormInstance } from 'antd';

interface Employee {
  id: number;
  name: string;
  lastname: string;
  ci: string;
  phone: string;
  password?: string;
  salary: number;
  lastPayment: string;
  workInDays: number;
  ocupation: string;
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
  return (
    <Modal
      title={editingEmployee ? 'Editar Empleado' : 'Crear Empleado'}
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
          {editingEmployee ? 'Actualizar' : 'Crear'}
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
          rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
        >
          <Input placeholder="Ej: Juan" />
        </Form.Item>
        
        <Form.Item
          name="lastname"
          label="Apellido"
          rules={[{ required: true, message: 'Por favor ingrese el apellido' }]}
        >
          <Input placeholder="Ej: Pérez" />
        </Form.Item>
        
        <Form.Item
          name="ci"
          label="Cédula de Identidad"
          rules={[{ required: true, message: 'Por favor ingrese la cédula de identidad' }]}
        >
          <Input placeholder="Ej: 12345678" />
        </Form.Item>
        
        <Form.Item
          name="password"
          label="Contraseña"
          rules={[{ required: !editingEmployee, message: 'Por favor ingrese la contraseña' }]}
        >
          <Input.Password placeholder="Contraseña" />
        </Form.Item>
        
        <Form.Item
          name="phone"
          label="Teléfono"
          rules={[{ required: true, message: 'Por favor ingrese el teléfono' }]}
        >
          <Input placeholder="Ej: 70123456" />
        </Form.Item>
        
        <Form.Item
          name="ocupation"
          label="Ocupación/Cargo"
          rules={[{ required: true, message: 'Por favor ingrese la ocupación' }]}
        >
          <Input placeholder="Ej: Entrenador, Recepcionista" />
        </Form.Item>
        
        <Form.Item
          name="salary"
          label="Salario Mensual"
          rules={[{ required: true, message: 'Por favor ingrese el salario' }]}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            precision={2}
            placeholder="Ej: 150.00"
            disabled={loading}
          />
          <span>Bs.</span>
        </div>

        </Form.Item>
        
        <Form.Item
          name="workInDays"
          label="Días de Trabajo"
          rules={[{ required: true, message: 'Por favor ingrese los días de trabajo' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={1}
            max={31}
            placeholder="Ej: 22"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EmployeeForm;