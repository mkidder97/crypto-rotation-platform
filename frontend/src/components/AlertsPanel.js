import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { alertsAPI } from '../services/api';
import { format } from 'date-fns';

const AlertsPanel = () => {
  const queryClient = useQueryClient();
  
  const { data, isLoading, error } = useQuery('activeAlerts', alertsAPI.getActiveAlerts);
  
  const resolveMutation = useMutation(
    (alertId) => alertsAPI.resolveAlert(alertId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('activeAlerts');
      },
    }
  );

  const getAlertIcon = (alertType) => {
    switch (alertType) {
      case 'PHASE_TRANSITION':
        return '🔄';
      case 'THRESHOLD_BREACH':
        return '⚠️';
      case 'MARKET_CONDITION':
        return '📊';
      default:
        return '📌';
    }
  };

  const getAlertColor = (alertType) => {
    switch (alertType) {
      case 'PHASE_TRANSITION':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300';
      case 'THRESHOLD_BREACH':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
      case 'MARKET_CONDITION':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Active Alerts</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Active Alerts</h2>
        <div className="text-red-600 dark:text-red-400">
          Error loading alerts: {error.message}
        </div>
      </div>
    );
  }

  const alerts = data?.data || [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Active Alerts</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {alerts.length} active
        </span>
      </div>
      
      {alerts.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">✅</div>
          <p>No active alerts</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg ${getAlertColor(alert.alert_type)} transition-all duration-300`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">{getAlertIcon(alert.alert_type)}</span>
                    <span className="font-semibold text-sm">
                      {alert.alert_type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm mb-1">{alert.message}</p>
                  <p className="text-xs opacity-75">
                    {format(new Date(alert.created_at), 'MMM d, h:mm a')}
                  </p>
                </div>
                <button
                  onClick={() => resolveMutation.mutate(alert.id)}
                  disabled={resolveMutation.isLoading}
                  className="ml-2 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
                  aria-label="Dismiss alert"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;