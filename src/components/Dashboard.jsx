import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const StatCard = ({ title, value, icon, color, percentChange, description }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 transition-all duration-300 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className={`rounded-full p-3 ${color || 'bg-blue-100'}`}>
          <span className="material-icons text-2xl">{icon}</span>
        </div>
      </div>
      
      {percentChange !== undefined && (
        <div className="mt-2">
          <span className={`text-sm font-medium ${percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {percentChange >= 0 ? '+' : ''}{percentChange}%
          </span>
          <span className="text-sm text-gray-500 ml-1">from previous period</span>
        </div>
      )}
      
      {description && (
        <p className="mt-3 text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.string,
  color: PropTypes.string,
  percentChange: PropTypes.number,
  description: PropTypes.string
};

const Dashboard = ({ stats, recentItems, activities }) => {
  const { t } = useTranslation('app');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">{t('dashboard')}</h1>
      
      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t('totalVehicles')} 
          value={stats?.vehicles || '0'} 
          icon="directions_car"
          color="bg-blue-100 text-blue-600"
        />
        <StatCard 
          title={t('activeDrivers')} 
          value={stats?.drivers || '0'} 
          icon="people"
          color="bg-green-100 text-green-600"
          percentChange={5.2}
        />
        <StatCard 
          title={t('monthlyRevenue')} 
          value={`$${stats?.revenue || '0'}`} 
          icon="payments"
          color="bg-purple-100 text-purple-600"
          percentChange={12.3}
        />
        <StatCard 
          title={t('upcomingMaintenance')} 
          value={stats?.maintenance || '0'} 
          icon="build"
          color="bg-amber-100 text-amber-600"
          percentChange={-3.1}
        />
      </div>
      
      {/* Recent Activity and Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Items */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-800">{t('recentVehicles')}</h2>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                {t('viewAll')}
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {recentItems && recentItems.length > 0 ? (
              recentItems.map((item, index) => (
                <div key={index} className="px-6 py-4 flex items-center">
                  {item.image && (
                    <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden mr-4">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.title}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {item.subtitle}
                    </p>
                  </div>
                  <div className="ml-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                      ${item.status === 'active' ? 'bg-green-100 text-green-800' : 
                        item.status === 'inactive' ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'}`
                    }>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-4 text-center text-gray-500">
                {t('noRecentItems')}
              </div>
            )}
          </div>
        </div>
        
        {/* Activity Log */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-800">{t('recentActivity')}</h2>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                {t('viewAll')}
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {activities && activities.length > 0 ? (
              activities.map((activity, index) => (
                <div key={index} className="px-6 py-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full 
                        ${activity.type === 'add' ? 'bg-green-100' : 
                          activity.type === 'update' ? 'bg-blue-100' : 
                          activity.type === 'delete' ? 'bg-red-100' : 
                          'bg-gray-100'}`
                      }>
                        <span className="material-icons text-sm">
                          {activity.type === 'add' ? 'add' : 
                           activity.type === 'update' ? 'edit' : 
                           activity.type === 'delete' ? 'delete' : 
                           'info'}
                        </span>
                      </span>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm text-gray-900">
                        {activity.message}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {activity.time} • {activity.user}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-4 text-center text-gray-500">
                {t('noRecentActivity')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

Dashboard.propTypes = {
  stats: PropTypes.shape({
    vehicles: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    drivers: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    revenue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    maintenance: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }),
  recentItems: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      subtitle: PropTypes.string,
      status: PropTypes.string,
      image: PropTypes.string
    })
  ),
  activities: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string,
      message: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
      user: PropTypes.string
    })
  )
};

export default Dashboard;
