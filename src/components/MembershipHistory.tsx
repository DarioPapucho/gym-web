import React from 'react';
import { Button, Modal } from 'antd';
import { FaIdCard } from 'react-icons/fa';
import { Member, Membership } from '../services/MemberService';

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
  // Función para formatear fechas UTC correctamente
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    // Crear la fecha en UTC y luego formatearla
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000).toLocaleDateString();
  };

  // Función para verificar si una membresía está activa
  const isActive = (initDate, finishDate) => {
    const startDate = new Date(initDate);
    const endDate = new Date(finishDate);
    const currentDate = new Date();
    
    // Una membresía está activa cuando la fecha actual está entre la fecha de inicio y fin
    return currentDate >= startDate && currentDate <= endDate;
  };

  return (
    <Modal
      title={`Historial de Membresías - ${selectedMember?.name || ''} ${selectedMember?.lastname || ''}`}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Cerrar
        </Button>,
      ]}
      width={700}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default MembershipHistory;