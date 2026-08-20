import React from "react";
import "../css/Grid.css";
// Import các icon từ file quản lý tập trung của bạn
import { EditIcon, TrashIcon, CalendarIcon } from "../components/Icons";

export default function GoalLong({ rawData, onEdit, onDelete }) {
  if (!rawData || rawData.length === 0) {
    return (
      <div className="grid-no-data">
        Chưa có kế hoạch dài hạn nào được thiết lập. Hãy bấm nút "Cập nhật" để thêm mới!
      </div>
    );
  }

  const calculateProgressDays = (startDateStr, endDateStr) => {
    const parseDate = (str) => {
      if (!str) return new Date();
      const parts = str.split("/");
      return new Date(parts[2], parts[1] - 1, parts[0]);
    };

    const start = parseDate(startDateStr);
    const end = parseDate(endDateStr);
    const today = new Date();

    const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const passedDays = Math.max(0, Math.ceil((today - start) / (1000 * 60 * 60 * 24)));
    
    const percentage = Math.min(100, Math.max(0, Math.round((passedDays / totalDays) * 100)));
    return { passedDays, totalDays, percentage };
  };

  const calculateFinancialProgress = (currentSaved = 0, totalCost = 0) => {
    if (!totalCost || totalCost <= 0) return { current: 0, total: 0, percentage: 0 };
    const percentage = Math.min(100, Math.max(0, Math.round((currentSaved / totalCost) * 100)));
    return { current: currentSaved, total: totalCost, percentage };
  };

  return (
    <div className="grid-container">
      {rawData.map((item, index) => {
        const timeProg = calculateProgressDays(item.startDate, item.endDate);
        const moneyProg = calculateFinancialProgress(item.currentSaved || 0, item.cost || 0);

        return (
          <div key={index} className="grid-card">
            <div className="grid-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="grid-date" style={{ fontWeight: "700", fontSize: "15px" }}>{item.goalName}</span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button 
                  type="button"
                  onClick={() => onEdit && onEdit(item, index)} 
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "15px" }}
                  title="Chỉnh sửa kế hoạch"
                >
                  <EditIcon size={16} color="#4a5568" />
                </button>
                <button 
                  type="button"
                  onClick={() => onDelete && onDelete(index)} 
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "15px" }}
                  title="Xóa kế hoạch"
                >
                  <TrashIcon size={15} color="#e53e3e" />
                </button>
              </div>
            </div>

            <div className="grid-body">
              <div className="grid-row">
                <span className="label">
                  <CalendarIcon style={{ marginRight: "5px", color: "#3182ce" }} /> Thời gian:
                </span>
                <span className="value">{item.startDate} - {item.endDate}</span>
              </div>

              <div className="grid-row">
                <span className="label">
                  Tổng thời gian:
                </span>
                <span className="value">{item.totalMonths} tháng ({item.totalDays} ngày)</span>
              </div>

              <div className="note-row note-text">
                <strong>Mục đích:</strong> {item.purpose || "Không có"}
              </div>

              <div className="grid-row total-row">
                <div>
                  <div className="label" style={{ fontSize: "11px" }}>Dự trù chi phí</div>
                  <div className="value text-red">{Number(item.cost || 0).toLocaleString("vi-VN")} đ</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="label" style={{ fontSize: "11px" }}>Bỏ heo mỗi ngày</div>
                  <div className="value text-green">{Number(item.dailySaving || 0).toLocaleString("vi-VN")} đ/ngày</div>
                </div>
              </div>

              {/* --- 2 THANH TIẾN ĐỘ --- */}
              <div style={{ marginTop: "12px", borderTop: "1px dashed #e2e8f0", paddingTop: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
                
                {/* 1. Tiến độ thời gian */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "4px" }}>
                    <span style={{ color: "#4a5568", fontWeight: "500" }}>
                     Tiến độ thời gian
                    </span>
                    <span style={{ color: "#2d3748", fontWeight: "600" }}>{timeProg.passedDays} / {timeProg.totalDays} ngày</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ flex: 1, background: "#e2e8f0", borderRadius: "4px", height: "8px", overflow: "hidden" }}>
                      <div style={{ width: `${timeProg.percentage}%`, background: "#3182ce", height: "100%", borderRadius: "4px" }}></div>
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#3182ce", minWidth: "35px", textAlign: "right" }}>{timeProg.percentage}%</span>
                  </div>
                </div>

                {/* 2. Tiến độ tài chính */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "4px" }}>
                    <span style={{ color: "#4a5568", fontWeight: "500" }}>💰 Tiến độ tài chính</span>
                    <span style={{ color: "#2d3748", fontWeight: "600" }}>{moneyProg.current.toLocaleString("vi-VN")} / {moneyProg.total.toLocaleString("vi-VN")} đ</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ flex: 1, background: "#e2e8f0", borderRadius: "4px", height: "8px", overflow: "hidden" }}>
                      <div style={{ width: `${moneyProg.percentage}%`, background: "#38a169", height: "100%", borderRadius: "4px" }}></div>
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#38a169", minWidth: "35px", textAlign: "right" }}>{moneyProg.percentage}%</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}