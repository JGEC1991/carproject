import React from 'react';

    function CSVColumnMapping({ csvData, columnMappings, availableFields, handleColumnMappingChange }) {
      return (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Mapeo de Columnas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.keys(csvData[0]).map((header) => (
              <div key={header}>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  {header}
                </label>
                <select
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={columnMappings[header] || ''}
                  onChange={(e) => handleColumnMappingChange(header, e.target.value)}
                >
                  <option value="">Seleccionar campo</option>
                  {availableFields.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      }

      export default CSVColumnMapping;
