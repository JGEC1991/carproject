import React from 'react';

    const ActivitiesActiveFilters = ({ activeFilters }) => {
      return (
        <div className="mb-4">
          <span className="font-bold">Filtros:</span>
          {activeFilters.map((filter) => (
            <span key={filter.label} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
              {filter.label}: {filter.value}
            </span>
          ))}
        </div>
      );
    };

    export default ActivitiesActiveFilters;
