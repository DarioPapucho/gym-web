import axios from "axios";
import loginSchema from "../schemas/loginSchema";

const loginService = async (ci: string, password: string): Promise<string> => {
  const userData = loginSchema.safeParse({ ci, password });

  if (!userData.success){
    return "";
  }
  console.log(userData.data)

  const res = await axios.post(
    "http://20.197.226.113:5202/api/auth",
    userData.data
);

  return res.status === 200 ? res.data.token : "";
};

export default loginService;


