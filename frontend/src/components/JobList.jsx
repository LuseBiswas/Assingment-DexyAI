import React from 'react'
import {Briefcase, Building2,} from 'lucide-react';
function JobList({ job }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4 flex items-center space-x-4 hover:shadow-lg transition-shadow duration-300">
      <div className="bg-blue-100 p-3 rounded-full">
        <Briefcase className="text-blue-600 w-6 h-6" />
      </div>
      <div className="flex-grow">
        <h3 className="text-lg font-semibold text-gray-800">{job.title}</h3>
        <div className="flex items-center text-gray-600 space-x-2">
          <Building2 className="w-4 h-4" />
          <span className="text-sm">{job.company}</span>
        </div>
        {job.experience && (
          <p className="text-xs text-gray-500 mt-1">
            Experience: {job.experience}
          </p>
        )}
      </div>
    </div>
  )
}

export default JobList
