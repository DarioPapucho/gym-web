import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export enum MembershipType {
  Sesión = 0,
  Semanal = 1,
  Mensual = 2,
  Anual = 3
}

export interface MembershipPlan {
  id: number;
  name: string;
  type: number;
  amount: number;
}

export interface MembershipPlanInput {
  name: string;
  type: number;
  amount: number;
}

const getAuthToken = (): string => {
  return localStorage.getItem('authGimToken') || '';
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

const MembershipPlansService = {

  getAll: async (page: number = 1, pageSize: number = 10): Promise<{ data: MembershipPlan[], total: number }> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/memberships-plan`, {
        params: { page, limit: pageSize },
        ...getAuthHeaders(),
      });
      
      const data = response.data;
      return {
        data: Array.isArray(data) ? data : [],
        total: Array.isArray(data) ? data.length : 0,
      };
    } catch (error) {
      console.error('Error al obtener planes de membresía:', error);
      throw error;
    }
  },

  getById: async (id: number): Promise<MembershipPlan> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/memberships-plan/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error(`Error al obtener plan de membresía con ID ${id}:`, error);
      throw error;
    }
  },

  create: async (plan: MembershipPlanInput): Promise<MembershipPlan> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/memberships-plan`, plan, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error al crear plan de membresía:', error);
      throw error;
    }
  },

  update: async (id: number, plan: MembershipPlanInput): Promise<MembershipPlan> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/memberships-plan/${id}`, plan, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar plan de membresía con ID ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/memberships-plan/${id}`, getAuthHeaders());
    } catch (error) {
      console.error(`Error al eliminar plan de membresía con ID ${id}:`, error);
      throw error;
    }
  },

  // Función auxiliar para obtener el nombre del tipo de membresía
  getMembershipTypeName: (type: number): string => {
    return MembershipType[type] || 'Desconocido';
  }
};

export default MembershipPlansService;