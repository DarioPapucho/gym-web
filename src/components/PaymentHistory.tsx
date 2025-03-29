import React from 'react';
import { Modal, Table, Button } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import 'dayjs/locale/es'; // Importar el locale español

// Configurar dayjs para usar español
dayjs.locale('es');

interface Employee {
  id: number;
  name: string;
  lastname: string;
  ci: string;
  phone: string;
  password?: string;
  salary: number;
  lastPayment: string;
  workInDays: number;
  ocupation: string;
}

interface Payment {
  id: number;
  employeeId: number;
  amount: number;
  createdAt: string;
  description: string;
  monthPaid?: string | null;
  employee?: any;
}

interface PaymentHistoryProps {
  visible: boolean;
  selectedEmployee: Employee | null;
  payments: Payment[];
  onClose: () => void;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  visible,
  selectedEmployee,
  payments,
  onClose
}) => {
  const columns: ColumnsType<Payment> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: '10%',
    },
    {
      title: 'Fecha de Registro',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Mes Pagado',
      dataIndex: 'monthPaid',
      key: 'monthPaid',
      render: (date) => date ? dayjs(date).format('MMMM YYYY').charAt(0).toUpperCase() + dayjs(date).format('MMMM YYYY').slice(1) : 'No especificado',
    },
    {
      title: 'Monto',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `${amount.toFixed(2)} Bs.`,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
      width: '40%',
    },
  ];

  return (
    <Modal
      title={`Historial de Pagos - ${selectedEmployee?.name || ''} ${selectedEmployee?.lastname || ''}`}
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Cerrar
        </Button>,
      ]}
    >
      <div className="mt-4">
        <Table
          columns={columns}
          dataSource={payments}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          scroll={{ y: 300 }}
        />
      </div>
    </Modal>
  );
};

export default PaymentHistory;