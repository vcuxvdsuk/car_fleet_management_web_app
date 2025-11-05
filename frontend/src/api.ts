import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000";

axios.defaults.baseURL = baseURL;

export default axios;
