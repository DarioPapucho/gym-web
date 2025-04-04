import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export interface ImageModel {
  id: string;
  fileName: string;
  filePath: string;
}

class ImageService {

  
  /**
   * Obtiene todas las imágenes
   */
  async getAll(): Promise<ImageModel[]> {
    const response = await axios.get<ImageModel[]>(`${API_BASE_URL}/images`);
    return response.data;
  }
  
  /**
   * Sube una imagen al servidor
   * @param imageFile Archivo de imagen
   * @param memberId ID opcional del miembro asociado
   */
  async upload(imageFile: File, memberId?: number): Promise<ImageModel> {
    const formData = new FormData();
    formData.append('Image', imageFile);
    
    // Si se proporciona un ID de miembro, agregarlo al formData
    if (memberId) {
      formData.append('MemberId', memberId.toString());
    }
    
    const response = await axios.post<ImageModel>(`${API_BASE_URL}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  }
  
  /**
   * Elimina una imagen por su ID
   * @param id ID de la imagen
   */
  async delete(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/images${id}`);
  }
}

export default new ImageService();