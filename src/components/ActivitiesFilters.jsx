import React from 'react';

    const ActivitiesFilters = ({
      filters,
      activityTypeOptions,
      drivers,
      vehicles,
      handleFilterChange,
    }) => {
      return (
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="dateFrom" className="block text-gray-700 text-sm font-bold mb-2">Fecha desde</label>
            <input type="date" id="dateFrom" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div>
            <label htmlFor="dateTo" className="block text-gray-700 text-sm font-bold mb-2">Fecha hasta</label>
            <input type="date" id="dateTo" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div>
            <label htmlFor="activityType" className="block text-gray-700 text-sm font-bold mb-2">Tipo de actividad</label>
            <select id="activityType" name="activityType" value={filters.activityType} onChange={handleFilterChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
              <option value="">Todos</option>
              {activityTypeOptions.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="driverId" className="block text-gray-700 text-sm font-bold mb-2">Conductor</label>
            <select id="driverId" name="driverId" value={filters.driverId} onChange={handleFilterChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
              <option value="">Todos</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>{driver.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="vehicleId" className="block text-gray-700 text-sm font-bold mb-2">Vehiculo</label>
            <select id="vehicleId" name="vehicleId" value={filters.vehicleId} onChange={handleFilterChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
              <option value="">Todos</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>{vehicle.make} {vehicle.model} ({vehicle.license_plate})</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">Estado</label>
            <select id="status" name="status" value={filters.status} onChange={handleFilterChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
              <option value="">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Completado">Completado</option>
              <option value="Vencido">Vencido</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>
        </div>
      );
    };

    export default ActivitiesFilters;
