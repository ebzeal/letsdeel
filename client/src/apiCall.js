import axios from "axios";

export const apiInstance = axios.create({
  baseURL: "http://localhost:3001",
});

const makeRequest = async (url, options = { method: "GET" }) => {
  const apiCall = await apiInstance({
    url,
    method: options.method,
    data: options.body,
    params: options.params,
    headers: {
      'profile_id': 4,
    }
  });
  return apiCall.data;
};

export default makeRequest;
