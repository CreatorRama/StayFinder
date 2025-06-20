import React from 'react';

const FormInput = React.forwardRef(({
  label,
  id,
  type = 'text',
  className = '',
  error,
  ...props
}, ref) => {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        type={type}
        className={`block w-full px-3 py-2 border ${error ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

export { FormInput}