import axios from 'axios';

export const fetchJobs = async (keyword) => {
  const response = await axios.get(`http://127.0.0.1:8000/scrape/${keyword}`);
  //console.log(response.data.jobs);
  
  return response.data.jobs;
};
