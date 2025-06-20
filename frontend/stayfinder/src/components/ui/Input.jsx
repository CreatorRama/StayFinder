import React from 'react';
import PropTypes from 'prop-types';

const Input = ({
  label,
  name,
  register,
  validation,
  error,
  type = 'text',
  placeholder = '',
  className = '',
  ...rest
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        {...(register ? register(name, validation) : { name })}
        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
          error ? 'border-red-500' : 'border'
        }`}
        {...rest}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  register: PropTypes.func,
  validation: PropTypes.object,
  error: PropTypes.object,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

export default Input;