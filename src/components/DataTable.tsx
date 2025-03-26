import React, { useState } from 'react';
import { Table, Button, Modal, Menu } from 'antd';
import { FaEdit, FaTrash, FaExclamationCircle } from 'react-icons/fa';
import { TablePaginationConfig } from 'antd/es/table';
import { ColumnsType } from 'antd/es/table';

// Updated Props Interface
interface DataTableProps<T> {
  data: T[];
  columns: ColumnsType<T>;
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
  extraActions?: (record: T) => React.ReactNode;
  enableContextMenu?: boolean;
  contextMenuItems?: (record: T) => ContextMenuItem[];
  rowKey?: string;
  total?: number;
  loading?: boolean;
  onTableChange?: (pagination: TablePaginationConfig) => void;
}

interface ContextMenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

/**
 * DataTable - Generic component for listing, editing, and deleting data
 */
function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  onEdit,
  onDelete,
  extraActions,
  enableContextMenu = false,
  contextMenuItems = () => [],
  rowKey = 'id',
  total,
  loading = false,
  onTableChange,
}: DataTableProps<T>) {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [confirmModalVisible, setConfirmModalVisible] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<T | null>(null);
  const [actionType, setActionType] = useState<'edit' | 'delete' | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [contextMenuRecord, setContextMenuRecord] = useState<T | null>(null);

  // Function to show confirmation modal
  const showConfirmModal = (record: T, type: 'edit' | 'delete') => {
    setSelectedRecord(record);
    setActionType(type);
    setConfirmModalVisible(true);
  };

  // Function to handle confirmed action
  const handleConfirm = () => {
    if (selectedRecord && actionType) {
      if (actionType === 'edit' && onEdit) {
        onEdit(selectedRecord);
      } else if (actionType === 'delete' && onDelete) {
        onDelete(selectedRecord);
      }
    }
    setConfirmModalVisible(false);
    setSelectedRecord(null);
    setActionType(null);
  };

  // Function to cancel modal
  const handleCancel = () => {
    setConfirmModalVisible(false);
    setSelectedRecord(null);
    setActionType(null);
  };

  // Function to handle right-click
  const handleRowContextMenu = (record: T, event: React.MouseEvent) => {
    if (enableContextMenu) {
      event.preventDefault();
      setContextMenuPosition({ x: event.clientX, y: event.clientY });
      setContextMenuRecord(record);
    }
  };

  // Function to close context menu
  const closeContextMenu = () => {
    setContextMenuPosition(null);
    setContextMenuRecord(null);
  };

  // Handle table change (pagination, filters, sorter)
  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPagination({
      current: newPagination.current ?? pagination.current ?? 1,
      pageSize: newPagination.pageSize ?? pagination.pageSize ?? 10,
    });
    
    // Call the external onTableChange if provided
    if (onTableChange) {
      onTableChange(newPagination);
    }
  };

  // Action column
  const actionColumn: ColumnsType<T>[0] = {
    title: 'Acciones',
    key: 'actions',
    render: (_, record) => (
      <div className="action-buttons">
        {onEdit && (
          <Button
            type="primary"
            icon={<FaEdit />}
            size="small"
            onClick={() => showConfirmModal(record, 'edit')}
            style={{ marginRight: 8 }}
          >
            Editar
          </Button>
        )}
        {onDelete && (
          <Button
            danger
            icon={<FaTrash />}
            size="small"
            onClick={() => showConfirmModal(record, 'delete')}
          >
            Eliminar
          </Button>
        )}
        {extraActions && extraActions(record)}
      </div>
    ),
  };

  // Add action column only if actions are defined
  const allColumns = (onEdit || onDelete || extraActions) 
    ? [...columns, actionColumn]
    : columns;

  return (
    <div className="data-table-container">
      <Table
        rowKey={rowKey}
        columns={allColumns}
        dataSource={data}
        pagination={{
          total: total || data.length,
          ...pagination,
          showSizeChanger: true,
        }}
        loading={loading}
        onChange={handleTableChange}
        onRow={(record) => ({
          onContextMenu: (event) => handleRowContextMenu(record, event),
        })}
      />

      {/* Confirmation Modal */}
      <Modal
        title={
          <>
            <FaExclamationCircle style={{ marginRight: 8, color: 'orange' }} />
            {actionType === 'edit' ? 'Confirmar Edición' : 'Confirmar Eliminación'}
          </>
        }
        open={confirmModalVisible}
        onOk={handleConfirm}
        onCancel={handleCancel}
        okText={actionType === 'edit' ? 'Editar' : 'Eliminar'}
        cancelText="Cancelar"
      >
        <p>
          {actionType === 'edit'
            ? '¿Está seguro que desea editar este registro?'
            : '¿Está seguro que desea eliminar este registro? Esta acción no se puede deshacer.'}
        </p>
      </Modal>

      {/* Context Menu */}
      {contextMenuPosition && contextMenuRecord && (
        <div
          style={{
            position: 'fixed',
            top: contextMenuPosition.y,
            left: contextMenuPosition.x,
            background: 'white',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            borderRadius: '4px',
            zIndex: 1000,
          }}
        >
          <Menu onClick={closeContextMenu}>
            {contextMenuItems(contextMenuRecord).map(item => (
              <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick}>
                {item.label}
              </Menu.Item>
            ))}
          </Menu>
        </div>
      )}

      {/* Background layer to close context menu */}
      {contextMenuPosition && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          onClick={closeContextMenu}
        />
      )}
    </div>
  );
}

export default DataTable;