import React from 'react';
import { Link } from 'react-router-dom';

const Table = ({ data, columns, onView, onEdit, onDelete, onRowClick }) => {

  return (
    <div className="overflow-x-auto rounded-lg shadow-md">
      <table className="min-w-full divide-y divide-gray-300 rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
              >
                {column.title}
              </th>
            ))}
            <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-gray-100 transition-colors duration-200 cursor-pointer" onClick={() => onRowClick(row)}>
              {columns.map((column) => (
                <td
                  key={`${row.id}-${column.key}`}
                  className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                >
                  {row[column.key] || '-'}
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link to={`/view/${row.id}`} className="text-blue-500 hover:text-blue-700 mr-2">Ver</Link>
                <Link to={`/edit/${row.id}`} className="text-green-500 hover:text-green-700 mr-2">Editar</Link>
                <button onClick={() => onDelete(row)} className="text-red-500 hover:text-red-700">Borrar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
