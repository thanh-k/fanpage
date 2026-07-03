const variants = {
  primary: 'bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-400 text-white hover:from-sky-600 hover:via-cyan-600 hover:to-teal-500 shadow-lg shadow-sky-100',
  secondary: 'bg-white/90 text-slate-700 ring-1 ring-sky-100 hover:bg-sky-50 hover:text-sky-700 shadow-sm',
  danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-100',
  ghost: 'bg-transparent text-slate-700 hover:bg-sky-50 hover:text-sky-700'
};

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${variants[variant]} ${disabled ? 'cursor-not-allowed opacity-60' : 'hover:-translate-y-0.5'} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
