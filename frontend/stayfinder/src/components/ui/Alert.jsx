import React from 'react';
import PropTypes from 'prop-types';
import { 
  XMarkIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/react/24/solid';

const Alert = ({ type = 'info', message, className = '', onClose }) => {
  const alertClasses = {
    info: 'bg-blue-50 text-blue-700',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-yellow-50 text-yellow-700',
    error: 'bg-red-50 text-red-700',
  };

  const iconComponents = {
    info: <InformationCircleIcon className="h-5 w-5 text-blue-400" />,
    success: <CheckCircleIcon className="h-5 w-5 text-green-400" />,
    warning: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />,
    error: <XCircleIcon className="h-5 w-5 text-red-400" />,
  };

  return (
    <div className={`rounded-md p-4 mb-4 ${alertClasses[type]} ${className}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {iconComponents[type]}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

Alert.propTypes = {
  type: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  message: PropTypes.string.isRequired,
  className: PropTypes.string,
  onClose: PropTypes.func,
};

export default Alert;