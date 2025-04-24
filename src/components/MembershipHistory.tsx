import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, DatePicker, Popconfirm, message } from 'antd';
import { FaIdCard, FaEdit, FaTrash, FaPrint } from 'react-icons/fa';
import { Member, Membership, MembershipUpdateInput } from '../services/MemberService';
import MembersService from '../services/MemberService';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

dayjs.extend(utc);

interface MembershipHistoryProps {
  visible: boolean;
  selectedMember: Member | null;
  memberships: Membership[];
  onClose: () => void;
}

const MembershipHistory: React.FC<MembershipHistoryProps> = ({
  visible,
  selectedMember,
  memberships,
  onClose
}) => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentMembership, setCurrentMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [form] = Form.useForm();
  // Add a state to track if changes were made
  const [changesMade, setChangesMade] = useState(false);

  const formatDate = (dateString: string) => {
    return dayjs.utc(dateString).format('DD/MM/YYYY');
  };

  // Función para verificar si una membresía está activa
  const isActive = (initDate: string, finishDate: string) => {
    // Convertimos todas las fechas a UTC para comparar correctamente
    const startDate = dayjs.utc(initDate).startOf('day');
    const endDate = dayjs.utc(finishDate).endOf('day');
    const currentDate = dayjs.utc();
    
    // Una membresía está activa cuando la fecha actual está entre la fecha de inicio y fin
    return (currentDate.isAfter(startDate) || currentDate.isSame(startDate, 'day')) && 
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
    
    // Configurar el formulario con los valores originales, asegurando que se utilice UTC
    form.setFieldsValue({
      amount: membership.amount,
      initDate: dayjs.utc(membership.initDate),
      finishDate: dayjs.utc(membership.finishDate),
    });
    
    setEditModalVisible(true);
  };

  // Handle modal close with potential refresh
  const handleModalClose = () => {
    if (changesMade) {
      // If changes were made, refresh the page
      window.location.reload();
    } else {
      // If no changes, just close without refresh
      onClose();
    }
  };

  // Guardar cambios de la membresía
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (currentMembership) {
        setLoading(true);

        // Preparar los datos para la actualización
        const updateData: MembershipUpdateInput = {
          amount: values.amount,
          initDate: dayjs(values.initDate).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
          finishDate: dayjs(values.finishDate).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z',
        };

        // Llamar al servicio para actualizar
        await MembersService.updateMembership(currentMembership.id, updateData);
        
        message.success('Membresía actualizada con éxito');
        // Mark that changes were made
        setChangesMade(true);
        // Cerrar el modal de edición y también el modal principal
        setEditModalVisible(false);
        // Cerrar el modal principal automáticamente
        window.location.reload();
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
      // Mark that changes were made
      setChangesMade(true);
      // Cerrar el modal principal automáticamente y recargar la página
      window.location.reload();
    } catch (error) {
      console.error('Error al eliminar membresía:', error);
      message.error('Error al eliminar la membresía');
    } finally {
      setLoading(false);
    }
  };

  // Nueva función para imprimir recibo
  const handlePrintReceipt = async (membership: Membership) => {
    try {
      setPrintLoading(true);
      
      // Crear el PDF con jsPDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 200] // Ancho típico para impresora térmica
      });
      
      // Imagen de ejemplo (logo)
      // En un entorno real, necesitarías reemplazar esto con tu imagen real
      const logoImage = new Image();
      logoImage.src = '../../public/onixlogo.png';
      doc.addImage(logoImage, 'PNG', 3, 0, 30, 30);
      
      // Nombre del gimnasio
      doc.setFontSize(25);
      doc.setFont('helvetica', 'bold');
      doc.text('ONIX', 44, 15);
      doc.setFontSize(14);
      doc.text('SPORT CENTER', 36, 21);
      doc.setFontSize(12);
      
      // Información del cliente
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Cliente: ${selectedMember?.name} ${selectedMember?.lastname}`, 5, 35);
      doc.text(`CI: ${selectedMember?.ci || 'N/A'}`, 5, 40);
      
      // Información de la membresía
      doc.text('RECIBO DE MEMBRESÍA', 40, 50, { align: 'center' });
      doc.text(`ID Membresía: ${membership.id}`, 5, 60);
      doc.text(`Plan: ${membership.name || 'Estándar'}`, 5, 65);
      doc.text(`Monto: ${membership.amount} Bs.`, 5, 70);
      doc.text(`Fecha Inicio: ${formatDate(membership.initDate)}`, 5, 75);
      doc.text(`Fecha Fin: ${formatDate(membership.finishDate)}`, 5, 80);
      // Fecha de impresión
      const now = dayjs().format('DD/MM/YYYY HH:mm');
      doc.text(`Impreso: ${now}`, 5, 90);
      doc.line(10, 100, 70, 100);
      
      // Guardar el PDF
      const pdfOutput = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfOutput);
      
      // Descargar el PDF
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `recibo_usuario_${selectedMember.ci}_fecha_${now}.pdf`;
      link.click();
      
      // Intentar imprimir en la impresora térmica
      try {
          const printWindow = window.open(pdfUrl);
          if (printWindow) {
            printWindow.onload = function() {
              printWindow.print();
            };
          } else {
            message.warning('No se pudo abrir la ventana de impresión. Solo se ha descargado el PDF.');
          }
        
      } catch (printError) {
        console.error('Error al imprimir:', printError);
        message.warning('No se pudo imprimir directamente. Se ha descargado el PDF.');
      }
      
      message.success('Recibo generado correctamente');
    } catch (error) {
      console.error('Error al generar el recibo:', error);
      message.error('Error al generar el recibo');
    } finally {
      setPrintLoading(false);
    }
  };

  return (
    <>
      <Modal
        title={`Historial de Membresías - ${selectedMember?.name || ''} ${selectedMember?.lastname || ''}`}
        open={visible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
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
                          title="Editar"
                        />
                        <Button 
                          type="text" 
                          icon={<FaPrint />} 
                          onClick={() => handlePrintReceipt(membership)}
                          loading={printLoading}
                          className="text-green-500 mr-2"
                          title="Imprimir recibo"
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
                            title="Eliminar"
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
