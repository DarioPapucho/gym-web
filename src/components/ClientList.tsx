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
import CargoEmpleado from '../enums/EmployeeOcupation';

const IMAGES_BASE_URL = import.meta.env.VITE_IMAGES_BASE_URL;

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
  const [userRole, setUserRole] = useState<CargoEmpleado>(CargoEmpleado.AdminCompleto); // Default to full access for demo

  // Comprobación de permisos
  const canManageMembers = userRole >= CargoEmpleado.AdminBasico;
  const canManageMemberships = userRole >= CargoEmpleado.AdminMedio;

  // Efecto para cargar rol del usuario desde localStorage o API
  useEffect(() => {
    const getUserRole = () => {
      try {
        // Get user role from localStorage or API
        const storedRole = localStorage.getItem('userRole');
        if (storedRole) {
          setUserRole(parseInt(storedRole));
        } else {
          // Si no hay rol almacenado, mantener el predeterminado
          console.log('No se encontró rol de usuario, usando rol predeterminado');
        }
      } catch (error) {
        console.error('Error al obtener rol de usuario:', error);
      }
    };

    getUserRole();
  }, []);

  // Función para verificar si una membresía está activa
  const isMembershipActive = (initDate: string, finishDate: string) => {
    const startDate = new Date(initDate);
    const endDate = new Date(finishDate);
    const currentDate = new Date();
    
    // Una membresía está activa cuando la fecha actual está entre la fecha de inicio y fin
    return currentDate >= startDate && currentDate <= endDate;
  };

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
      title: 'Teléfono',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Membresía',
      key: 'membership',
      render: (_, record) => {
        const activeMemberships = record.membership && record.membership.length > 0 
          ? record.membership.filter(m => isMembershipActive(m.initDate, m.finishDate)) 
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
          record.membership.some(m => isMembershipActive(m.initDate, m.finishDate));
        
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
    if (!canManageMembers) {
      message.error('No tiene permisos para crear clientes');
      return;
    }
    setEditingMember(null);
    memberForm.resetFields();
    setMemberModalVisible(true);
  };

  // Función para abrir el modal en modo edición
  const handleEditMember = (member: Member) => {
    if (!canManageMembers) {
      message.error('No tiene permisos para editar clientes');
      return;
    }
    setEditingMember(member);
    memberForm.setFieldsValue({
      name: member.name,
      lastname: member.lastname,
      phone: member.phone,
      photoId: member.photo?.fileName,
      // No establecemos la contraseña por seguridad
    });
    setMemberModalVisible(true);
  };

  // Función para eliminar un miembro
  const handleDeleteMember = async (member: Member) => {
    if (!canManageMembers) {
      message.error('No tiene permisos para eliminar clientes');
      return false;
    }

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
    if (!canManageMembers) {
      message.error('No tiene permisos para gestionar clientes');
      return;
    }

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
    if (!canManageMemberships) {
      message.error('No tiene permisos para gestionar membresías');
      return;
    }

    setSelectedMember(member);
    setMembershipModalVisible(true);
    membershipForm.resetFields();
    
    // Establecer valores por defecto
    const today = dayjs();
    membershipForm.setFieldsValue({
      initDate: today,
      quantity: 1
    });
  };

  // Función para manejar cambio de plan
  const handlePlanChange = (planId: number) => {
    const selectedPlan = membershipPlans.find(plan => plan.id === planId);
    if (selectedPlan) {
      const quantity = membershipForm.getFieldValue('quantity') || 1;
      const startDate = membershipForm.getFieldValue('initDate') || dayjs();
      let endDate = dayjs(startDate);
      
      // Manejar planType como número, no como string
      const planType = Number(selectedPlan.type);
      
      // Calcular en base al tipo de plan como número
      switch (planType) {
        case 0: // Session
          // Para sesiones, establecemos una expiración predeterminada (30 días por sesión)
          endDate = endDate.add(30 * quantity, 'day');
          break;
        case 1: // Weekly
          endDate = endDate.add(7 * quantity, 'day');
          break;
        case 2: // Monthly
          endDate = endDate.add(quantity, 'month');
          break;
        case 3: // Yearly
          endDate = endDate.add(quantity, 'year');
          break;
        default:
          // Si el tipo de plan no coincide con ninguno de los anteriores, usar días del plan
          endDate = endDate.add(selectedPlan.days * quantity, 'day');
      }
      
      // Definir los nombres de los tipos de plan
      const planTypeNames = {
        0: 'Sesión',
        1: 'Semanal',
        2: 'Mensual',
        3: 'Anual',
        4: 'Otro'
      };
      
      // Usar el nombre del tipo de plan desde el mapeo
      const planName = planTypeNames[planType] || 'Plan';
      
      membershipForm.setFieldsValue({ 
        name: planName,
        finishDate: endDate,
        amount: selectedPlan.amount * quantity
      });
    }
  };
  // Función para guardar membresía
  const handleSaveMembership = async () => {
    if (!canManageMemberships) {
      message.error('No tiene permisos para gestionar membresías');
      return;
    }

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
  const contextMenuItems = (member: Member) => {
    const items = [];
    
    if (canManageMemberships) {
      items.push({
        key: 'addMembership',
        label: 'Agregar Membresía',
        icon: <FaUserPlus />,
        onClick: () => openMembershipModal(member),
      });
    }
    
    items.push({
      key: 'viewMemberships',
      label: 'Ver todas las membresías',
      icon: <FaHistory />,
      onClick: () => viewAllMemberships(member),
    });
    
    return items;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {userRole === CargoEmpleado.SinAcceso && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded border border-red-300">
          No tiene permisos para acceder a esta sección. Por favor, contacte al administrador.
        </div>
      )}
      
      <Card title="Gestión de Clientes" extra={
        <Button 
          type="primary" 
          onClick={handleCreateMember}
          disabled={tableLoading || !canManageMembers}
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
        userRole={userRole}
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
          userRole={userRole}
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