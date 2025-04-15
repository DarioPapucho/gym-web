import React, { useEffect, useState } from 'react';
import { Form, InputNumber, DatePicker, Button, Modal, FormInstance, Input, Select } from 'antd';
import { Member } from '../services/MemberService';
import { MembershipPlan } from '../services/MembershipPlanService';
import CargoEmpleado from '../enums/EmployeeOcupation';
import dayjs from 'dayjs';

const { Option } = Select;

// Mapeo de tipos de plan a nombres legibles
const PLAN_TYPE_NAMES = {
  0: 'Sesión',
  1: 'Semanal',
  2: 'Mensual',
  3: 'Anual',
  4: 'Otro'
};

interface MembershipFormProps {
  visible: boolean;
  selectedMember: Member | null;
  membershipPlans: MembershipPlan[];
  loading: boolean;
  form: FormInstance;
  onCancel: () => void;
  onSave: () => void;
  onPlanChange?: (planId: number) => void;
  userRole: CargoEmpleado;
}

interface FormState {
  planId: number | null;
  quantity: number;
  name: string;
  amount: number | null;
  initDate: dayjs.Dayjs;
  finishDate: dayjs.Dayjs | null;
}

const MembershipForm: React.FC<MembershipFormProps> = ({
  visible,
  selectedMember,
  membershipPlans,
  loading,
  form,
  onCancel,
  onSave,
  onPlanChange,
  userRole
}) => {
  // Estado unificado para el formulario
  const [formState, setFormState] = useState<FormState>({
    planId: null,
    quantity: 1,
    name: '',
    amount: null,
    initDate: dayjs(),
    finishDate: null
  });
  
  // Verificar permisos
  const canManageMemberships = userRole >= CargoEmpleado.AdminMedio;

  // Obtener plan seleccionado
  const getSelectedPlan = (planId: number | null) => {
    if (!planId) return undefined;
    return membershipPlans.find(plan => plan.id === planId);
  };

  // Calcular fecha de finalización
  const calculateEndDate = (planId: number | null, quantity: number, startDate: dayjs.Dayjs): dayjs.Dayjs | null => {
    const plan = getSelectedPlan(planId);
    if (!plan || quantity <= 0 || !startDate) return null;
    
    let endDate = dayjs(startDate);
    const planType = Number(plan.type);
    
    switch (planType) {
      case 0: // Session
        endDate = endDate.add(quantity, 'day').subtract(1, 'day');
        break;
      case 1: // Weekly
        endDate = endDate.add(7 * quantity, 'day').subtract(1, 'day');
        break;
      case 2: // Monthly
        endDate = endDate.add(quantity, 'month').subtract(1, 'day');
        break;
      case 3: // Yearly
        endDate = endDate.add(quantity, 'year').subtract(1, 'day');
        break;
      default:
        endDate = endDate.add(plan.days * quantity, 'day').subtract(1, 'day');
    }
    
    return endDate;
  };
  
  // Calcular monto total
  const calculateAmount = (planId: number | null, quantity: number): number | null => {
    const plan = getSelectedPlan(planId);
    if (!plan || quantity <= 0) return null;
    return plan.amount * quantity;
  };

  // Actualizar el estado del formulario y los campos calculados
  const updateFormState = (updates: Partial<FormState>) => {
    // Crear el nuevo estado combinando el actual con las actualizaciones
    const newState = { ...formState, ...updates };
    
    // Siempre recalcular valores derivados cuando hay cambios
    const plan = getSelectedPlan(newState.planId);
    
    // Actualizar nombre del plan si hay un plan seleccionado
    if (plan) {
      newState.name = PLAN_TYPE_NAMES[Number(plan.type)] || 'Plan';
      
      // Recalcular monto
      newState.amount = calculateAmount(newState.planId, newState.quantity);
    }
    
    // Recalcular fecha fin siempre que tengamos un plan seleccionado
    if (newState.planId) {
      newState.finishDate = calculateEndDate(
        newState.planId,
        newState.quantity,
        newState.initDate
      );
    }
    
    // Actualizar el estado local primero
    setFormState(newState);
    
    // Forzar la actualización del formulario usando un timeout para garantizar
    // que ocurra después de la actualización del estado de React
    setTimeout(() => {
      // Establecer campos explícitamente para asegurar que se actualicen todos
      form.setFieldsValue({
        planId: newState.planId,
        quantity: newState.quantity,
        name: newState.name,
        amount: newState.amount,
        initDate: newState.initDate,
        finishDate: newState.finishDate
      });
      
      console.log('Form values después de actualizar:', form.getFieldsValue());
    }, 0);
    
    // Debug info
    console.log('Form state updated:', newState);
  };

  // Manejador para cambio de plan
  const handlePlanChange = (planId: number) => {
    console.log('Plan seleccionado:', planId);
    
    // Forzar la actualización completa con el nuevo planId
    updateFormState({ 
      planId: planId 
    });
    
    // Llamar callback del parent si existe
    if (onPlanChange) {
      onPlanChange(planId);
    }
  };

  // Manejador para cambio de cantidad
  const handleQuantityChange = (quantity: number | null) => {
    if (!quantity || quantity <= 0) return;
    updateFormState({ quantity });
  };

  // Manejador para cambio de fecha de inicio
  const handleStartDateChange = (date: dayjs.Dayjs | null) => {
    if (!date) return;
    updateFormState({ initDate: date });
  };

  // Inicializar valores al abrir modal
  useEffect(() => {
    if (visible) {
      const today = dayjs();
      
      // Reiniciar estado del formulario
      const initialState: FormState = {
        planId: null,
        quantity: 1,
        name: '',
        amount: null,
        initDate: today,
        finishDate: null
      };
      
      // Verificar si hay un plan preseleccionado en el formulario
      const existingPlanId = form.getFieldValue('planId');
      if (existingPlanId) {
        // En lugar de actualizar directamente, usamos updateFormState
        // para asegurar cálculos consistentes
        setFormState(initialState); // Primero establecemos el estado inicial
        
        // Luego actualizamos con el planId, que desencadenará todos los cálculos necesarios
        setTimeout(() => {
          updateFormState({ planId: existingPlanId });
        }, 0);
      } else {
        // Si no hay plan preseleccionado, solo establecemos el estado inicial
        setFormState(initialState);
        form.setFieldsValue(initialState);
      }
      
      console.log('Form initialized');
    }
  }, [visible, form, membershipPlans]);

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
          disabled={!canManageMemberships}
        >
          Guardar
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={formState}
      >
        <Form.Item
          name="planId"
          label="Plan de Membresía"
          rules={[{ required: true, message: 'Seleccione un plan de membresía' }]}
        >
          <Select
            placeholder="Seleccione un plan"
            onChange={handlePlanChange}
            disabled={loading || !canManageMemberships}
            value={formState.planId}
          >
            {membershipPlans.map(plan => (
              <Option key={plan.id} value={plan.id}>
                {plan.name} - {plan.amount} Bs.
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item
          name="quantity"
          label="Cantidad"
          rules={[{ required: true, message: 'Ingrese la cantidad' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={1}
            placeholder="Cantidad"
            onChange={handleQuantityChange}
            disabled={loading || !canManageMemberships || !formState.planId}
            keyboard={true}
            controls={true}
            precision={0}
            value={formState.quantity}
          />
        </Form.Item>
        
        <Form.Item
          name="name"
          label="Nombre del Plan"
          rules={[{ required: true, message: 'Ingrese el nombre del plan' }]}
        >
          <Input
            style={{ width: '100%' }}
            placeholder="Ej: Mensual"
            disabled={true}
            value={formState.name}
          />
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
              disabled={true}
              value={formState.amount}
              formatter={(value) => value !== undefined ? `${value}` : ''}
            />
            <span>Bs.</span>
          </div>
        </Form.Item>
        
        <Form.Item
          name="initDate"
          label="Fecha de Inicio"
          rules={[{ required: true, message: 'Seleccione fecha de inicio' }]}
        >
          <DatePicker 
            style={{ width: '100%' }} 
            format="YYYY-MM-DD"
            onChange={handleStartDateChange}
            disabled={loading || !canManageMemberships}
            value={formState.initDate}
          />
        </Form.Item>
        
        <Form.Item
          name="finishDate"
          label="Fecha de Finalización"
          rules={[{ required: true, message: 'La fecha de finalización es requerida' }]}
        >
          <DatePicker 
            style={{ width: '100%' }} 
            format="YYYY-MM-DD" 
            disabled={true}
            value={formState.finishDate}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MembershipForm;