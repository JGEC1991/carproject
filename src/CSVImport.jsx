import React, { useState, useEffect } from 'react';
    import Papa from 'papaparse';
    import { supabase } from '../supabaseClient';

    function CSVImport() {
      const [selectedFile, setSelectedFile] = useState(null);
      const [csvData, setCsvData] = useState([]);
      const [columnMappings, setColumnMappings] = useState({});
      const [availableFields, setAvailableFields] = useState([
        'date',
        'vehicle_id',
        'driver_id',
        'activity_type',
        'description',
        'status',
        'amount',
      ]);
      const [validationErrors, setValidationErrors] = useState([]);
      const [uploading, setUploading] = useState(false);
      const [organizationId, setOrganizationId] = useState(null);
      const [importResults, setImportResults] = useState([]);
      const [drivers, setDrivers] = useState([]);
      const [vehicles, setVehicles] = useState([]);

      const spanishToEnglishMap = {
        'Fecha': 'date',
        'Vehiculo': 'vehicle_id',
        'Conductor': 'driver_id',
        'Tipo de actividad': 'activity_type',
        'Descripcion': 'description',
        'Estado': 'status',
        'Monto': 'amount',
      };

      useEffect(() => {
        const fetchOrganizationId = async () => {
          try {
            const { data: authUser, error: authError } = await supabase.auth.getUser();
            if (authError) {
              setError(authError.message);
              return;
            }

            const userId = authUser.user.id;

            const { data: userData, error: orgError } = await supabase
              .from('users')
              .select('organization_id')
              .eq('id', userId)
              .single();

            if (orgError) {
              setError(orgError.message);
              return;
            }

            setOrganizationId(userData?.organization_id || null);
          } catch (error) {
            console.error('Error fetching organization ID:', error.message);
            setError(error.message);
          }
        };

        const fetchDrivers = async () => {
          try {
            const { data, error } = await supabase.from('drivers').select('id, name, role').eq('role', 'user');
            if (error) {
              console.error('Error fetching drivers:', error);
              setError(error.message);
            } else {
              setDrivers(data);
            }
          } catch (err) {
            console.error('Error fetching drivers:', err.message);
            setError(err.message);
          }
        };

        const fetchVehicles = async () => {
          try {
            const { data, error } = await supabase.from('vehicles').select('id, license_plate');
            if (error) {
              console.error('Error fetching vehicles:', error);
              setError(error.message);
            } else {
              setVehicles(data);
            }
          } catch (err) {
            console.error('Error fetching vehicles:', err.message);
            setError(err.message);
          }
        };

        fetchOrganizationId();
        fetchDrivers();
        fetchVehicles();
      }, []);

      useEffect(() => {
        if (csvData.length > 0) {
          // Initialize column mappings with translated headers
          const initialMappings = {};
          Object.keys(csvData[0]).forEach(header => {
            const translatedHeader = spanishToEnglishMap[header] || '';
            initialMappings[header] = translatedHeader;
          });
          setColumnMappings(initialMappings);
        }
      }, [csvData]);

      const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
      };

      const handleImport = () => {
        if (selectedFile) {
          Papa.parse(selectedFile, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              setCsvData(results.data);
            },
            error: (error) => {
              alert('Error parsing CSV: ' + error.message);
            },
          });
        } else {
          alert('Please select a CSV file.');
        }
      };

      const handleColumnMappingChange = (header, field) => {
        setColumnMappings({ ...columnMappings, [header]: field });
      };

      const validateData = () => {
        const errors = [];
        csvData.forEach((row, index) => {
          const rowErrors = {};
          availableFields.forEach(field => {
            const header = Object.keys(columnMappings).find(key => columnMappings[key] === field);
            if (header) {
              const value = row[header];
              // Add validation logic here based on the field
              if (field === 'date' && isNaN(Date.parse(value))) {
                rowErrors[header] = 'Invalid date format';
              }
              if (field === 'amount' && isNaN(Number(value))) {
                rowErrors[header] = 'Invalid amount format';
              }
              if (field === 'driver_id' && !drivers.find(driver => driver.id === value)) {
                rowErrors[header] = 'Invalid driver ID';
              }
              if (field === 'vehicle_id' && !vehicles.find(vehicle => vehicle.id === value)) {
                rowErrors[header] = 'Invalid vehicle ID';
              }
            }
          });
          if (Object.keys(rowErrors).length > 0) {
            errors.push({ row: index + 1, errors: rowErrors });
          }
        });
        setValidationErrors(errors);
        return errors.length === 0;
      };

      const transformData = () => {
        return csvData.map((row, index) => {
          const transformedRow = {};
          const importResult = { row: index + 1, status: 'success', error: null, ...row }; // Initialize result
          Object.keys(columnMappings).forEach(header => {
            const field = columnMappings[header];
            if (field) {
              transformedRow[field] = row[header];
            }
          });
          return { ...transformedRow, importResult }; // Return both transformed row and import result
        });
      };

      const handleSaveMappings = async () => {
        if (validateData()) {
          const transformedWithResults = transformData();
          const transformedData = transformedWithResults.map(item => {
            const { importResult, ...row } = item;
            return row;
          });
          setUploading(true);
          try {
            if (!organizationId) {
              alert('Organization ID not found. Please refresh the page.');
              return;
            }

            // Add organization_id to each transformed row
            const dataWithOrgId = transformedData.map(row => ({
              ...row,
              organization_id: organizationId,
            }));

            const { data, error } = await supabase
              .rpc('import_activities_from_csv', { activities_data: JSON.stringify(dataWithOrgId), org_id: organizationId });

            if (error) {
              alert('Error inserting data: ' + error.message);
              setImportResults(transformedWithResults.map((item) => ({
                ...item.importResult,
                status: 'failed',
                error: error.message,
              })));
            } else {
              console.log('Data inserted successfully:', data);
              alert('Data imported successfully!');
              setImportResults(transformedWithResults.map(item => ({
                ...item.importResult,
                status: 'success',
                error: null,
              })));
            }
          } catch (err) {
            alert('Unexpected error: ' + err.message);
            setImportResults(transformedWithResults.map(item => ({
              ...item.importResult,
              status: 'failed',
              error: err.message,
            })));
          } finally {
            setUploading(false);
          }
        } else {
          alert('Please fix validation errors before saving.');
        }
      };

      const generateCSVErrorLog = () => {
        const csv = Papa.unparse({
          fields: [...Object.keys(columnMappings), 'status', 'error'],
          data: importResults.map(result => {
            const row = {};
            Object.keys(columnMappings).forEach(header => {
              const field = columnMappings[header];
              row[header] = result[field] || '';
            });
            row['status'] = result.status;
            row['error'] = result.error || '';
            return row;
          }),
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'import_results.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      };

      return (
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-semibold mb-4">Importar Actividades desde CSV</h1>
          <div className="mb-4">
            <input type="file" accept=".csv" onChange={handleFileChange} />
          </div>
          <button
            onClick={handleImport}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={!selectedFile}
          >
            Importar
          </button>

          {csvData.length > 0 && (
            <>
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
                      </select>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleSaveMappings}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
                  disabled={uploading}
                >
                  {uploading ? 'Importing...' : 'Guardar Mapeo'}
                </button>
              </div>

              {validationErrors.length > 0 && (
                <div className="mb-4">
                  <h2 className="text-xl font-semibold mb-2 text-red-500">Errores de Validacion</h2>
                  <ul>
                    {validationErrors.map((error) => (
                      <li key={error.row} className="text-red-500">
                        Fila {error.row}:
                        <ul>
                          {Object.entries(error.errors).map(([header, message]) => (
                            <li key={header}>
                              Columna "{header}": {message}
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {importResults.length > 0 && (
                <div className="mb-4">
                  <button
                    onClick={generateCSVErrorLog}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
                  >
                    Descargar Log de Errores
                  </button>
                </div>
              )}

              <div className="overflow-x-auto mt-4">
                <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
                  <thead>
                    <tr>
                      {Object.keys(csvData[0]).map((header) => (
                        <th key={header} className="bg-gray-100 text-left text-gray-600 font-semibold uppercase text-sm py-2 px-3 border-b">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {Object.values(row).map((value, i) => (
                          <td key={i} className="py-2 px-3 border-b">{value}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      );
    }

    export default CSVImport;
