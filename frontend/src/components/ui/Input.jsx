import React, { forwardRef } from 'react';

/**
 * Reusable Input Component FloverArts_
 * Desain bersih editorial dengan border subtil (#E8E0E5), sudut rounded-md,
 * ring fokus aksesibel, dan tipografi Roboto untuk input data.
 */
export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    id,
    type = 'text',
    className = '',
    inputClassName = '',
    rightElement,
    ...props
  },
  ref
) {
  const inputId = id || props.name;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-primaryText"
        >
          {label}
        </label>
      )}

      <div className="relative w-full flex items-center">
        <input
          ref={ref}
          id={inputId}
          type={type}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`w-full bg-white text-primaryText placeholder-secondaryText/60 font-roboto text-sm px-3.5 py-2.5 rounded-md border transition-[border-color,box-shadow] duration-fast outline-none ${
            error
              ? 'border-semantic-error focus:ring-2 focus:ring-semantic-error/20'
              : 'border-borderNeutral focus:border-primary focus:ring-2 focus:ring-primary/15'
          } ${rightElement ? 'pr-11' : ''} ${inputClassName}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 flex items-center justify-center text-secondaryText">
            {rightElement}
          </div>
        )}
      </div>

      {error ? (
        <span id={`${inputId}-error`} className="text-xs text-semantic-error mt-0.5">
          {error}
        </span>
      ) : helperText ? (
        <span className="text-xs text-secondaryText mt-0.5">{helperText}</span>
      ) : null}
    </div>
  );
});

export default Input;
