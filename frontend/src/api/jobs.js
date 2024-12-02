import axios from 'axios';

// Create an axios instance with default configurations
const jobApi = axios.create({
  baseURL: 'https://assingment-dexyai.onrender.com',
  timeout: 10000, // 10 seconds timeout
});

export const fetchJobs = async (keyword) => {
  try {
    // Validate keyword
    if (!keyword || keyword.trim() === '') {
      throw new Error('Invalid search keyword');
    }

    // Make the API call
    const response = await jobApi.get(`/scrape/${encodeURIComponent(keyword)}`);

    // Check for valid response
    if (!response.data || !response.data.jobs) {
      throw new Error('No jobs found');
    }

    // Additional validation of jobs array
    if (response.data.jobs.length === 0) {
      throw new Error('No jobs match your search criteria');
    }

    // Sanitize and validate job data
    const sanitizedJobs = response.data.jobs.map(job => ({
      title: job.title || 'Untitled Job',
      company: job.company || 'Company Not Specified',
      location: job.location || 'Location Not Specified',
      experience: job.experience || 'Experience Not Specified',
      description: job.description || 'No description available',
      link: job.link || '#'
    }));

    return sanitizedJobs;
  } catch (error) {
    // Handle different types of errors
    if (axios.isAxiosError(error)) {
      // Network or server errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        switch (error.response.status) {
          case 404:
            throw new Error('No jobs found for the given search');
          case 500:
            throw new Error('Server error. Please try again later.');
          default:
            throw new Error(`API Error: ${error.response.status}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response received from the server. Check your internet connection.');
      }
    }

    // Throw the original error or a generic error message
    throw error.message || 'An unexpected error occurred while fetching jobs';
  }
};

// Optional: Add a method to retry the fetch in case of network issues
export const fetchJobsWithRetry = async (keyword, retries = 2) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fetchJobs(keyword);
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      // Wait for a short time before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};