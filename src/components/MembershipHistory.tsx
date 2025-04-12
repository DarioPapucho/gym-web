import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, DatePicker, Popconfirm, message } from 'antd';
import { FaIdCard, FaEdit, FaTrash } from 'react-icons/fa';
import { Member, Membership, MembershipUpdateInput } from '../services/MemberService';
import MembersService from '../services/MemberService';
import dayjs from 'dayjs';

interface MembershipHistoryProps {
  visible: boolean;
  selectedMember: Member | null;
  memberships: Membership[];
  onClose: () => void;
  onMembershipUpdated: () => void;
}

const MembershipHistory: React.FC<MembershipHistoryProps> = ({
  visible,
  selectedMember,
  memberships,
  onClose,
  onMembershipUpdated
}) => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentMembership, setCurrentMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Función para formatear fechas correctamente
  const formatDate = (dateString: string) => {
    // Usar dayjs para manejar las fechas
    return dayjs(dateString).format('DD/MM/YYYY');
  };

  // Función para verificar si una membresía está activa
  const isActive = (initDate: string, finishDate: string) => {
    // Usar dayjs para comparar fechas
    const startDate = dayjs(initDate).startOf('day');
    const endDate = dayjs(finishDate).endOf('day');
    const currentDate = dayjs();
    
    // Una membresía está activa cuando la fecha actual está entre la fecha de inicio y fin
    return currentDate.isAfter(startDate) || currentDate.isSame(startDate, 'day') && 
           (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day'));
  };

  // Estado para almacenar la posición del botón de editar
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });

  // Abrir el modal de edición en la posición del botón
  const handleEdit = (membership: Membership, event: React.MouseEvent) => {
    // Obtener la posición del click
    const { clientY } = event;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const top = clientY + scrollTop - 200; // Ajustar la posición vertical
    
    setButtonPosition({ top, left: 0 });
    setCurrentMembership(membership);
    form.setFieldsValue({
      amount: membership.amount,
      initDate: dayjs(membership.initDate),
      finishDate: dayjs(membership.finishDate),
    });
    setEditModalVisible(true);
  };

  // Guardar cambios de la membresía
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (currentMembership) {
        setLoading(true);

        // Preparar los datos para la actualización
        // Usar formato ISO completo para las fechas como requiere el backend
        const updateData: MembershipUpdateInput = {
          amount: values.amount,
          initDate: dayjs(values.initDate).toISOString(),
          finishDate: dayjs(values.finishDate).toISOString(),
        };

        // Llamar al servicio para actualizar
        await MembersService.updateMembership(currentMembership.id, updateData);
        
        message.success('Membresía actualizada con éxito');
        // Cerrar ambos modales
        setEditModalVisible(false);
        onClose(); // Cerrar el modal de historial
        onMembershipUpdated(); // Notificar que se actualizó para recargar los datos
      }
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      message.error('Error al actualizar la membresía');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar membresía
  const handleDelete = async (membershipId: number) => {
    try {
      setLoading(true);
      await MembersService.deleteMembership(membershipId);
      message.success('Membresía eliminada con éxito');
      // Cerrar el modal de historial
      onClose();
      onMembershipUpdated(); // Notificar que se eliminó para recargar los datos
    } catch (error) {
      console.error('Error al eliminar membresía:', error);
      message.error('Error al eliminar la membresía');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        title={`Historial de Membresías - ${selectedMember?.name || ''} ${selectedMember?.lastname || ''}`}
        open={visible}
        onCancel={onClose}
        footer={[
          <Button key="close" onClick={onClose}>
            Cerrar
          </Button>,
        ]}
        width={800}
      >
        <div className="memberships-history">
          {memberships.length === 0 ? (
            <div className="text-center p-4">
              <FaIdCard className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Este cliente no tiene membresías registradas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 border-b text-left">ID</th>
                    <th className="py-2 px-4 border-b text-left">Monto</th>
                    <th className="py-2 px-4 border-b text-left">Fecha Inicio</th>
                    <th className="py-2 px-4 border-b text-left">Fecha Fin</th>
                    <th className="py-2 px-4 border-b text-left">Estado</th>
                    <th className="py-2 px-4 border-b text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {memberships.map(membership => (
                    <tr key={membership.id}>
                      <td className="py-2 px-4 border-b">{membership.id}</td>
                      <td className="py-2 px-4 border-b">{membership.amount} Bs.</td>
                      <td className="py-2 px-4 border-b">
                        {formatDate(membership.initDate)}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {formatDate(membership.finishDate)}
                      </td>
                      <td className="py-2 px-4 border-b">
                        <span className={`px-2 py-1 rounded ${isActive(membership.initDate, membership.finishDate) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {isActive(membership.initDate, membership.finishDate) ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="py-2 px-4 border-b">
                        <Button 
                          type="text" 
                          icon={<FaEdit />} 
                          onClick={(e) => handleEdit(membership, e)}
                          className="text-blue-500 mr-2"
                        />
                        <Popconfirm
                          title="¿Estás seguro de eliminar esta membresía?"
                          onConfirm={() => handleDelete(membership.id)}
                          okText="Sí"
                          cancelText="No"
                        >
                          <Button 
                            type="text" 
                            icon={<FaTrash />} 
                            className="text-red-500"
                          />
                        </Popconfirm>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal para editar membresía */}
      <Modal
        title="Editar Membresía"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        destroyOnClose={true}
        maskClosable={false}
        style={{ top: buttonPosition.top }}
        footer={[
          <Button key="cancel" onClick={() => setEditModalVisible(false)}>
            Cancelar
          </Button>,
          <Button 
            key="save" 
            type="primary" 
            onClick={handleSave}
            loading={loading}
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
            label="Monto (Bs.)"
            rules={[{ required: true, message: 'Por favor ingresa el monto' }]}
          >
            <Input type="number" />
          </Form.Item>
          
          <Form.Item
            name="initDate"
            label="Fecha de inicio"
            rules={[{ required: true, message: 'Por favor selecciona la fecha de inicio' }]}
          >
            <DatePicker 
              format="DD/MM/YYYY" 
              style={{ width: '100%' }} 
            />
          </Form.Item>
          
          <Form.Item
            name="finishDate"
            label="Fecha de fin"
            rules={[{ required: true, message: 'Por favor selecciona la fecha de fin' }]}
          >
            <DatePicker 
              format="DD/MM/YYYY" 
              style={{ width: '100%' }} 
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default MembershipHistory;