import axios from 'axios';

export const fetchJobs = async (keyword) => {
  const response = await axios.get(`https://assingment-dexyai.onrender.com/scrape/${keyword}`);
  //console.log(response.data.jobs);
  
  return response.data.jobs;
};
