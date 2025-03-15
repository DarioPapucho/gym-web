import axios from "axios";

const deleteEmployee = async (employeeId: number) => {
  const token = localStorage.getItem("authGimToken");

  axios.delete(`http://20.197.226.113:5202/api/clients/${employeeId}`, {
    headers: { Authorization: "Bearer " + token },
  });

  axios
    .get(`http://20.197.226.113:5202/api/clients/${employeeId}`, {
      headers: { Authorization: "Bearer " + token },
    })

    .then((res) => {
      return res.status === 404 ? true : false;
    })
    .catch((err) => {
      return false;
    });
};

export default deleteEmployee;

