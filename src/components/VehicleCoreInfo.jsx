import React from 'react';
import { useTranslation } from 'react-i18next';

function VehicleCoreInfo({
  vehicle,
  isEditMode,
  make,
  model,
  color,
  year,
  licensePlate,
  vin,
  mileage,
  status,
  observations,
  vehicleType,
  fuelType,
  transmissionType,
  insuranceProvider,
  insurancePolicyNumber,
  registrationExpiryDate,
  setMake,
  setModel,
  setColor,
  setYear,
  setLicensePlate,
  setVin,
  setMileage,
  setStatus,
  setObservations,
  setVehicleType,
  setFuelType,
  setTransmissionType,
  setInsuranceProvider,
  setInsurancePolicyNumber,
  setRegistrationExpiryDate,
}) {
  const { t } = useTranslation('vehicleRecordCard');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Make and Model */}
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('Marca')}</label>
        {isEditMode ? (
          <input
            type="text"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        ) : (
          <p className="mt-1 text-sm text-gray-900">{make}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('Modelo')}</label>
        {isEditMode ? (
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        ) : (
          <p className="mt-1 text-sm text-gray-900">{model}</p>
        )}
      </div>

      {/* Year and Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('Año')}</label>
        {isEditMode ? (
          <input
            type="text"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        ) : (
          <p className="mt-1 text-sm text-gray-900">{year}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('Color')}</label>
        {isEditMode ? (
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        ) : (
          <p className="mt-1 text-sm text-gray-900">{color}</p>
        )}
      </div>

      {/* License Plate and VIN */}
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('Matricula')}</label>
        {isEditMode ? (
          <input
            type="text"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        ) : (
          <p className="mt-1 text-sm text-gray-900">{licensePlate}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">VIN</label>
        {isEditMode ? (
          <input
            type="text"
            value={vin}
            onChange={(e) => setVin(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        ) : (
          <p className="mt-1 text-sm text-gray-900">{vin}</p>
        )}
      </div>

      {/* Mileage and Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('Kilometraje')}</label>
        {isEditMode ? (
          <input
            type="text"
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        ) : (
          <p className="mt-1 text-sm text-gray-900">{vehicle?.mileage}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('Estado')}</label>
        {isEditMode ? (
          <input
            type="text"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        ) : (
          <p className="mt-1 text-sm text-gray-900">{status}</p>
        )}
      </div>

      {/* Vehicle Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('Tipo de Vehiculo')}</label>
        {isEditMode ? (
          <input
            type="text"
            value={vehicleType || ''}
            onChange={(e) => setVehicleType(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        ) : (
          <p className="mt-1 text-sm text-gray-900">{vehicle?.vehicle_type}</p>
        )}
      </div>

      {/* Fuel Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('Tipo de Combustible')}</label>
        {isEditMode ? (
          <input
            type="text"
            value={fuelType || ''}
            onChange={(e) => setFuelType(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        ) : (
          <p className="mt-1 text-sm text-gray-900">{vehicle?.fuel_type}</p>
        )}
      </div>

      {/* Transmission Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('Tipo de Transmision')}</label>
        {isEditMode ? (
          <input
            type="text"
            value={transmissionType || ''}
            onChange={(e) => setTransmissionType(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        ) : (
          <p className="mt-1 text-sm text-gray-900">{vehicle?.transmission_type}</p>
        )}
      </div>

      {/* Insurance Provider */}
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('Proveedor de Seguro')}</label>
        {isEditMode ? (
          <input
            type="text"
            value={insuranceProvider || ''}
            onChange={(e) => setInsuranceProvider(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        ) : (
          <p className="mt-1 text-sm text-gray-900">{vehicle?.insurance_provider}</p>
        )}
      </div>

      {/* Insurance Policy Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('Numero de Poliza de Seguro')}</label>
        {isEditMode ? (
          <input
            type="text"
            value={insurancePolicyNumber || ''}
            onChange={(e) => setInsurancePolicyNumber(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        ) : (
          <p className="mt-1 text-sm text-gray-900">{vehicle?.insurance_policy_number}</p>
        )}
      </div>

      {/* Registration Expiry Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('Fecha de Vencimiento de Registro')}</label>
        {isEditMode ? (
          <input
            type="date"
            value={registrationExpiryDate || ''}
            onChange={(e) => setRegistrationExpiryDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        ) : (
          <p className="mt-1 text-sm text-gray-900">{vehicle?.registration_expiry_date}</p>
        )}
      </div>

      {/* Observations */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700">{t('Observaciones')}</label>
        {isEditMode ? (
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows="3"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        ) : (
          <p className="mt-1 text-sm text-gray-900">{observations}</p>
        )}
      </div>
    </div>
  );
}

export default VehicleCoreInfo;
