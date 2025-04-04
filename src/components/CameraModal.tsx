import React, { useRef, useState, useCallback } from 'react';
import { Modal, Button, Spin } from 'antd';
import { FaCamera, FaUndo, FaCheck } from 'react-icons/fa';
import Webcam from 'react-webcam';

interface CameraModalProps {
  visible: boolean;
  onCancel: () => void;
  onPhotoCapture: (imageFile: File) => void;
  loading?: boolean;
  memberId?: number;
}

const CameraModal: React.FC<CameraModalProps> = ({
  visible,
  onCancel,
  onPhotoCapture,
  loading = false,
  memberId
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Restablecer el estado al cerrar el modal
  const handleCancel = useCallback(() => {
    setCapturedImage(null);
    setCameraError(null);
    onCancel();
  }, [onCancel]);

  // Capturar la foto
  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
    }
  }, [webcamRef]);

  // Reiniciar captura
  const resetCapture = useCallback(() => {
    setCapturedImage(null);
  }, []);

  // Convertir la imagen base64 a archivo y enviarla
  const savePhoto = useCallback(() => {
    if (!capturedImage) return;

    // Convertir base64 a blob
    const byteString = atob(capturedImage.split(',')[1]);
    const mimeString = capturedImage.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([ab], { type: mimeString });
    
    // Crear archivo con nombre único basado en el ID del miembro y timestamp
    const fileName = `profile_${memberId || 'user'}_${Date.now()}.jpg`;
    const file = new File([blob], fileName, { type: mimeString });
    
    // Enviar al componente padre
    onPhotoCapture(file);
    
    // Restablecer
    setCapturedImage(null);
  }, [capturedImage, memberId, onPhotoCapture]);

  // Manejar error de cámara
  const handleCameraError = useCallback((error: string | DOMException) => {
    console.error('Error de cámara:', error);
    setCameraError('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
  }, []);

  return (
    <Modal
      title="Capturar foto de perfil"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={520}
      centered
    >
      <Spin spinning={loading} tip="Guardando foto...">
        <div className="flex flex-col items-center">
          {cameraError ? (
            <div className="p-4 mb-4 text-red-500 bg-red-100 rounded-md">
              {cameraError}
            </div>
          ) : capturedImage ? (
            // Mostrar imagen capturada
            <div className="relative">
              <img 
                src={capturedImage} 
                alt="Foto capturada" 
                className="w-96 h-72 object-cover rounded-md"
              />
            </div>
          ) : (
            // Mostrar webcam
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                width: 384,
                height: 288,
                facingMode: "user"
              }}
              className="rounded-md"
              onUserMediaError={handleCameraError}
            />
          )}

          <div className="flex justify-center space-x-4 mt-4">
            {capturedImage ? (
              <>
                <Button 
                  icon={<FaUndo />}
                  onClick={resetCapture}
                >
                  Volver a tomar
                </Button>
                <Button 
                  type="primary"
                  icon={<FaCheck />}
                  onClick={savePhoto}
                >
                  Guardar foto
                </Button>
              </>
            ) : (
              <Button 
                type="primary" 
                icon={<FaCamera />}
                onClick={capturePhoto}
                disabled={!!cameraError}
              >
                Capturar
              </Button>
            )}
          </div>
        </div>
      </Spin>
    </Modal>
  );
};

export default CameraModal;