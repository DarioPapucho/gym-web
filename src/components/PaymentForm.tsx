import React from 'react';
import { Form, Input, InputNumber, DatePicker, Button, Modal, FormInstance } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import dayjs from 'dayjs';
import 'dayjs/locale/es'; // Importar el locale español

// Configurar dayjs para usar español
dayjs.locale('es');

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

interface PaymentFormProps {
  visible: boolean;
  selectedEmployee: Employee | null;
  loading: boolean;
  form: FormInstance;
  onCancel: () => void;
  onSave: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  visible,
  selectedEmployee,
  loading,
  form,
  onCancel,
  onSave
}) => {
  return (
    <Modal
      title={`Registrar Pago - ${selectedEmployee?.name || ''} ${selectedEmployee?.lastname || ''}`}
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
          Guardar
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="amount"
          label="Monto"
          rules={[{ required: true, message: 'Ingrese el monto del pago' }]}
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
          name="paymentDate"
          label="Fecha de Pago"
          rules={[{ required: true, message: 'Seleccione la fecha de pago' }]}
        >
          <DatePicker 
            style={{ width: '100%' }} 
            format="YYYY-MM-DD"
          />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="Descripción"
          rules={[{ required: true, message: 'Ingrese una descripción para el pago' }]}
        >
          <TextArea 
            rows={4}
            placeholder="Descripción del pago (ej: Salario del mes de enero)"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PaymentForm;