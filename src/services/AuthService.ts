import axios from "axios";
import loginSchema from "../schemas/loginSchema";

class AuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${import.meta.env.VITE_API_BASE_URL}/auth`;
  }

  async login(ci: string, password: string): Promise<string> {
    const userData = loginSchema.safeParse({ ci, password });
    if (!userData.success) {
      return "";
    }
    try {
      const res = await axios.post(this.baseUrl, userData.data);
      return res.status === 200 ? res.data.token : "";
    } catch (error) {
      console.error("Login error:", error);
      return "";
    }
  }
}

export default new AuthService();