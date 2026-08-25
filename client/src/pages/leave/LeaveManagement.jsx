import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  CalendarDays,
} from "lucide-react";

import {
  getLeaves,
  createLeave,
  approveLeave,
  rejectLeave,
  holdLeave,
  deleteLeave,
} from "../../services/leaveService";

import {
  getEmployees,
} from "../../services/employeeService";

import LeaveSummary
  from "../../components/leave/LeaveSummary";

import LeaveFilters
  from "../../components/leave/LeaveFilters";

import LeaveTable
  from "../../components/leave/LeaveTable";

import LeaveModal
  from "../../components/leave/LeaveModal";

import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../hooks/useNotification";

const leaveTypeToUI = {
  CASUAL: "Casual Leave",
  SICK: "Sick Leave",
  EARNED: "Earned Leave",
  MATERNITY: "Maternity Leave",
  PATERNITY: "Paternity Leave",
  UNPAID: "Unpaid Leave",
};

const leaveTypeToBackend = {
  "Casual Leave": "CASUAL",
  "Sick Leave": "SICK",
  "Earned Leave": "EARNED",
  "Maternity Leave": "MATERNITY",
  "Paternity Leave": "PATERNITY",
  "Unpaid Leave": "UNPAID",
};

const leaveStatusToUI = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

