import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export default ({ Vue }) => {
  Vue.prototype.$axios = axiosInstance;
  Vue.axios = Vue.prototype.$axios;
};

export { axiosInstance };
