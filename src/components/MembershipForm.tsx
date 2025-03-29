import React from 'react';
import { Form, InputNumber, DatePicker, Button, Modal, FormInstance } from 'antd';
import { Member } from '../services/MemberService';
import { MembershipPlan } from '../services/MembershipPlanService';
import Input from 'antd/es/input/Input';

interface MembershipFormProps {
  visible: boolean;
  selectedMember: Member | null;
  membershipPlans: MembershipPlan[];
  loading: boolean;
  form: FormInstance; // Form instance
  onCancel: () => void;
  onSave: () => void;
  onPlanChange: (planId: number) => void;
}

const MembershipForm: React.FC<MembershipFormProps> = ({
  visible,
  selectedMember,
  membershipPlans,
  loading,
  form,
  onCancel,
  onSave,
  onPlanChange
}) => {
  return (
    <Modal
      title={`Agregar Membresía - ${selectedMember?.name || ''} ${selectedMember?.lastname || ''}`}
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
          name="planId"
          label="Plan de Membresía"
          rules={[{ required: true, message: 'Seleccione un plan de membresía' }]}
        >
          <select 
            className="w-full p-2 border rounded"
            onChange={(e) => onPlanChange(Number(e.target.value))}
          >
            <option value="">Seleccione un plan</option>
            {membershipPlans.map(plan => (
              <option key={plan.id} value={plan.id}>
                {plan.type} - {plan.amount} Bs. ({plan.days} días)
              </option>
            ))}
          </select>
        </Form.Item>
        
        <Form.Item
          name="amount"
          label="Monto"
          rules={[{ required: true, message: 'Ingrese el monto' }]}
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
          name="name"
          label="Nombre del Plan"
          rules={[{ required: true, message: 'Ingrese el nombre del plan' }]}
        >
          <Input
            style={{ width: '100%' }}
            placeholder="Ej: Mensual"
          />
        </Form.Item>
        <Form.Item
          name="initDate"
          label="Fecha de Inicio"
          rules={[{ required: true, message: 'Seleccione fecha de inicio' }]}
        >
          <DatePicker 
            style={{ width: '100%' }} 
            format="YYYY-MM-DD"
            onChange={() => {
              const planId = form.getFieldValue('planId');
              if (planId) {
                onPlanChange(planId);
              }
            }}
          />
        </Form.Item>
        
        <Form.Item
          name="finishDate"
          label="Fecha de Finalización"
          rules={[{ required: true, message: 'Seleccione fecha de finalización' }]}
        >
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MembershipForm;