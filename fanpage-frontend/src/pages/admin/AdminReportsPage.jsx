import { useEffect, useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import adminService from '../../services/adminService';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminPagination, { useAdminPagination } from '../../components/admin/AdminPagination';
import { PERMISSIONS, formatAdminDate } from '../../components/admin/adminUtils';

const AdminReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('PENDING'); 
  const [expandedReportId, setExpandedReportId] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const loadReports = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminService.getReports();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách đơn tố cáo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const filteredReports = reports.filter(report => {
    if (activeTab === 'PENDING') return report.status === 'PENDING';
    return report.status === 'APPROVED' || report.status === 'REJECTED' || report.status === 'RESOLVED';
  });
  const pagination = useAdminPagination(filteredReports, 10, [activeTab]);

  const handleResolve = async (reportId, action) => {
    if (processingId) return;
    
    let confirmMsg = action === 'APPROVE' 
      ? 'Xác định tố cáo ĐÚNG? Hệ thống sẽ XÓA bài viết và gửi thông báo Realtime cảnh cáo tới User!' 
      : 'Ghi nhận đơn tố cáo nhưng BỎ QUA nội dung này?';
      
    if (!window.confirm(confirmMsg)) return;

    setProcessingId(reportId);
    try {
      await adminService.resolveReport(reportId, { action: action });
      
      setReports(prev => prev.map(r => {
        if (r.id === reportId) {
          return { 
            ...r, 
            status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
            resolution: action === 'APPROVE' ? 'Xác minh vi phạm - Đã xóa bài viết' : 'Lưu hồ sơ - Bỏ qua tố cáo'
          };
        }
        return r;
      }));
      setExpandedReportId(null);
    } catch (err) {
      alert(err.message || 'Xử lý đơn tố cáo thất bại.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AdminLayout requiredPermissions={[PERMISSIONS.REPORT_VIEW]}>
      <AdminPageHeader 
        eyebrow="Moderation Center" 
        title="Trung tâm Xử lý Tố cáo" 
        description="Phân loại trực quan danh sách đơn báo cáo nội dung vi phạm. Admin có thể xem chi tiết bài viết bị tố cáo và đưa ra hình thức xử lý chỉ bằng một cú click."
        action={<button onClick={loadReports} className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-black text-white hover:bg-sky-600 transition">Làm mới đơn</button>}
      />

      {/* Tabs Phân chia trạng thái trực quan */}
      <div className="mt-6 flex gap-2 border-b border-slate-200 pb-px">
        <button 
          onClick={() => { setActiveTab('PENDING'); setExpandedReportId(null); }}
          className={`pb-3 px-4 text-sm font-black transition-all border-b-2 ${activeTab === 'PENDING' ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Chưa xử lý ({reports.filter(r => r.status === 'PENDING').length})
        </button>
        <button 
          onClick={() => { setActiveTab('RESOLVED'); setExpandedReportId(null); }}
          className={`pb-3 px-4 text-sm font-black transition-all border-b-2 ${activeTab === 'RESOLVED' ? 'border-slate-950 text-slate-950' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Đã xử lý ({reports.filter(r => r.status !== 'PENDING').length})
        </button>
      </div>

      {error && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">{error}</p>}

      <div className="mt-4 overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-slate-50/70 text-xs font-black uppercase tracking-wide text-slate-500">
              <th className="p-4 w-12"></th>
              <th className="p-4">Lý do</th>
              <th className="p-4">Người báo cáo</th>
              <th className="p-4">Thời gian</th>
              <th className="p-4 text-right">Hồ sơ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan="5" className="p-8 text-center text-sm text-slate-400">Đang tải dữ liệu báo cáo...</td></tr>
            ) : filteredReports.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-sm text-slate-400">Danh mục này hiện tại trống rỗng.</td></tr>
            ) : (
              pagination.pagedItems.map((report) => {
                const isExpanded = expandedReportId === report.id;
                return (
                  <header key={report.id} className="contents">
                    <tr 
                      onClick={() => setExpandedReportId(isExpanded ? null : report.id)}
                      className={`cursor-pointer transition ${isExpanded ? 'bg-sky-50/40' : 'hover:bg-slate-50/60'}`}
                    >
                      <td className="p-4 text-center text-slate-400 text-xs font-bold">{isExpanded ? '▼' : '▶'}</td>
                      <td className="p-4">
                        <span className="rounded-xl bg-rose-50 px-2.5 py-1 text-xs font-black text-rose-600 mr-2">{report.violationType}</span>
                        <span className="text-sm font-bold text-slate-800">{report.reason}</span>
                      </td>
                      <td className="p-4 text-sm font-semibold text-slate-600">{report.reporterName || `User #${report.reporterId}`}</td>
                      <td className="p-4 text-xs font-medium text-slate-400">{formatAdminDate(report.createdAt)}</td>
                      <td className="p-4 text-right">
                        <span className={`rounded-xl px-3 py-1 text-xs font-black uppercase tracking-wider ${
                          report.status === 'PENDING' ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-200' :
                          report.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {report.status === 'PENDING' ? 'Chờ duyệt' : report.status === 'APPROVED' ? 'Đã gỡ bài' : 'Đã bỏ qua'}
                        </span>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr>
                        <td colSpan="5" className="bg-slate-50/50 p-6 border-b border-slate-100">
                          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-inner">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Nội dung bài viết bị tố cáo (Bài viết #{report.targetId}):</h4>
                            <div className="mt-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-700 italic border-l-4 border-slate-300">
                              {report.targetContent || "Nội dung bài viết không chứa văn bản hoặc hình ảnh thô."}
                            </div>

                            {report.status === 'PENDING' ? (
                              <div className="mt-5 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                                <button
                                  disabled={processingId !== null}
                                  onClick={() => handleResolve(report.id, 'REJECT')}
                                  className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-black text-slate-700 hover:bg-slate-200 transition"
                                >
                                  Ghi nhận & Bỏ qua đơn
                                </button>
                                <button
                                  disabled={processingId !== null}
                                  onClick={() => handleResolve(report.id, 'APPROVE')}
                                  className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-black text-white hover:bg-rose-700 shadow-md shadow-rose-200 transition"
                                >
                                  Xác nhận vi phạm - Gỡ bài ngay
                                </button>
                              </div>
                            ) : (
                              <div className="mt-4 text-xs font-bold text-slate-400 italic">
                                Nhật ký xử lý của hệ thống: <span className="text-slate-700 font-black">{report.resolution || "Đã đóng hồ sơ đơn."}</span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </header>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <AdminPagination pagination={pagination} />
    </AdminLayout>
  );
};

export default AdminReportsPage;