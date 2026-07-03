const Textarea = ({ label, error, className = '', ...props }) => {
  return (
    <label className="block space-y-2">
      {label ? <span className="text-sm font-semibold text-slate-700">{label}</span> : null}
      <textarea
        className={`min-h-[120px] w-full rounded-2xl border border-sky-100 bg-white/90 px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100 ${className}`}
        {...props}
      />
      {error ? <span className="text-sm text-rose-600">{error}</span> : null}
    </label>
  );
};

export default Textarea;
