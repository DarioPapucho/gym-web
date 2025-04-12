import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Tipo para Membership
export interface Membership {
  id: number;
  amount: number;
  initDate: string;
  finishDate: string;
  clientId: number;
}

// Tipo para Client/Member
export interface Member {
  id: number;
  name: string;
  lastname: string;
  username: string;
  password: string;
  phone: string;
  createdAt: string;
  streak: number;
  membership: Membership[];
  lastUpdate: string;
  workoutPlanTemplateId?: number;
  photo?: {
    id: string;
    fileName: string;
    filePath: string;
  };
}

// Tipo para crear un nuevo Member
export interface MemberInput {
  name: string;
  lastname: string;
  username: string;
  password: string;
  phone: string;
  photo?: {
    id: string;
    fileName: string;
    filePath: string;
  };
}

// Tipo para actualizar un Member
export interface MemberUpdateInput {
  name: string;
  lastname: string;
  username: string;
  password: string;
  phone: string;
  streak: number;
  workoutPlanTemplateId?: number;
  lastUpdate: string;
  photo?: {
    id: string;
    fileName: string;
    filePath: string;
  };
}

// Tipo para una nueva membresía de cliente
export interface MembershipInput {
  amount: number;
  name: string;
  initDate: string;
  finishDate: string;
  clientId: number;
}

// Tipo para actualizar una membresía
export interface MembershipUpdateInput {
  amount?: number;
  initDate?: string;
  finishDate?: string;
}

// Obtener token de autenticación
const getAuthToken = (): string => {
  return localStorage.getItem('authGimToken') || '';
};

// Configuración de headers con token de autenticación
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

// Servicio para Members
const MembersService = {
  /**
   * Obtener todos los miembros
   */
  getAll: async (page: number = 1, pageSize: number = 10): Promise<{ data: Member[], total: number }> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/clients`, {
        params: { page, limit: pageSize },
        ...getAuthHeaders(),
      });
      
      // Procesar la respuesta
      const data = response.data;
      return {
        data: Array.isArray(data) ? data : [],
        total: Array.isArray(data) ? data.length : 0,
      };
    } catch (error) {
      console.error('Error al obtener miembros:', error);
      throw error;
    }
  },
  /**
   * Buscar miembros por término (nombre, apellido, Ci.)
   */
  search: async (term: string): Promise<Member[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/clients/search`, {
        params: { term },
        ...getAuthHeaders(),
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error(`Error al buscar miembros con término "${term}":`, error);
      throw error;
    }
  },
  /**
   * Obtener un miembro por ID
   */
  getById: async (id: number): Promise<Member> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/clients/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error(`Error al obtener miembro con ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear un nuevo miembro
   */
  create: async (member: MemberInput): Promise<Member> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/clients`, member, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error al crear miembro:', error);
      throw error;
    }
  },

  /**
   * Actualizar un miembro existente
   */
  update: async (id: number, member: MemberUpdateInput): Promise<Member> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/clients/${id}`, member, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar miembro con ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar un miembro
   */
  delete: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/clients/${id}`, getAuthHeaders());
    } catch (error) {
      console.error(`Error al eliminar miembro con ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Agregar una membresía a un cliente
   */
  addMembership: async (membership: MembershipInput): Promise<Membership> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/memberships`, membership, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error(`Error al agregar membresía al cliente ${membership.clientId}:`, error);
      throw error;
    }
  },

  /**
   * Obtener membresías de un cliente
   */
  getMemberships: async (clientId: number): Promise<Membership[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/client-memberships/${clientId}`, getAuthHeaders());
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error(`Error al obtener membresías del cliente ${clientId}:`, error);
      throw error;
    }
  },

  /**
   * Actualizar una membresía existente
   */
  updateMembership: async (id: number, membershipData: MembershipUpdateInput): Promise<Membership> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/memberships/${id}`, membershipData, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar membresía con ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar una membresía
   */
  deleteMembership: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/memberships/${id}`, getAuthHeaders());
    } catch (error) {
      console.error(`Error al eliminar membresía con ID ${id}:`, error);
      throw error;
    }
  },
};

export default MembersService;