const AdminToolbar = ({ search, onSearch, filter, onFilter, filters = [], right }) => (
  <div className="flex flex-col gap-3 rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-slate-100 lg:flex-row lg:items-center lg:justify-between">
    <div className="flex flex-1 flex-col gap-3 sm:flex-row">
      <label className="relative flex-1">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
        <input value={search} onChange={(event) => onSearch?.(event.target.value)} placeholder="Tìm kiếm..." className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-50" />
      </label>
      {filters.length ? (
        <select value={filter} onChange={(event) => onFilter?.(event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-50">
          {filters.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      ) : null}
    </div>
    {right ? <div className="flex flex-wrap gap-2">{right}</div> : null}
  </div>
);
export default AdminToolbar;
