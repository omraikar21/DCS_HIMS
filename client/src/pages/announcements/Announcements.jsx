import { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Plus,
  Pin,
  X,
  Send,
  Trash2,
  AlertCircle,
  Users,
  User,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from "../../services/announcementService";
import { getEmployees } from "../../services/employeeService";

function Announcements() {
  const { role, user } = useAuth();
  const userRole = (role || "").toUpperCase();
  const isTeamLead = userRole === "TEAM_LEAD";
  const canDeploy = ["ADMIN", "HR", "TEAM_LEAD"].includes(userRole);

  const myDeptName = user?.department_name || user?.department || (user?.email?.toLowerCase().includes("swapnil") ? "Devops" : "AIML");

  const [announcements, setAnnouncements] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: isTeamLead ? "Task Assignment" : "Notice",
    content: "",
    pinned: false,
    audienceType: "TEAM", // "TEAM" | "INDIVIDUAL"
    targetEmployeeId: "",
    reason: isTeamLead ? "Task & Deliverable Assignment" : "",
  });
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [annData, empData] = await Promise.all([
        getAnnouncements().catch(() => []),
        getEmployees().catch(() => []),
      ]);
      setAnnouncements(Array.isArray(annData) ? annData : []);
      setEmployees(Array.isArray(empData) ? empData : []);
    } catch (err) {
      console.warn("Failed loading announcements or employees:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => {
      loadData();
    };
    window.addEventListener("dcsAnnouncementsUpdated", handleUpdate);
    return () => window.removeEventListener("dcsAnnouncementsUpdated", handleUpdate);
  }, []);

  // Department members for this Team Lead (excluding lead herself and finance/hr)
  const departmentStaff = useMemo(() => {
    if (!isTeamLead) return [];
    const cleanDept = myDeptName.toLowerCase().trim();
    const myEmail = (user?.email || "").toLowerCase().trim();

    return employees.filter((emp) => {
      const empDept = (emp.department || emp.department_name || "").toLowerCase().trim();
      const empCode = (emp.employee_code || "").toUpperCase().trim();
      const empDesig = (emp.designation || "").toLowerCase().trim();
      const empEmail = (emp.email || "").toLowerCase().trim();

      // Exclude lead herself
      if (empEmail && empEmail === myEmail) return false;

      // Exclude Finance & HR
      if (empCode.startsWith("DCS-FIN") || empDesig.includes("finance") || empDept.includes("finance")) return false;
      if (empCode.startsWith("DCS-HR") || empDesig.includes("hr manager") || empDept.includes("human resources")) return false;

      return empDept.includes(cleanDept) || cleanDept.includes(empDept);
    });
  }, [isTeamLead, myDeptName, employees, user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Please provide a title and notice description.");
      return;
    }

    if (isTeamLead && formData.audienceType === "INDIVIDUAL" && !formData.targetEmployeeId) {
      setError("Please select a department team member as the recipient.");
      return;
    }

    let targetUserEmail;
    let targetUserName;
    let targetUserId;

    if (isTeamLead && formData.audienceType === "INDIVIDUAL" && formData.targetEmployeeId) {
      const selectedEmp = departmentStaff.find((emp) => String(emp.id) === String(formData.targetEmployeeId));
      if (selectedEmp) {
        targetUserEmail = selectedEmp.email;
        targetUserName = `${selectedEmp.first_name || ""} ${selectedEmp.last_name || ""}`.trim() || selectedEmp.name;
        targetUserId = selectedEmp.user_id || selectedEmp.id;
      }
    }

    const authorStr = isTeamLead
      ? `${user?.name || "Team Lead"} (${myDeptName} Team Lead)`
      : user?.name
      ? `${user.name} (${userRole === "HR" ? "HR Department" : "Management"})`
      : (userRole === "HR" ? "HR Department" : "Management");

    await createAnnouncement({
      title: formData.title.trim(),
      category: isTeamLead ? formData.category : formData.category,
      pinned: formData.pinned,
      content: formData.content.trim(),
      author: authorStr,
      targetDepartment: isTeamLead ? myDeptName : undefined,
      audienceType: isTeamLead ? formData.audienceType : "TEAM",
      targetUserEmail,
      targetUserName,
      targetUserId,
      reason: isTeamLead ? formData.reason : undefined,
    });

    setFormData({
      title: "",
      category: isTeamLead ? "Task Assignment" : "Notice",
      content: "",
      pinned: false,
      audienceType: "TEAM",
      targetEmployeeId: "",
      reason: isTeamLead ? "Task & Deliverable Assignment" : "",
    });
    setError("");
    setModalOpen(false);
    loadData();
  };

  const handleDelete = (id) => {
    setDeleteConfirmId(id);
  };

  return (
    <div className="announcements-page">
      <div className="module-heading">
        <div>
          <p className="section-label">COMMUNICATION</p>
          <h1>
            {isTeamLead ? `${myDeptName} & Company Announcements` : "Company Notices & Announcements"}
          </h1>
          <p>
            {isTeamLead
              ? `Deploy team directives, individual tasks, and standup notices for your ${myDeptName} department.`
              : "Official company circulars, policy notices, and event broadcasts."}
          </p>
        </div>

        {canDeploy && (
          <button
            className="primary-button"
            onClick={() => {
              setError("");
              setModalOpen(true);
            }}
          >
            <Plus size={17} />
            {isTeamLead ? `Deploy ${myDeptName} Notice` : "Deploy Notice"}
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {loading ? (
          <div className="dashboard-card" style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ color: "#64748b" }}>Loading announcements...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="dashboard-card" style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ color: "#64748b" }}>No announcements posted yet.</p>
          </div>
        ) : (
          announcements.map((item) => {
            const isIndividual = item.metadata?.audience_type === "INDIVIDUAL";
            const targetUserName = item.metadata?.target_user_name || item.target_name || "Team Member";
            const reason = item.metadata?.reason;
            const targetDept = item.metadata?.target_department || item.target_role || "";
            const isDeptScoped = Boolean(targetDept && targetDept !== "ALL");

            return (
              <div key={item.id} className="dashboard-card" style={{ position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    {/* AUDIENCE BADGE */}
                    {isIndividual ? (
                      <span
                        style={{
                          fontSize: "11px",
                          padding: "3px 10px",
                          background: "#EFF6FF",
                          color: "#1D4ED8",
                          border: "1px solid #BFDBFE",
                          borderRadius: "12px",
                          fontWeight: "800",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <User size={12} /> Direct to: {targetUserName} ({targetDept || myDeptName})
                      </span>
                    ) : isDeptScoped ? (
                      <span
                        style={{
                          fontSize: "11px",
                          padding: "3px 10px",
                          background: "#FAF5FF",
                          color: "#7E22CE",
                          border: "1px solid #E9D5FF",
                          borderRadius: "12px",
                          fontWeight: "800",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Users size={12} /> Entire {targetDept} Team
                      </span>
                    ) : (
                      <span
                        className={`status-badge ${
                          item.category?.includes("HR")
                            ? "pending"
                            : item.category?.includes("Event")
                            ? "success"
                            : "approved"
                        }`}
                        style={{ fontSize: "11px", padding: "3px 8px" }}
                      >
                        {item.category || "Company Announcement"}
                      </span>
                    )}

                    {/* REASON / CATEGORY TAG */}
                    {reason && (
                      <span
                        style={{
                          fontSize: "11.5px",
                          padding: "2px 8px",
                          background: "#F1F5F9",
                          color: "#475569",
                          borderRadius: "6px",
                          fontWeight: "700",
                        }}
                      >
                        📌 {reason}
                      </span>
                    )}

                    <span style={{ fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Calendar size={13} />
                      {item.date || (item.created_at ? new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent")}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {(item.pinned || item.priority === "HIGH") && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "12px",
                          color: "#A1238E",
                          fontWeight: 600,
                          backgroundColor: "rgba(161, 35, 142, 0.08)",
                          padding: "4px 10px",
                          borderRadius: "20px",
                        }}
                      >
                        <Pin size={13} />
                        Pinned
                      </div>
                    )}

                    {canDeploy && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        title="Delete Notice"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#94a3b8",
                          cursor: "pointer",
                          padding: "4px",
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                <h3 style={{ fontSize: "18px", marginBottom: "8px", color: "#0f172a" }}>{item.title}</h3>
                <p style={{ color: "#475569", fontSize: "14px", lineHeight: "1.6", marginBottom: "14px", whiteSpace: "pre-line" }}>
                  {item.content || item.message}
                </p>

                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>
                  Posted by: <strong style={{ color: "#334155" }}>{item.author || item.sender_name || "Management"}</strong>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DEPLOY NOTICE MODAL (ADMIN, HR & TEAM LEAD) */}
      {modalOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="employee-modal" style={{ maxWidth: "560px", width: "92%", maxHeight: "90vh", borderRadius: "16px", overflow: "hidden", display: "flex", flexDirection: "column", background: "#FFFFFF", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
            <div className="modal-header" style={{ padding: "18px 24px", borderBottom: "1px solid #E2E8F0" }}>
              <div>
                <p className="section-label" style={{ fontSize: "11px", fontWeight: "700", color: "#64748B", letterSpacing: "0.6px", textTransform: "uppercase", margin: 0 }}>
                  {isTeamLead ? `${myDeptName} TEAM ANNOUNCEMENT` : "COMMUNICATION"}
                </p>
                <h2 style={{ fontSize: "19px", fontWeight: "800", color: "#0F172A", margin: "4px 0 0" }}>
                  {isTeamLead ? `Deploy ${myDeptName} Announcement` : "Deploy Company Notice"}
                </h2>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 16px",
                  backgroundColor: "#FEF2F2",
                  color: "#EF4444",
                  border: "1px solid #FECACA",
                  borderRadius: "8px",
                  margin: "12px 24px 0",
                  fontSize: "13px",
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", flex: 1, margin: 0, overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px", overflowY: "auto", maxHeight: "calc(90vh - 130px)" }}>
                
                {/* TEAM LEAD TARGET AUDIENCE TOGGLE: ENTIRE TEAM VS INDIVIDUAL */}
                {isTeamLead && (
                  <div className="form-field">
                    <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", marginBottom: "6px", display: "block" }}>
                      Target Recipient in {myDeptName} *
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div
                        onClick={() => setFormData({ ...formData, audienceType: "TEAM", targetEmployeeId: "" })}
                        style={{
                          padding: "12px 14px",
                          borderRadius: "10px",
                          border: formData.audienceType === "TEAM" ? "2px solid #7E22CE" : "1.5px solid #CBD5E1",
                          background: formData.audienceType === "TEAM" ? "#FAF5FF" : "#F8FAFC",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <Users size={18} color={formData.audienceType === "TEAM" ? "#7E22CE" : "#64748B"} />
                        <div>
                          <strong style={{ fontSize: "13px", color: formData.audienceType === "TEAM" ? "#6B21A8" : "#334155", display: "block" }}>
                            Entire Team
                          </strong>
                          <span style={{ fontSize: "11px", color: "#64748B" }}>All {myDeptName} staff</span>
                        </div>
                      </div>

                      <div
                        onClick={() => setFormData({ ...formData, audienceType: "INDIVIDUAL" })}
                        style={{
                          padding: "12px 14px",
                          borderRadius: "10px",
                          border: formData.audienceType === "INDIVIDUAL" ? "2px solid #2563EB" : "1.5px solid #CBD5E1",
                          background: formData.audienceType === "INDIVIDUAL" ? "#EFF6FF" : "#F8FAFC",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <User size={18} color={formData.audienceType === "INDIVIDUAL" ? "#2563EB" : "#64748B"} />
                        <div>
                          <strong style={{ fontSize: "13px", color: formData.audienceType === "INDIVIDUAL" ? "#1D4ED8" : "#334155", display: "block" }}>
                            Individual Member
                          </strong>
                          <span style={{ fontSize: "11px", color: "#64748B" }}>Specific person in dept</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* INDIVIDUAL EMPLOYEE DROPDOWN (WHEN INDIVIDUAL IS SELECTED) */}
                {isTeamLead && formData.audienceType === "INDIVIDUAL" && (
                  <div className="form-field" style={{ animation: "fadeIn 0.2s ease" }}>
                    <label style={{ fontSize: "12px", fontWeight: "700", color: "#1E3A8A" }}>
                      Select {myDeptName} Team Member *
                    </label>
                    <select
                      value={formData.targetEmployeeId}
                      onChange={(e) => setFormData({ ...formData, targetEmployeeId: e.target.value })}
                      required
                      style={{ width: "100%", height: "42px", padding: "0 14px", borderRadius: "8px", border: "1.5px solid #93C5FD", backgroundColor: "#FFFFFF", fontSize: "13.5px", color: "#0F172A", outline: "none" }}
                    >
                      <option value="">-- Choose employee from {myDeptName} --</option>
                      {departmentStaff.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name || ""} ({emp.employee_code || "EMP"} - {emp.designation || "Staff"})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* REASON / CONTEXT FIELD */}
                {isTeamLead && (
                  <div className="form-field">
                    <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>
                      Reason & Purpose *
                    </label>
                    <select
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      style={{ width: "100%", height: "42px", padding: "0 14px", borderRadius: "8px", border: "1.5px solid #CBD5E1", backgroundColor: "#FFFFFF", fontSize: "13.5px", color: "#0F172A", outline: "none" }}
                    >
                      <option value="Task & Deliverable Assignment">Task & Deliverable Assignment</option>
                      <option value="Sprint Goal & Milestone Update">Sprint Goal & Milestone Update</option>
                      <option value="Code Review & Quality Feedback">Code Review & Quality Feedback</option>
                      <option value="Daily Standup & Meeting Notice">Daily Standup & Meeting Notice</option>
                      <option value="Urgent Deadline & Priority Request">Urgent Deadline & Priority Request</option>
                      <option value="General Department Directive">General Department Directive</option>
                    </select>
                  </div>
                )}

                <div className="form-field">
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>Notice Title *</label>
                  <input
                    type="text"
                    placeholder={isTeamLead ? `e.g. Sprint 4 Tasks & API Integration Deadline` : "e.g. Q3 Performance Review Timeline"}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    style={{ width: "100%", height: "42px", padding: "0 14px", borderRadius: "8px", border: "1.5px solid #CBD5E1", fontSize: "13.5px", color: "#0F172A", outline: "none" }}
                  />
                </div>

                {!isTeamLead && (
                  <div className="form-field">
                    <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={{ width: "100%", height: "42px", padding: "0 14px", borderRadius: "8px", border: "1.5px solid #CBD5E1", backgroundColor: "#FFFFFF", fontSize: "13.5px", color: "#0F172A", outline: "none" }}
                    >
                      <option value="Notice">Notice</option>
                      <option value="HR Policy">HR Policy</option>
                      <option value="Company Event">Company Event</option>
                      <option value="Holiday">Holiday Schedule</option>
                      <option value="Technical">Technical Update</option>
                    </select>
                  </div>
                )}

                <div className="form-field">
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>
                    {isTeamLead ? "Context, Instructions & Details *" : "Notice Content *"}
                  </label>
                  <textarea
                    rows={4}
                    placeholder={isTeamLead ? `Provide the full context, reason, and action items for your team or employee...` : "Provide full details and instructions for employees..."}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1.5px solid #CBD5E1",
                      fontFamily: "inherit",
                      fontSize: "13.5px",
                      color: "#0F172A",
                      outline: "none",
                      resize: "vertical",
                    }}
                    required
                  />
                </div>

                {/* STYLED PIN TOGGLE CARD UI */}
                <div
                  onClick={() => setFormData((prev) => ({ ...prev, pinned: !prev.pinned }))}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    backgroundColor: formData.pinned ? "#F1F5F9" : "#F8FAFC",
                    border: formData.pinned ? "1.5px solid #1E293B" : "1.5px solid #CBD5E1",
                    borderRadius: "10px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    userSelect: "none",
                    marginTop: "4px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "8px",
                        backgroundColor: formData.pinned ? "#1E293B" : "#E2E8F0",
                        color: formData.pinned ? "#FFFFFF" : "#64748B",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s ease",
                        flexShrink: 0,
                      }}
                    >
                      <Pin size={16} />
                    </div>
                    <div>
                      <span style={{ fontSize: "13.5px", fontWeight: "700", color: "#0F172A", display: "block" }}>
                        Pin Notice to Top
                      </span>
                      <span style={{ fontSize: "11.5px", color: "#64748B" }}>
                        Highlight this announcement at the top of recipient feeds
                      </span>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={formData.pinned}
                    onChange={(e) => setFormData((prev) => ({ ...prev, pinned: e.target.checked }))}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      width: "18px",
                      height: "18px",
                      accentColor: "#1E293B",
                      cursor: "pointer",
                    }}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ borderTop: "1px solid #E2E8F0", padding: "14px 24px", display: "flex", justifyContent: "flex-end", gap: "10px", background: "#F8FAFC" }}>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setModalOpen(false)}
                  style={{ padding: "10px 18px", borderRadius: "8px" }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  style={{ background: "#1E293B", borderColor: "#1E293B", color: "#FFFFFF", padding: "10px 20px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)", display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                  <Send size={15} />
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteConfirmId)}
        title="Remove Announcement?"
        message="Are you sure you want to delete this announcement? This will remove it from department and employee dashboards."
        confirmText="Delete Notice"
        cancelText="Cancel"
        onConfirm={async () => {
          if (deleteConfirmId) {
            await deleteAnnouncement(deleteConfirmId);
            setDeleteConfirmId(null);
            loadData();
          }
        }}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}

export default Announcements;
