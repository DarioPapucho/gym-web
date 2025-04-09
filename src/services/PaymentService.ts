import axios from 'axios';

interface Payment {
  id: number;
  employeeId: number;
  amount: number;
  createdAt: string;
  description: string;
  monthPaid?: string | null;
  employee?: any;
}

interface PaymentInput {
  employeeId: number;
  amount: number;
  description: string;
  monthPaid: string | null;
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

class PaymentService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${import.meta.env.VITE_API_BASE_URL}/payments`;
  }

  async addPayment(paymentData: PaymentInput): Promise<Payment> {
    try {
      const response = await axios.post(this.baseUrl, paymentData, {
        ...getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    }
  }

  async getPaymentsByEmployeeId(employeeId: number): Promise<Payment[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/employee/${employeeId}`, {
        ...getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching payments for employee ${employeeId}:`, error);
      throw error;
    }
  }

  async deletePayment(paymentId: number): Promise<boolean> {
    try {
      await axios.delete(`${this.baseUrl}/${paymentId}`, {
        ...getAuthHeaders(),
      });
      return true;
    } catch (error) {
      console.error("Error deleting payment:", error);
      return false;
    }
  }
}

export default new PaymentService();