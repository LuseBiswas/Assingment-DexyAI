import React, { useState, useEffect } from 'react';
import './App.css'
import { fetchJobs } from './api/jobs';
import { Search, Briefcase, Building2, Loader2, Filter, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import JobList from './components/JobList';

function App() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(5);

  // Experience filter states
  const [selectedExperience, setSelectedExperience] = useState("");
  const experienceOptions = [
    "All Experience", 
    "0-1 year", 
    "1-2 years", 
    "2-3 years", 
    "3-5 years", 
    "5+ years"
  ];

  // Formatting and search functions
  const formatKeyword = (input) => {
    const specificKeywords = ['react', 'python', 'java', 'javascript', 'node', 'angular', 'vue', 'ruby','software'];
    const lowercaseInput = input.toLowerCase().trim();

    if (specificKeywords.includes(lowercaseInput)) {
      return `${lowercaseInput}-developer`;
    }

    const developerMatch = lowercaseInput.match(/^(\w+)\s*developer$/);
    if (developerMatch && specificKeywords.includes(developerMatch[1])) {
      return `${developerMatch[1]}-developer`;
    }

    const combinedMatch = lowercaseInput.match(/^(\w+)developer$/);
    if (combinedMatch && specificKeywords.includes(combinedMatch[1])) {
      return `${combinedMatch[1]}-developer`;
    }

    return input;
  };

  // Enhanced error handling function
  const handleErrorResponse = (err) => {
    if (err.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      switch(err.response.status) {
        case 400:
          setError("Bad Request: Invalid search parameters");
          break;
        case 401:
          setError("Unauthorized: Please check your authentication");
          break;
        case 403:
          setError("Forbidden: You don't have permission to access this resource");
          break;
        case 404:
          setError("Not Found: No jobs match your search criteria");
          break;
        case 500:
          setError("Server Error: Internal server problem. Please try again later");
          break;
        case 503:
          setError("Service Unavailable: The job search service is temporarily down");
          break;
        default:
          setError(`Unexpected Error: ${err.response.status} - ${err.response.data.message || 'Unknown error occurred'}`);
      }
    } else if (err.request) {
      // The request was made but no response was received
      setError("Network Error: Unable to connect to the server. Please check your internet connection.");
    } else {
      // Something happened in setting up the request that triggered an Error
      setError(`Request Setup Error: ${err.message}`);
    }
  };

  // Search and filter handler
  const handleSearch = async () => {
    if (!keyword.trim()) {
      setError("Please enter a search keyword");
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentPage(1); // Reset to first page on new search

    try {
      const formattedKeyword = formatKeyword(keyword);
      const data = await fetchJobs(formattedKeyword);
      
      if (!data || data.length === 0) {
        setError("No jobs found for your search. Try a different keyword.");
        setJobs([]);
        setFilteredJobs([]);
      } else {
        setJobs(data);
        // Apply initial filtering
        applyFilters(data);
      }
    } catch (err) {
      handleErrorResponse(err);
      setJobs([]);
      setFilteredJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Experience filtering function
  const applyFilters = (jobsList) => {
    let result = jobsList;

    // Filter by experience if not "All Experience"
    if (selectedExperience && selectedExperience !== "All Experience") {
      result = jobsList.filter(job => {
        const jobExp = job.experience.toLowerCase();
        switch(selectedExperience) {
          case "0-1 year":
            return jobExp.includes("0-1") || jobExp.includes("0") || jobExp.includes("1");
          case "1-2 years":
            return jobExp.includes("1-2") || jobExp.includes("2");
          case "2-3 years":
            return jobExp.includes("2-3") || jobExp.includes("3");
          case "3-5 years":
            return jobExp.includes("3-5") || jobExp.includes("4") || jobExp.includes("5");
          case "5+ years":
            return jobExp.includes("5+") || jobExp.includes("5") || jobExp.includes("6");
          default:
            return jobExp;
        }
      });
    }

    setFilteredJobs(result);
    setCurrentPage(1); // Reset to first page after filtering
  };

  // Pagination logic
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Experience filter handler
  const handleExperienceChange = (exp) => {
    setSelectedExperience(exp);
    applyFilters(jobs);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Job Search via WellFound
        </h1>
        
        {/* Search Input */}
        <div className="mb-6 flex">
          <div className="relative flex-grow mr-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search jobs eg. React-Developer, Python-Developer"
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button 
            onClick={handleSearch} 
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors 
                       flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              'Search'
            )}
          </button>
        </div>

        {/* Experience Filter Dropdown */}
        <div className="mb-4 flex items-center">
          <Filter className="mr-2 text-gray-600" />
          <select 
            value={selectedExperience}
            onChange={(e) => handleExperienceChange(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {experienceOptions.map((exp) => (
              <option key={exp} value={exp}>{exp}</option>
            ))}
          </select>
        </div>

        {/* Enhanced Error Handling */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center" role="alert">
            <AlertCircle className="mr-2 w-6 h-6 text-red-500" />
            <span className="flex-grow">{error}</span>
          </div>
        )}

        {/* Job Listings */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
          </div>
        ) : filteredJobs.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              {filteredJobs.length} Jobs Found
            </h2>
            <div className="space-y-4">
              {currentJobs.map((job, index) => (
                <JobList key={index} job={job} />
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center mt-6 space-x-4">
              <button 
                onClick={() => paginate(currentPage - 1)} 
                disabled={currentPage === 1}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg 
                           disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
              >
                <ChevronLeft className="mr-2" /> Prev
              </button>
              <span className="text-gray-700">
                Page {currentPage} of {Math.ceil(filteredJobs.length / jobsPerPage)}
              </span>
              <button 
                onClick={() => paginate(currentPage + 1)} 
                disabled={currentPage === Math.ceil(filteredJobs.length / jobsPerPage)}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg 
                           disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
              >
                Next <ChevronRight className="ml-2" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8 bg-white rounded-lg shadow-md">
            <AlertCircle className="mx-auto w-12 h-12 text-gray-400 mb-4" />
            <p className="text-lg">
              {error || "No jobs found. Try a different keyword or experience level."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;