import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Modal, FormInstance, Avatar, Tooltip } from 'antd';
import {  FaUserCircle, FaCamera} from 'react-icons/fa';
import { Member } from '../services/MemberService';
import CameraModal from './CameraModal';
import ImageService from '../services/ImageService';
const IMAGES_BASE_URL= import.meta.env.VITE_IMAGES_BASE_URL;

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
  
  const [profileImage, setProfileImage] = useState<string>(editingMember?.photo?.filePath || ''); 
  const [cameraModalVisible, setCameraModalVisible] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  useEffect(() => {
    if (editingMember?.photo?.filePath) {
      setProfileImage(editingMember.photo.filePath);
    } else {
      setProfileImage('');
    }
  }, [editingMember]);
  // Manejar la captura de foto
  const handlePhotoCapture = async (imageFile: File) => {
    try {
      setUploadingImage(true);
      
      // Subir la imagen al servidor
      const uploadedImage = await ImageService.upload(imageFile, editingMember?.id);
      
      // Actualizar la vista previa y guardar la ruta en el formulario
      setProfileImage(uploadedImage.filePath);
      form.setFieldsValue({ photoId: uploadedImage.fileName });
      
      // Cerrar el modal de cámara
      setCameraModalVisible(false);
    } catch (error) {
      console.error('Error al subir la imagen:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    
    <>
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
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Avatar 
              size={100} 
              icon={<FaUserCircle />} 
              src={IMAGES_BASE_URL + profileImage}
              className="cursor-pointer"
            />
            <Tooltip title="Tomar foto">
              <Button 
                type="primary" 
                shape="circle" 
                icon={<FaCamera />} 
                className="absolute bottom-0 right-0"
                onClick={() => setCameraModalVisible(true)}
              />
            </Tooltip>
          </div>
        </div>

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
            rules={[{ required: false, message: 'Por favor ingrese la cedula de identidad' }]}
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
            name="photoId"
            label="Foto de Perfil"
            rules={[{ required: false, message: 'Por favor ingrese foto del usuario' }]}
            className="mb-0"
          >
            <Input placeholder="Ej: image.png" />
          </Form.Item>
          <div className="text-right -mt-6 mb-4">
            <Button 
              type="link" 
              onClick={() => setCameraModalVisible(true)}
              icon={<FaCamera />}
            >
              Usar cámara
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal de cámara */}
      <CameraModal
        visible={cameraModalVisible}
        onCancel={() => setCameraModalVisible(false)}
        onPhotoCapture={handlePhotoCapture}
        loading={uploadingImage}
        memberId={editingMember?.id}
      />
    </>
  );
};

export default MemberForm;