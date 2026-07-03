const AdminPageHeader = ({ eyebrow, title, description, action }) => (
  <div className="flex flex-col gap-4 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100 lg:flex-row lg:items-center lg:justify-between">
    <div>
      {eyebrow ? <p className="text-xs font-black uppercase tracking-[0.25em] text-sky-500">{eyebrow}</p> : null}
      <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">{title}</h1>
      {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{description}</p> : null}
    </div>
    {action ? <div className="shrink-0">{action}</div> : null}
  </div>
);
export default AdminPageHeader;
