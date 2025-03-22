import axios from "axios";
import { z } from "zod";
import Client from "../schemas/Client";

const createClient = async (clientData: z.infer<typeof Client>) => {
  const token = localStorage.getItem("authGimToken");
  try {
    const response = await axios.post(
      "http://20.197.226.113:5202/api/clients",
      clientData,
      {headers:{ "Authorization": "Bearer " + token}}
    );
    console.log("esto es lo que responde" + response.data);
    return response.data;
  } catch (error) {
    console.error("Error al crear el cliente:", error);
    throw error;
  }
};

export default createClient;

