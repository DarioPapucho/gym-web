import React, { useEffect, useState } from 'react';
import { Form, InputNumber, DatePicker, Button, Modal, FormInstance, Input, Select } from 'antd';
import { Member } from '../services/MemberService';
import { MembershipPlan } from '../services/MembershipPlanService';
import CargoEmpleado from '../enums/EmployeeOcupation';
import dayjs from 'dayjs';

const { Option } = Select;

// Mapeo de tipos de plan a nombres legibles
const planTypeNames = {
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
  onPlanChange: (planId: number) => void;
  userRole: CargoEmpleado;
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
  // Estado local para controlar UI y valores calculados
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [quantityValue, setQuantityValue] = useState<number>(1);
  const [amountValue, setAmountValue] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<any>(dayjs());
  const [endDate, setEndDate] = useState<any>(null);
  const [planName, setPlanName] = useState<string>('');
  
  // Verificar permisos
  const canManageMemberships = userRole >= CargoEmpleado.AdminMedio;

  // Obtener plan seleccionado
  const getSelectedPlan = (planId: number) => {
    return membershipPlans.find(plan => plan.id === planId);
  };

  // Calcular fecha de finalización
  const calculateEndDate = (plan: MembershipPlan | undefined, quantity: number, start: any) => {
    if (!plan || quantity <= 0 || !start) return null;
    
    let end = dayjs(start);
    const planType = Number(plan.type);
    
    switch (planType) {
      case 0: // Session
        end = end.add(quantity, 'day');
        break;
      case 1: // Weekly
        end = end.add(7 * quantity, 'day');
        break;
      case 2: // Monthly
        end = end.add(quantity, 'month');
        break;
      case 3: // Yearly
        end = end.add(quantity, 'year');
        break;
      default:
        end = end.add(plan.days * quantity, 'day');
    }
    
    return end;
  };
  
  // Calcular monto total
  const calculateAmount = (plan: MembershipPlan | undefined, quantity: number) => {
    if (!plan || quantity <= 0) return null;
    return plan.amount * quantity;
  };

  // Actualizar todos los valores calculados
  const updateCalculatedValues = (planId: number | null, quantity: number, start: any) => {
    if (!planId) return;
    
    const plan = getSelectedPlan(planId);
    if (!plan) return;
    
    // Calcular nuevos valores
    const newEndDate = calculateEndDate(plan, quantity, start);
    const newAmount = calculateAmount(plan, quantity);
    const newPlanName = planTypeNames[Number(plan.type)] || 'Plan';
    
    // Actualizar estados locales
    setEndDate(newEndDate);
    setAmountValue(newAmount);
    setPlanName(newPlanName);
    
    // Actualizar formulario
    form.setFieldsValue({
      finishDate: newEndDate,
      amount: newAmount,
      name: newPlanName
    });
    
    console.log('Valores calculados actualizados:', {
      planId,
      quantity,
      startDate: start.format('YYYY-MM-DD'),
      endDate: newEndDate ? newEndDate.format('YYYY-MM-DD') : null,
      amount: newAmount,
      planName: newPlanName
    });
  };

  // Manejar cambio de plan
  const handlePlanChange = (value: number) => {
    console.log('Plan seleccionado:', value);
    
    // Actualizar estado local
    setSelectedPlanId(value);
    
    // Actualizar valores calculados
    updateCalculatedValues(value, quantityValue, startDate);
    
    // Llamar callback del parent si existe
    if (onPlanChange) {
      onPlanChange(value);
    }
  };

  // Manejar cambio de cantidad
  const handleQuantityChange = (value: number | null) => {
    console.log('Cantidad cambiada a:', value);
    
    if (!value || value <= 0) return;
    
    // Actualizar estado local
    setQuantityValue(value);
    
    // Actualizar valor en formulario
    form.setFieldsValue({ quantity: value });
    
    // Actualizar valores calculados
    updateCalculatedValues(selectedPlanId, value, startDate);
  };

  // Manejar cambio de fecha de inicio
  const handleStartDateChange = (date: any) => {
    if (!date) return;
    
    // Actualizar estado local
    setStartDate(date);
    
    // Actualizar formulario con la nueva fecha
    form.setFieldsValue({ initDate: date });
    
    // Actualizar valores calculados
    updateCalculatedValues(selectedPlanId, quantityValue, date);
  };

  // Inicializar valores al abrir modal
  useEffect(() => {
    if (visible) {
      // Reiniciar estados locales
      const today = dayjs();
      setStartDate(today);
      setQuantityValue(1);
      
      // Establecer valores por defecto en formulario
      form.setFieldsValue({
        initDate: today,
        quantity: 1
      });
      
      // Verificar si ya hay un plan seleccionado
      const existingPlanId = form.getFieldValue('planId');
      if (existingPlanId) {
        setSelectedPlanId(existingPlanId);
        updateCalculatedValues(existingPlanId, 1, today);
      } else {
        setSelectedPlanId(null);
        setEndDate(null);
        setAmountValue(null);
        setPlanName('');
      }
      
      console.log('Formulario inicializado');
    }
  }, [visible, form]);

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
            value={selectedPlanId}
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
            disabled={loading || !canManageMemberships || !selectedPlanId}
            keyboard={true}
            controls={true}
            precision={0}
            value={quantityValue}
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
            value={planName}
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
              value={amountValue}
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
            value={startDate}
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
            value={endDate}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MembershipForm;