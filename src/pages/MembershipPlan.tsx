import React, { useState, useEffect } from 'react';
import { message, Form, Input, InputNumber, Modal, Button, Card, Spin } from 'antd';
import { FaPlus } from 'react-icons/fa';
import { ColumnsType } from 'antd/es/table';
import Navbar from "../components/Nav";
import DataTable from "../components/DataTable";
import MembershipPlansService, { MembershipPlan, MembershipPlanInput } from '../services/MembershipPlanService';

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
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      sorter: (a, b) => a.type.localeCompare(b.type),
    },
    {
      title: 'Precio',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `${amount.toFixed(2)} Bs.`,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Días',
      dataIndex: 'days',
      key: 'days',
      sorter: (a, b) => a.days - b.days,
    },
  ];

  // Función para obtener todos los planes de membresía
  const fetchMembershipPlans = async (page: number, pageSize: number) => {
    setTableLoading(true);
    try {
        const data = await MembershipPlansService.getAll(page, pageSize);
        setMembershipPlans(data.data);
      } catch (error) {
        console.error('Error al obtener los planes de membresía:', error);
        message.error('No se pudieron cargar los planes de membresía');
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
    setEditingPlan(plan);
    form.setFieldsValue({
      type: plan.type,
      amount: plan.amount,
      days: plan.days,
    });
    setModalVisible(true);
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
                name="type"
                label="Tipo de Plan"
                rules={[{ required: true, message: 'Por favor ingrese el tipo de plan' }]}
              >
                <Input placeholder="Ej: Mensual, Trimestral, Anual" disabled={loading} />
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
              
              <Form.Item
                name="days"
                label="Duración (días)"
                rules={[{ required: true, message: 'Por favor ingrese la duración en días' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  precision={0}
                  placeholder="Ej: 30, 90, 365"
                  disabled={loading}
                />
              </Form.Item>
            </Form>
          </Spin>
        </Modal>
      </div>
    </>
  );
}

export default MembershipPlanPage;