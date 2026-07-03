import { statusClass } from './adminUtils';
const StatusBadge = ({ value, children }) => <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black ring-1 ${statusClass(value)}`}>{children || value || 'UNKNOWN'}</span>;
export default StatusBadge;
