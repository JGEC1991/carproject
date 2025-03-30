import React, { useState, useEffect } from 'react';
    import Table from './Table';
    import { useNavigate } from 'react-router-dom';

    const ActivitiesTable = ({ activities, columns, handleDeleteActivity, columnMap }) => {
      const navigate = useNavigate();
      const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
      const [sortedData, setSortedData] = useState([...activities]);
      const [currentPage, setCurrentPage] = useState(1);
      const pageSize = 10;

      useEffect(() => {
        let sortableData = [...activities];
        if (sortConfig.key) {
          sortableData.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (bValue == null) return sortConfig.direction === 'ascending' ? 1 : -1;

            const sortOrder = sortConfig.direction === 'ascending' ? 1 : -1;

            if (typeof aValue === 'string' && typeof bValue === 'string') {
              return aValue.localeCompare(bValue) * sortOrder;
            } else if (aValue < bValue) {
              return -1 * sortOrder;
            } else if (aValue > bValue) {
              return 1 * sortOrder;
            }
            return 0;
          });
        }
        setSortedData(sortableData);
      }, [activities, sortConfig]);

      const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
          direction = 'descending';
        }
        setSortConfig({ key, direction });
      };

      const getSortDirectionIndicator = (name) => {
        if (sortConfig.key !== name) return null;
        return sortConfig.direction === 'ascending' ? '↑' : '↓';
      };

      const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
      };

      const totalPages = Math.ceil(activities.length / pageSize);

      const getCurrentPageData = () => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return sortedData.slice(startIndex, endIndex);
      };

      const renderPaginationControls = () => {
        if (!totalPages || totalPages <= 1) return null;

        return (
          <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
            <div className="flex justify-between flex-1 sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{activities.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * pageSize, activities.length)}
                  </span>{' '}
                  of <span className="font-medium">{activities.length}</span> results
                </p>
              </div>
              <div>
                <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <span className="material-icons text-sm">chevron_left</span>
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                    let pageNumber;

                    // Logic to show correct page numbers around current page
                    if (totalPages <= 5) {
                      pageNumber = idx + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = idx + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + idx;
                    } else {
                      pageNumber = currentPage - 2 + idx;
                    }

                    return pageNumber > 0 && pageNumber <= totalPages ? (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                          ${currentPage === pageNumber
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ) : null;
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <span className="material-icons text-sm">chevron_right</span>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        );
      };

      return (
        <div>
          <Table
            data={getCurrentPageData()}
            columns={columns}
            onView={() => {}}
            onEdit={() => {}}
            onDelete={handleDeleteActivity}
            onRowClick={(activity) => navigate(`/activities/${activity.id}`)}
            className="shadow-md rounded-lg"
            requestSort={requestSort}
            getSortDirectionIndicator={getSortDirectionIndicator}
            renderPaginationControls={renderPaginationControls}
          />
          {renderPaginationControls()}
        </div>
      );
    };

    export default ActivitiesTable;
