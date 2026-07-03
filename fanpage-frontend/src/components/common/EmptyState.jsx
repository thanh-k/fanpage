const EmptyState = ({ title, description }) => {
  return (
    <div className="rounded-[28px] border border-dashed border-sky-200 bg-white/90 p-8 text-center shadow-soft backdrop-blur-sm">
      <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-gradient-to-br from-sky-100 to-cyan-100" />
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
};

export default EmptyState;
