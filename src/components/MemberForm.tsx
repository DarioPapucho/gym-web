import React from 'react';
import { Form, Input, Button, Modal, FormInstance } from 'antd';
import { Member } from '../services/MemberService';

interface MemberFormProps {
  visible: boolean;
  editingMember: Member | null;
  loading: boolean;
  onCancel: () => void;
  onSave: () => void;
  form: FormInstance; // Form instance
}

const MemberForm: React.FC<MemberFormProps> = ({
  visible,
  editingMember,
  loading,
  onCancel,
  onSave,
  form
}) => {
  return (
    <Modal
      title={editingMember ? 'Editar Cliente' : 'Crear Cliente'}
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
        >
          {editingMember ? 'Actualizar' : 'Crear'}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="name"
          label="Nombre"
          rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
        >
          <Input placeholder="Ej: Juan" />
        </Form.Item>
        
        <Form.Item
          name="lastname"
          label="Apellido"
          rules={[{ required: true, message: 'Por favor ingrese el apellido' }]}
        >
          <Input placeholder="Ej: Pérez" />
        </Form.Item>
        
        <Form.Item
          name="username"
          label="Usuario"
          rules={[{ required: true, message: 'Por favor ingrese el nombre de usuario' }]}
        >
          <Input placeholder="Ej: UsuarioJuan" />
        </Form.Item>
        <Form.Item
          name="ci"
          label="Cedula de Identidad"
          rules={[{ required: true, message: 'Por favor ingrese la cedula de identidad' }]}
        >
          <Input placeholder="Ej: 12345678" />
        </Form.Item>
        
        <Form.Item
          name="password"
          label="Contraseña"
          rules={[{ required: !editingMember, message: 'Por favor ingrese la contraseña' }]}
        >
          <Input.Password placeholder="Contraseña" />
        </Form.Item>
        
        <Form.Item
          name="phone"
          label="Teléfono"
          rules={[{ required: true, message: 'Por favor ingrese el teléfono' }]}
        >
          <Input placeholder="Ej: 70123456" />
        </Form.Item>
        <Form.Item
          name="photoUrl"
          label="Foto de Perfil"
          rules={[{ required: true, message: 'Por favor ingrese foto del usuario' }]}
        >
          <Input placeholder="Ej: http://domain.com/photos/image.png" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MemberForm;