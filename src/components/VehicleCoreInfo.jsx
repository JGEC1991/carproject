import React from 'react';
import { useTranslation } from 'react-i18next';

function VehicleCoreInfo({ vehicle, isEditMode, make, model, color, year, licensePlate, vin, mileage, status, observations, setMake, setModel, setColor, setYear, setLicensePlate, setVin, setMileage, setStatus, setObservations }) {
  const { t } = useTranslation('vehicleRecordCard');

  const statusOptions = ["Ocupado", "Disponible", "En mantenimiento"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('Marca')}</label>
        <input
          type="text"
          value={make}
          onChange={(e) => setMake(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder={t('Introducir marca')}
          disabled={!isEditMode}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('Modelo')}</label>
        <input
          type="text"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder={t('Introducir modelo')}
          disabled={!isEditMode}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('Color')}</label>
        <input
          type="text"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder={t('Agregar color')}
          disabled={!isEditMode}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('Año')}</label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder={t('Agregar año')}
          disabled={!isEditMode}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('Matricula')}</label>
        <input
          type="text"
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder={t('Agregar matricula')}
          disabled={!isEditMode}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('Vin')}</label>
        <input
          type="text"
          value={vin}
          onChange={(e) => setVin(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder={t('Agregar vin')}
          disabled={!isEditMode}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('Millaje')}</label>
        <input
          type="number"
          value={mileage}
          onChange={(e) => setMileage(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder={t('Agregar millaje')}
          disabled={!isEditMode}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('Estado')}</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          disabled={!isEditMode}
        >
          <option value="">Seleccionar estado</option>
          {statusOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('Observaciones')}</label>
        <textarea
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          rows={4}
          placeholder={t('Agregar observaciones')}
          disabled={!isEditMode}
        />
      </div>
    </div>
  );
}

export default VehicleCoreInfo;
