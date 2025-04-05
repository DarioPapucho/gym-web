import React, { useState, useEffect } from 'react';
import { message, Form, Input, InputNumber, Modal, Button, Card, Spin, Select } from 'antd';
import { FaPlus } from 'react-icons/fa';
import { ColumnsType } from 'antd/es/table';
import Navbar from "../components/Nav";
import DataTable from "../components/DataTable";
import MembershipPlansService, { MembershipPlan, MembershipPlanInput, MembershipType } from '../services/MembershipPlanService';

function MembershipPlanPage() {
  // Estados
  const [form] = Form.useForm();
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>([]);

  // Definición de columnas
  const columns: ColumnsType<MembershipPlan> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: '10%',
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      render: (name) => name || 'Sin nombre',
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        if (type === undefined || type === null) return 'No definido';
        return MembershipPlansService.getMembershipTypeName(Number(type));
      },
      sorter: (a, b) => {
        const typeA = a.type === undefined || a.type === null ? -1 : Number(a.type);
        const typeB = b.type === undefined || b.type === null ? -1 : Number(b.type);
        return typeA - typeB;
      },
    },
    {
      title: 'Precio',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => {
        if (amount === undefined || amount === null) return '0.00 Bs.';
        return `${Number(amount).toFixed(2)} Bs.`;
      },
      sorter: (a, b) => {
        const amountA = a.amount === undefined || a.amount === null ? 0 : Number(a.amount);
        const amountB = b.amount === undefined || b.amount === null ? 0 : Number(b.amount);
        return amountA - amountB;
      },
    },
  ];

  // Función para obtener todos los planes de membresía
  const fetchMembershipPlans = async (page: number, pageSize: number) => {
    setTableLoading(true);
    try {
      const data = await MembershipPlansService.getAll(page, pageSize);
      
      // Verificar que los datos recibidos sean válidos
      if (Array.isArray(data.data)) {
        // Asegurarse de que todos los campos necesarios existan
        const validatedData = data.data.map(plan => ({
          id: plan.id || 0,
          name: plan.name || '',
          type: plan.type !== undefined ? Number(plan.type) : 0,
          amount: plan.amount !== undefined ? Number(plan.amount) : 0
        }));
        
        setMembershipPlans(validatedData);
      } else {
        console.error('Formato de datos inválido:', data);
        setMembershipPlans([]);
        message.error('Los datos recibidos tienen un formato inválido');
      }
    } catch (error) {
      console.error('Error al obtener los planes de membresía:', error);
      message.error('No se pudieron cargar los planes de membresía');
      setMembershipPlans([]);
    } finally {
      setTableLoading(false);
    }
  };
  
  useEffect(() => {
    fetchMembershipPlans(1, 10);
  }, []);

  // Función para abrir el modal en modo creación
  const handleCreate = () => {
    setEditingPlan(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Función para abrir el modal en modo edición
  const handleEdit = (plan: MembershipPlan) => {
    try {
      // Validar que el plan tenga todos los campos necesarios
      const validatedPlan = {
        ...plan,
        id: plan.id || 0,
        name: plan.name || '',
        type: plan.type !== undefined ? Number(plan.type) : 0,
        amount: plan.amount !== undefined ? Number(plan.amount) : 0
      };
      
      setEditingPlan(validatedPlan);
      
      // Establecer los valores en el formulario
      form.setFieldsValue({
        name: validatedPlan.name,
        type: validatedPlan.type,
        amount: validatedPlan.amount,
      });
      
      setModalVisible(true);
    } catch (error) {
      console.error('Error al editar el plan:', error);
      message.error('No se pudo editar el plan');
    }
  };

  // Función para eliminar un plan
  const handleDelete = async (plan: MembershipPlan) => {
    setTableLoading(true);
    try {
      await MembershipPlansService.delete(plan.id);
      message.success('Plan de membresía eliminado correctamente');
      setMembershipPlans(membershipPlans.filter(p => p.id !== plan.id)); 
      return true; // Indica éxito para que la tabla se actualice
    } catch (error) {
      message.error('Error al eliminar el plan de membresía');
      return false;
    } finally {
      setTableLoading(false);
    }
  };

  // Función para guardar un plan (crear o actualizar)
  const handleSave = async () => {
    try {
      await form.validateFields();
      setLoading(true);
      
      const values = form.getFieldsValue() as MembershipPlanInput;
      let updatedPlans;
      if (editingPlan) {
        // Actualizar plan existente
        await MembershipPlansService.update(editingPlan.id, values);
        updatedPlans = membershipPlans.map((plan) =>
            plan.id === editingPlan.id ? { ...plan, ...values } : plan
          );  
        message.success('Plan de membresía actualizado correctamente');
      } else {
        // Crear nuevo plan
        const newMembershipPlan = await MembershipPlansService.create(values);
        updatedPlans = [...membershipPlans, newMembershipPlan];
        message.success('Plan de membresía creado correctamente');
      }
      setMembershipPlans(updatedPlans);
      setModalVisible(false);
      form.resetFields();
      setEditingPlan(null);
      
      // La tabla se actualizará automáticamente en el siguiente render
    } catch (error) {
      console.error('Error al guardar plan:', error);
      message.error('Error al guardar el plan de membresía');
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar cambios de página
  const handleTableChange = (pagination) => {
    fetchMembershipPlans(pagination.current, pagination.pageSize);
  };

  // Obtener opciones para el selector de tipo de membresía
  const membershipTypeOptions = Object.entries(MembershipType)
    .filter(([key]) => isNaN(Number(key))) // Filtra solo los nombres, no los valores numéricos
    .map(([key, value]) => ({
      label: key,
      value: Number(value), // Asegurarse de que el valor sea un número
    }));

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <Card title="Planes de Membresía" extra={
          <Button 
            type="primary" 
            onClick={handleCreate}
            disabled={tableLoading}
          >
            <FaPlus className="mr-2" /> Nuevo Plan
          </Button>
        }>
          <DataTable<MembershipPlan>
            data={membershipPlans}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            rowKey="id"
            loading={tableLoading}
            onChange={handleTableChange}
          />
        </Card>
        
        {/* Modal para crear/editar planes */}
        <Modal
          title={editingPlan ? 'Editar Plan de Membresía' : 'Crear Plan de Membresía'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setModalVisible(false)} disabled={loading}>
              Cancelar
            </Button>,
            <Button 
              key="submit" 
              type="primary" 
              loading={loading} 
              onClick={handleSave}
            >
              {editingPlan ? 'Actualizar' : 'Crear'}
            </Button>,
          ]}
        >
          <Spin spinning={loading} tip="Guardando...">
            <Form
              form={form}
              layout="vertical"
            >
              <Form.Item
                name="name"
                label="Nombre del Plan"
                rules={[{ required: true, message: 'Por favor ingrese el nombre del plan' }]}
              >
                <Input placeholder="Ej: Mensual - preinscripción" disabled={loading} />
              </Form.Item>
              
              <Form.Item
                name="type"
                label="Tipo de Plan"
                rules={[{ required: true, message: 'Por favor seleccione el tipo de plan' }]}
              >
                <Select 
                  placeholder="Seleccione un tipo de membresía"
                  disabled={loading}
                  options={membershipTypeOptions}
                />
              </Form.Item>
              
              <Form.Item
                name="amount"
                label="Precio"
                rules={[{ required: true, message: 'Por favor ingrese el precio' }]}
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
            </Form>
          </Spin>
        </Modal>
      </div>
    </>
  );
}

export default MembershipPlanPage;