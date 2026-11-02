import React from 'react';

const VARIANTS = {
  primary: 'bg-primary text-white hover:bg-primary-hover active:bg-primary-active shadow-button',
  secondary: 'bg-surface text-primary border border-borderNeutral hover:bg-softLavender/60 active:bg-softLavender shadow-xs',
  outline: 'border border-borderNeutral bg-transparent text-primaryText hover:bg-surface active:bg-borderNeutral',
  ghost: 'bg-transparent text-primaryText hover:bg-surface active:bg-borderNeutral/50',
  danger: 'bg-semantic-error text-white hover:bg-[#c22838] active:bg-[#a81e2d] shadow-sm',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs rounded-sm',
  md: 'px-4.5 py-2.5 text-sm rounded-md',
  lg: 'px-6 py-3 text-base rounded-lg',
};

/**
 * Reusable Button Component FloverArts_
 * Desain kokoh non-pill (rounded-md/lg), transisi spesifik tanpa layout shift,
 * umpan balik tekan (active:scale-[0.97]), dan proteksi double-click saat loading.
 */
export function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  leftIcon,
  rightIcon,
  ...props
}) {
  const variantClass = VARIANTS[variant] || VARIANTS.primary;
  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={`relative inline-flex items-center justify-center gap-2 font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-fast ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:pointer-events-none ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center gap-2 bg-inherit rounded-[inherit]">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="sr-only">Memproses...</span>
        </span>
      )}
      <span className={`inline-flex items-center justify-center gap-2 ${isLoading ? 'invisible' : ''}`}>
        {leftIcon}
        {children}
        {rightIcon}
      </span>
    </button>
  );
}

export default Button;