function LeaveManagement() {
  const { role, user } = useAuth();
  const notification = useNotification();
  const userRole = (role || user?.role || "EMPLOYEE").toUpperCase();
  const isSuperAdmin = Boolean(
    user?.is_super_admin ||
    (user?.email && user.email.toLowerCase().trim() === "omraikar2128@gmail.com")
  );
  const isAdmin = userRole === "ADMIN";
  const isHR = userRole === "HR";
  const isAdminOrHr = isAdmin || isHR || isSuperAdmin;
  const canApprove = isAdminOrHr;
  const userDept = user?.department_name || user?.department || "";

  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [_loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [leaveType, setLeaveType] = useState("All Leave Types");
  const [status, setStatus] = useState("All Status");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const mapLeaveToUI = (rec, empList = []) => {
    const fromDate = rec.start_date ? String(rec.start_date).slice(0, 10) : "";
    const toDate = rec.end_date ? String(rec.end_date).slice(0, 10) : "";
    let days = 1;
    if (fromDate && toDate) {
      const diff = new Date(toDate) - new Date(fromDate);
      days = Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)) + 1);
    }
    const name = `${rec.first_name || ""} ${rec.last_name || ""}`.trim() || rec.applicant_name || "Employee";

    const empMatch = (empList || []).find(
      e => e.id === rec.employee_id ||
           (e.employee_code && rec.employee_code && e.employee_code === rec.employee_code) ||
           `${e.first_name || ""} ${e.last_name || ""}`.trim().toLowerCase() === name.toLowerCase()
    );

    const empCode = (rec.employee_code || empMatch?.employee_code || "").toUpperCase();
    const deptName = (rec.department_name || empMatch?.department_name || "").toLowerCase();
    const desig = (empMatch?.designation || rec.designation || "").toLowerCase();
    let rawRole = (rec.applicant_role || rec.role || empMatch?.role || "").toUpperCase();

    let applicantRole = "EMPLOYEE";
    if (rawRole === "HR" || empCode.includes("-HR-") || empCode.includes("HR") || deptName.includes("human resources") || desig.includes("hr")) {
      applicantRole = "HR";
    } else if (rawRole === "FINANCE" || empCode.includes("-FIN-") || empCode.includes("FIN") || deptName.includes("finance") || desig.includes("finance") || desig.includes("accountant")) {
      applicantRole = "FINANCE";
    } else if (rawRole === "TEAM_LEAD" || empCode.includes("-TL-") || empCode.includes("-TL") || desig.includes("team lead") || desig.includes("lead")) {
      applicantRole = "TEAM_LEAD";
    } else if (rawRole === "ADMIN" || rawRole === "SUPER_ADMIN" || empCode.includes("-ADM-") || empCode.includes("ADMIN")) {
      applicantRole = "ADMIN";
    }

    return {
      id: `LV-${String(rec.id).padStart(3, "0")}`,
      databaseId: rec.id,
      employeeId: rec.employee_code || empMatch?.employee_code || `EMP-${rec.employee_id}`,
      employeeDatabaseId: rec.employee_id,
      employeeName: name,
      department: rec.department_name || empMatch?.department_name || "Development",
      leaveType: leaveTypeToUI[rec.leave_type] || rec.leave_type || "Casual Leave",
      fromDate,
      toDate,
      days,
      reason: rec.reason || "",
      appliedOn: rec.created_at ? String(rec.created_at).slice(0, 10) : fromDate,
      status: leaveStatusToUI[rec.status] || rec.status || "Pending",
      applicantRole,
    };
  };

  const loadLeaveData = async () => {
    try {
      setLoading(true);
      setError("");
      const [leavesData, empData] = await Promise.all([
        getLeaves(),
        getEmployees().catch(() => []),
      ]);
      const mapped = (leavesData || []).map((rec) => mapLeaveToUI(rec, empData));
      setRecords(mapped);
      setEmployees(empData || []);
    } catch (err) {
      console.error("Failed to load leaves:", err);
      setError(err.message || "Failed to load leave records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaveData();
  }, []);

  /* FILTERING & ROLE PERMISSION SCOPING */
  const filteredRecords = useMemo(() => {
    return records.map((record) => {
      const applicantRole = (record.applicantRole || "EMPLOYEE").toUpperCase();
      const applicantName = (record.employeeName || "").toLowerCase().trim();
      const currentName = (user?.name || "").toLowerCase().trim();
      const applicantCode = (record.employeeId || "").toUpperCase().trim();
      const userCode = (user?.employee_code || user?.employee_id || "").toUpperCase().trim();
      const isMyOwnLeave = Boolean(
        (applicantCode && userCode && applicantCode === userCode) ||
        (applicantName && currentName && (applicantName === currentName || applicantName.includes(currentName) || currentName.includes(applicantName)))
      );

      // EXACT APPROVAL RULES:
      // 1. ADMIN approves leave for HR & FINANCE
      // 2. HR approves leave for TEAM_LEAD & EMPLOYEE
      // 3. TEAM_LEAD approves leave for EMPLOYEE only
      let canApproveThis = false;
      if (!isMyOwnLeave) {
        if (isAdmin || isSuperAdmin) {
          canApproveThis = applicantRole === "HR" || applicantRole === "FINANCE";
        } else if (isHR) {
          canApproveThis = applicantRole === "TEAM_LEAD" || applicantRole === "EMPLOYEE";
        } else if (userRole === "TEAM_LEAD") {
          canApproveThis = applicantRole === "EMPLOYEE";
        }
      }

      return {
        ...record,
        canApproveThisRecord: canApproveThis,
        canDeleteThisRecord: isMyOwnLeave,
      };
    }).filter((record) => {
      const applicantName = (record.employeeName || "").toLowerCase().trim();
      const currentName = (user?.name || "").toLowerCase().trim();
      const applicantCode = (record.employeeId || "").toUpperCase().trim();
      const userCode = (user?.employee_code || user?.employee_id || "").toUpperCase().trim();
      const isMyOwnLeave = Boolean(
        (applicantCode && userCode && applicantCode === userCode) ||
        (applicantName && currentName && (applicantName === currentName || applicantName.includes(currentName) || currentName.includes(applicantName)))
      );

      // Scope visibility per role:
      if (!isSuperAdmin) {
        if (isAdmin) {
          // Admin oversees all leave applications across the enterprise
        } else if (isHR) {
          // HR sees own leaves and regular Employee / Team Lead leaves
          const isEmployeeOrLead = record.applicantRole === "EMPLOYEE" || record.applicantRole === "TEAM_LEAD";
          if (!isMyOwnLeave && !isEmployeeOrLead) return false;
        } else if (userRole === "TEAM_LEAD") {
          // Team Lead sees own leaves and Employee leaves in department
          const isDeptEmployee = record.applicantRole === "EMPLOYEE" && (!userDept || record.department === userDept);
          if (!isMyOwnLeave && !isDeptEmployee) return false;
        } else {
          // Employee ONLY sees their own leaves
          if (!isMyOwnLeave) return false;
        }
      }

      const searchText = search.toLowerCase();
      const matchesSearch =
        !search ||
        record.employeeName.toLowerCase().includes(searchText) ||
        record.employeeId.toLowerCase().includes(searchText);

      const matchesDepartment =
        department === "All Departments" || record.department === department;

      const matchesLeaveType =
        leaveType === "All Leave Types" || record.leaveType === leaveType;

      const matchesStatus =
        status === "All Status" || record.status === status;

      return matchesSearch && matchesDepartment && matchesLeaveType && matchesStatus;
    });
  }, [records, search, department, leaveType, status, isSuperAdmin, isAdmin, isHR, userRole, user, userDept]);


  /* APPLY LEAVE */

  const handleAdd = () => {

    setSelectedRecord(null);

    setModalOpen(true);

  };


  /* VIEW */

  const handleView = (
    record
  ) => {

    setSelectedRecord(record);

    setModalOpen(true);

  };


  /* APPROVE */

  const handleApprove = async (
    record
  ) => {
    try {
      setLoading(true);
      setError("");
      await approveLeave(record.databaseId || record.id);
      if (notification?.success) {
        notification.success(`Leave request for ${record.employeeName} approved!`);
      }
      await loadLeaveData();
    } catch (err) {
      console.error("Failed to approve leave:", err);
      setError(err.message || "Failed to approve leave");
    } finally {
      setLoading(false);
    }
  };


  /* REJECT */

  const handleReject = async (
    record
  ) => {
    try {
      setLoading(true);
      setError("");
      await rejectLeave(record.databaseId || record.id, "Rejected by Admin/HR");
      if (notification?.info) {
        notification.info(`Leave request for ${record.employeeName} rejected.`);
      }
      await loadLeaveData();
    } catch (err) {
      console.error("Failed to reject leave:", err);
      setError(err.message || "Failed to reject leave");
    } finally {
      setLoading(false);
    }
  };


  /* HOLD */

  const handleHold = async (
    record
  ) => {
    try {
      setLoading(true);
      setError("");
      await holdLeave(record.databaseId || record.id);
      if (notification?.info) {
        notification.info(`Leave request for ${record.employeeName} put on hold.`);
      }
      await loadLeaveData();
    } catch (err) {
      console.error("Failed to hold leave:", err);
      setError(err.message || "Failed to put leave on hold");
    } finally {
      setLoading(false);
    }
  };


  /* SAVE */

  const handleSave = async (
    formData
  ) => {
    try {
      setLoading(true);
      setError("");

      // Find matching employee database ID if possible
      let matchedEmpId = selectedRecord?.employeeDatabaseId;
      if (!matchedEmpId && employees.length > 0) {
        const found = employees.find(
          e => e.employee_code === formData.employeeId ||
               `${e.first_name || ""} ${e.last_name || ""}`.trim().toLowerCase() === formData.employeeName.trim().toLowerCase()
        );
        matchedEmpId = found ? found.id : employees[0].id;
      }
      if (!matchedEmpId) {
        matchedEmpId = 1;
      }

      const backendLeaveType = leaveTypeToBackend[formData.leaveType] || "CASUAL";

      await createLeave({
        employeeId: matchedEmpId,
        leaveType: backendLeaveType,
        startDate: formData.fromDate,
        endDate: formData.toDate,
        reason: formData.reason || "Leave request",
      });

      if (notification?.success) {
        notification.success("Leave request submitted successfully!");
      }

      await loadLeaveData();
      setModalOpen(false);
      setSelectedRecord(null);
    } catch (err) {
      console.error("Failed to save leave:", err);
      setError(err.message || "Failed to save leave request");
    } finally {
      setLoading(false);
    }
  };

  /* DELETE */

  const handleDelete = async (record) => {
    if (!record) return;
    const leaveId = record.databaseId || (typeof record.id === "string" ? record.id.replace("LV-", "") : record.id);
    if (!window.confirm(`Are you sure you want to delete leave application for ${record.employeeName}?`)) {
      return;
    }
    try {
      setLoading(true);
      await deleteLeave(leaveId);
      if (notification?.success) {
        notification.success("Leave application deleted successfully");
      }
      setRecords((prev) => prev.filter((r) => r.databaseId !== record.databaseId && r.id !== record.id));
      setModalOpen(false);
      setSelectedRecord(null);
    } catch (err) {
      console.error("Delete leave error:", err);
      if (notification?.error) {
        notification.error(err.message || "Failed to delete leave request");
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="leave-page">

      {/* HEADER */}

      <div className="module-heading">

        <div>

          <p className="section-label">
            TIME OFF
          </p>

          <h1>
            {isAdminOrHr ? "Leave Management" : "My Leave Requests"}
          </h1>

          <p>
            {isAdmin
              ? "Review and approve HR & Finance leaves, and monitor department team leaves."
              : isHR
              ? "Review and manage employee leave requests and approvals."
              : "View your leave applications, balance, and submit new time-off requests."}
          </p>

        </div>

        {!isAdmin && !isSuperAdmin && (
          <button
            className="primary-button"
            onClick={handleAdd}
          >
            <Plus size={17} />
            Apply Leave
          </button>
        )}

      </div>

      {error && (
        <div className="dashboard-card">
          <p style={{ color: "#e11d48" }}>{error}</p>
        </div>
      )}


      {/* SUMMARY */}

      <LeaveSummary
        records={filteredRecords}
      />


      {/* REQUESTS */}

      <section className="dashboard-card">

        <div className="leave-section-header">

          <div>

            <h3>
              {isAdminOrHr ? "All Leave Requests" : "My Leave History"}
            </h3>

            <p>
              {isAdminOrHr
                ? "Review, approve, reject, or place employee leave requests on hold."
                : "Track the status of your submitted leave applications."}
            </p>

          </div>


          <div className="leave-total-label">

            <CalendarDays
              size={16}
            />

            {filteredRecords.length}
            {" "}
            Requests

          </div>

        </div>


        <LeaveFilters
          search={search}
          setSearch={setSearch}
          department={department}
          setDepartment={setDepartment}
          leaveType={leaveType}
          setLeaveType={setLeaveType}
          status={status}
          setStatus={setStatus}
        />


        <LeaveTable
          records={filteredRecords}
          onView={handleView}
          onApprove={handleApprove}
          onReject={handleReject}
          onHold={handleHold}
          onDelete={handleDelete}
          canApprove={canApprove}
        />

      </section>


      {/* MODAL */}

      <LeaveModal
        isOpen={modalOpen}
        onClose={() => {

          setModalOpen(false);

          setSelectedRecord(null);

        }}
        onSave={handleSave}
        onDelete={handleDelete}
        record={selectedRecord}
      />

    </div>
  );
}

export default LeaveManagement;
