import axios from "axios";
import { z } from "zod";
import Client from "../schemas/Client";

class ClientService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${import.meta.env.VITE_API_BASE_URL}/clients`;
  }

  async createClient(clientData: z.infer<typeof Client>) {
    const token = localStorage.getItem("authGimToken");
    try {
      const response = await axios.post(this.baseUrl, clientData, {
        headers: { 
          "Authorization": `Bearer ${token}` 
        }
      });
      console.log("Client creation response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating client:", error);
      throw error;
    }
  }
  async delete(clientId: number) {
    const token = localStorage.getItem("authGimToken");
    try {
        const response = await axios.delete(`${this.baseUrl}/${clientId}`, {
            headers: { 
              "Authorization": `Bearer ${token}` 
            }
          });
        console.log("Client deletion response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error deleting client:", error);
        throw error;
    }
  }
}

export default new ClientService();