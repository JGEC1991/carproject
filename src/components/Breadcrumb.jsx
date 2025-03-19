import React from 'react';
import { Link } from 'react-router-dom';

function Breadcrumb({ segments }) {
  return (
    <nav className="text-gray-600 mb-2" aria-label="Breadcrumb">
      <ol className="list-none p-0 inline-flex">
        {segments.map((segment, index) => (
          <li key={index} className="flex items-center">
            {segment.url ? (
              <>
                <Link to={segment.url} className="text-blue-500 hover:text-blue-700">
                  {segment.label}
                </Link>
                <span className="mx-2 text-gray-400">/</span>
              </>
            ) : (
              <span className="text-gray-500">{segment.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
