import React from 'react';

function VehicleFinances({ finanzas, gps, carOwnership, carPaymentDay, deposit, setGps, setCarOwnership, setCarPaymentDay, setDeposit, financesTimeRange, setFinancesTimeRange, activities }) {

  const calculateFinances = () => {
    let totalRevenue = 0;
    let totalOverdueRevenue = 0;
    let totalExpenses = 0;

    if (activities && Array.isArray(activities)) {
      activities.forEach(activity => {
        if (activity.activity_type === 'Pago de tarifa') {
          if (activity.status === 'Completado') {
            totalRevenue += activity.amount || 0;
          } else if (activity.status === 'Vencido') {
            totalOverdueRevenue += activity.amount || 0;
          }
        } else if (activity.status === 'Completado') {
          totalExpenses += activity.amount || 0;
        }
      });
    }

    return {
      totalRevenue,
      totalOverdueRevenue,
      totalExpenses,
    };
  };

  const calculatedFinances = calculateFinances();

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Finanzas</h3>

      {/* Time Range Filters */}
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setFinancesTimeRange('all')}
          className={`px-4 py-2 rounded-lg ${financesTimeRange === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Historico
        </button>
        <button
          onClick={() => setFinancesTimeRange('currentMonth')}
          className={`px-4 py-2 rounded-lg ${financesTimeRange === 'currentMonth' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Mes actual
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex flex-col items-center justify-center p-4 border rounded-lg shadow-md">
          <span className="material-icons text-green-500 text-3xl">trending_up</span>
          <p className="text-gray-700 font-semibold">Ingresos Totales</p>
          <p className="text-2xl">${calculatedFinances.totalRevenue}</p>
        </div>

        <div className="flex flex-col items-center justify-center p-4 border rounded-lg shadow-md">
          <span className="material-icons text-red-500 text-3xl">warning</span>
          <p className="text-gray-700 font-semibold">Ingresos Vencidos</p>
          <p className="text-2xl">${calculatedFinances.totalOverdueRevenue}</p>
        </div>

        <div className="flex flex-col items-center justify-center p-4 border rounded-lg shadow-md">
          <span className="material-icons text-blue-500 text-3xl">trending_down</span>
          <p className="text-gray-700 font-semibold">Gastos Totales</p>
          <p className="text-2xl">${calculatedFinances.totalExpenses}</p>
        </div>
      </div>

      <div className="mb-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-blue-600"
            checked={gps}
            onChange={(e) => setGps(e.target.checked)}
          />
          <span className="ml-2 text-gray-700">GPS</span>
        </label>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Tipo de propiedad del vehiculo</label>
        <select
          value={carOwnership}
          onChange={(e) => setCarOwnership(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="Propio">Propio</option>
          <option value="Financiado">Financiado</option>
        </select>
      </div>

      {carOwnership === 'Financiado' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Dia de pago del vehiculo</label>
          <input
            type="number"
            value={carPaymentDay}
            onChange={(e) => setCarPaymentDay(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Dia del mes"
          />
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Deposito</label>
        <input
          type="number"
          value={deposit}
          onChange={(e) => setDeposit(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="Deposito"
        />
      </div>
    </div>
  );
}

export default VehicleFinances;
