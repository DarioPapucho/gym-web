import React, { useState, useEffect } from 'react';
import { message, Form, Card, Button, Spin, Avatar } from 'antd';
import { FaPlus, FaUserPlus, FaHistory, FaUser } from 'react-icons/fa';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import DataTable from './DataTable';
import MemberForm from './MemberForm';
import MembershipForm from './MembershipForm';
import MembershipHistory from './MembershipHistory';
import MembersService, { Member, MemberInput, MemberUpdateInput, MembershipInput } from '../services/MemberService';
import MembershipPlansService, { MembershipPlan } from '../services/MembershipPlanService';
const IMAGES_BASE_URL= import.meta.env.VITE_IMAGES_BASE_URL;
const ClientList: React.FC = () => {
  // Estados
  const [memberForm] = Form.useForm();
  const [membershipForm] = Form.useForm();
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberModalVisible, setMemberModalVisible] = useState<boolean>(false);
  const [membershipModalVisible, setMembershipModalVisible] = useState<boolean>(false);
  const [allMembershipsModalVisible, setAllMembershipsModalVisible] = useState<boolean>(false);
  const [loadingMember, setLoadingMember] = useState<boolean>(false);
  const [loadingMembership, setLoadingMembership] = useState<boolean>(false);
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>([]);
  const [memberMemberships, setMemberMemberships] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [membersData, setMembersData] = useState<Member[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [loadingMembershipPlans, setLoadingMembershipPlans] = useState<boolean>(false);

  // Definición de columnas
  const columns: ColumnsType<Member> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: '8%',
    },
    {
      title: 'Foto',
      key: 'profileImage',
      width: '10%',
      render: (_, record) => (
        <Avatar 
          src={IMAGES_BASE_URL + record.photo?.filePath} 
          icon={<FaUser />} 
          size="large" 
        />
      )
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
      title: 'Usuario',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Teléfono',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Membresía',
      key: 'membership',
      render: (_, record) => {
        const activeMemberships = record.membership && record.membership.length > 0 
          ? record.membership.filter(m => {
              const finishDate = new Date(m.finishDate);
              return finishDate > new Date();
            }) 
          : [];
        
        return activeMemberships.length > 0 
          ? 'Activa' 
          : 'Sin membresía';
      },
      filters: [
        { text: 'Con membresía', value: 'active' },
        { text: 'Sin membresía', value: 'inactive' },
      ],
      onFilter: (value, record) => {
        const hasMembership = record.membership && record.membership.length > 0 &&
          record.membership.some(m => {
            const finishDate = new Date(m.finishDate);
            return finishDate > new Date();
          });
        
        return value === 'active' ? hasMembership : !hasMembership;
      },
    },
  ];

  // Cargar miembros al inicio
  useEffect(() => {
    loadMembers(pagination.current, pagination.pageSize);
  }, []);

  // Efecto para cargar planes de membresía cuando se abre el modal
  useEffect(() => {
    if (membershipModalVisible) {
      fetchMembershipPlans();
    }
  }, [membershipModalVisible]);

  // Función para cargar miembros
  const loadMembers = async (page: number, pageSize: number) => {
    setTableLoading(true);
    try {
      const response = await MembersService.getAll(page, pageSize);
      setMembersData(response.data || []);
      setPagination({
        ...pagination,
        current: page,
        pageSize: pageSize,
        total: response.total || response.data.length,
      });
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      message.error('No se pudieron cargar los clientes');
    } finally {
      setTableLoading(false);
    }
  };

  // Función para manejar cambios en la tabla
  const handleTableChange = (newPagination: any) => {
    loadMembers(newPagination.current, newPagination.pageSize);
  };

  // Función para obtener planes de membresía
  const fetchMembershipPlans = async () => {
    setLoadingMembershipPlans(true);
    try {
      const response = await MembershipPlansService.getAll(1, 100);
      setMembershipPlans(response.data || []);
    } catch (error) {
      console.error('Error al obtener planes de membresía:', error);
      message.error('No se pudieron cargar los planes de membresía');
    } finally {
      setLoadingMembershipPlans(false);
    }
  };

  // Función para abrir el modal en modo creación
  const handleCreateMember = () => {
    setEditingMember(null);
    memberForm.resetFields();
    setMemberModalVisible(true);
  };

  // Función para abrir el modal en modo edición
  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    memberForm.setFieldsValue({
      name: member.name,
      lastname: member.lastname,
      username: member.username,
      phone: member.phone,
      photoId: member.photo?.fileName,
      // No establecemos la contraseña por seguridad
    });
    setMemberModalVisible(true);
  };

  // Función para eliminar un miembro
  const handleDeleteMember = async (member: Member) => {
    setTableLoading(true);
    try {
      await MembersService.delete(member.id);
      message.success('Cliente eliminado correctamente');
      loadMembers(pagination.current, pagination.pageSize);
      return true;
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      message.error('Error al eliminar el cliente');
      setTableLoading(false);
      return false;
    }
  };

  // Función para guardar un miembro (crear o actualizar)
  const handleSaveMember = async () => {
    try {
      await memberForm.validateFields();
      
      setLoadingMember(true);
      const values = memberForm.getFieldsValue();
      
      if (editingMember) {
        // Actualizar miembro existente
        const updateData: MemberUpdateInput = {
          ...values,
          password: values.password || undefined, // Solo enviar si se cambia
          streak: editingMember.streak,
          lastUpdate: new Date().toISOString()
        };
        
        await MembersService.update(editingMember.id, updateData);
        message.success('Cliente actualizado correctamente');
      } else {
        // Crear nuevo miembro
        const newMember: MemberInput = values;
        await MembersService.create(newMember);
        message.success('Cliente creado correctamente');
      }
      
      setMemberModalVisible(false);
      memberForm.resetFields();
      setEditingMember(null);
      loadMembers(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      message.error('Error al guardar el cliente');
    } finally {
      setLoadingMember(false);
    }
  };

  // Función para abrir modal de membresía
  const openMembershipModal = (member: Member) => {
    setSelectedMember(member);
    setMembershipModalVisible(true);
    membershipForm.resetFields();
    
    // Establecer fechas por defecto
    const today = dayjs();
    membershipForm.setFieldsValue({
      initDate: today,
    });
  };

  // Función para manejar cambio de plan
  const handlePlanChange = (planId: number) => {
    const selectedPlan = membershipPlans.find(plan => plan.id === planId);
    if (selectedPlan) {
      const startDate = membershipForm.getFieldValue('initDate') || dayjs();
      const endDate = dayjs(startDate).add(selectedPlan.days, 'day');
      membershipForm.setFieldsValue({ 
        name: selectedPlan.type,
        finishDate: endDate,
        amount: selectedPlan.amount
      });
    }
  };

  // Función para guardar membresía
  const handleSaveMembership = async () => {
    try {
      await membershipForm.validateFields();
      const formValues = membershipForm.getFieldsValue();
      
      if (!selectedMember) return;
      
      setLoadingMembership(true);
      
      const newMembership: MembershipInput = {
        name: formValues.name,
        clientId: selectedMember.id,
        amount: formValues.amount,
        initDate: formValues.initDate.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
        finishDate: formValues.finishDate.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
      };
      
      await MembersService.addMembership(newMembership);
      
      message.success(`Membresía asignada correctamente a ${selectedMember.name}`);
      setMembershipModalVisible(false);
      // Recargar los datos para mostrar la nueva membresía
      loadMembers(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Error al guardar membresía:', error);
      message.error('Error al asignar membresía');
    } finally {
      setLoadingMembership(false);
    }
  };

  // Función para ver todas las membresías
  const viewAllMemberships = (member: Member) => {
    setSelectedMember(member);
    setMemberMemberships(member.membership || []);
    setAllMembershipsModalVisible(true);
  };

  // Elementos para menú contextual
  const contextMenuItems = (member: Member) => [
    {
      key: 'addMembership',
      label: 'Agregar Membresía',
      icon: <FaUserPlus />,
      onClick: () => openMembershipModal(member),
    },
    {
      key: 'viewMemberships',
      label: 'Ver todas las membresías',
      icon: <FaHistory />,
      onClick: () => viewAllMemberships(member),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <Card title="Gestión de Clientes" extra={
        <Button 
          type="primary" 
          onClick={handleCreateMember}
          disabled={tableLoading}
        >
          <FaPlus className="mr-2" /> Nuevo Cliente
        </Button>
      }>
        <DataTable<Member>
          data={membersData}
          columns={columns}
          onEdit={handleEditMember}
          onDelete={handleDeleteMember}
          enableContextMenu={true}
          contextMenuItems={contextMenuItems}
          rowKey="id"
          loading={tableLoading}
          onTableChange={handleTableChange}
          total={pagination.total}
        />
      </Card>
      
      {/* Componentes modales */}
      <MemberForm 
        visible={memberModalVisible}
        editingMember={editingMember}
        loading={loadingMember}
        onCancel={() => setMemberModalVisible(false)}
        onSave={handleSaveMember}
        form={memberForm}
      />
      
      <Spin spinning={loadingMembershipPlans} tip="Cargando planes...">
        <MembershipForm 
          visible={membershipModalVisible}
          selectedMember={selectedMember}
          membershipPlans={membershipPlans}
          loading={loadingMembership}
          form={membershipForm}
          onCancel={() => setMembershipModalVisible(false)}
          onSave={handleSaveMembership}
          onPlanChange={handlePlanChange}
        />
      </Spin>
      
      <MembershipHistory 
        visible={allMembershipsModalVisible}
        selectedMember={selectedMember}
        memberships={memberMemberships}
        onClose={() => setAllMembershipsModalVisible(false)}
      />
    </div>
  );
};

export default ClientList;