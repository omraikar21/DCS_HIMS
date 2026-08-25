import { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Building,
  WalletCards,
  Lock,
  Edit2,
  Trash2,
  X,
  User,
  Search,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../hooks/useNotification";
import {
  getUsersList,
  createUserAccount,
  updateUserAccount,
  deleteUserAccount,
} from "../../services/userService";
import { getDepartments, createDepartment } from "../../services/departmentService";

function UserManagement() {
  const { user, role } = useAuth();
  const notification = useNotification();
  const userRole = (role || user?.role || "EMPLOYEE").toUpperCase();
  const currentUserId = user?.id || user?.userId;

  const isAdmin = userRole === "ADMIN";
  const isHR = userRole === "HR";
  const userEmailClean = (user?.email || "").toLowerCase().trim();
  const isSuperAdmin = Boolean(
    user?.is_super_admin ||
    userEmailClean === "omraikar2128@gmail.com" ||
    userEmailClean === "omraikar2128@gamil.com"
  );
  const isPrimaryAdmin = isAdmin && !isSuperAdmin;

  const [data, setData] = useState({
    users: [],
    telemetry: {
      totalUsers: 0,
      primaryAdminCount: 0,
      maxPrimaryAdmin: 1,
      canAddPrimaryAdmin: false,
      remainingSlots: 1,
    },
    permissions: {},
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTargetRole, setModalTargetRole] = useState("ADMIN"); // 'ADMIN' | 'HR' | 'FINANCE' | 'TEAM_LEAD'
  const [editUser, setEditUser] = useState(null);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [customDepartment, setCustomDepartment] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "ADMIN",
    department: "",
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  // Available Departments
  const availableAdminDepartments = useMemo(() => {
    const valid = departmentsList.filter((d) => d && d !== "Human Resources" && d !== "Finance");
    if (valid.length > 0) return valid;
    return ["Software Development", "Quality Assurance", "Marketing", "Product & Design", "Operations"];
  }, [departmentsList]);

  // Button Hover States
  const [hoveredBtn, setHoveredBtn] = useState(null);

  // Delete Confirm Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getUsersList();
      if (res && res.users) {
        setData(res);
      }
    } catch (err) {
      console.error("Failed to load user directory:", err);
      notification.error(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const loadDepartmentsData = async () => {
    try {
      const depts = await getDepartments();
      if (depts && depts.length > 0) {
        const names = depts.map((d) => d.name).filter(Boolean);
        setDepartmentsList(names);
      }
    } catch (err) {
      console.warn("Failed to load departments:", err);
    }
  };

  useEffect(() => {
    loadData();
    loadDepartmentsData();
  }, []);

  const { users = [], telemetry = {} } = data;

  const primaryAdminCount = telemetry.primaryAdminCount || (users.filter(u => u.role === "ADMIN" && !u.is_super_admin).length);
  const maxPrimaryAdmin = 1;
  const remainingSlots = Math.max(0, maxPrimaryAdmin - primaryAdminCount);
  const canAddPrimaryAdmin = isSuperAdmin && remainingSlots > 0;
  const canAddAdmin = canAddPrimaryAdmin;
  const coAdminCount = primaryAdminCount;
  const maxCoAdmins = maxPrimaryAdmin;

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (activeTab === "ADMIN" && u.role !== "ADMIN") return false;
      if (activeTab === "TEAM_LEAD" && u.role !== "TEAM_LEAD") return false;
      if (activeTab === "HR" && u.role !== "HR") return false;
      if (activeTab === "FINANCE" && u.role !== "FINANCE") return false;
      if (activeTab === "EMPLOYEE" && u.role !== "EMPLOYEE") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (u.name || "").toLowerCase().includes(q);
        const matchEmail = (u.email || "").toLowerCase().includes(q);
        const matchRole = (u.role || "").toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchRole) return false;
      }

      return true;
    });
  }, [users, activeTab, searchQuery]);

  // Open Create Modal Dedicated Specifically to Clicked Role
  const handleOpenCreateForRole = (targetRole) => {
    setEditUser(null);
    setModalTargetRole(targetRole);

    const defaultDept = availableAdminDepartments.length > 0 ? availableAdminDepartments[0] : "Software Development";
    setFormData({
      name: "",
      email: "",
      password: "",
      role: targetRole,
      department: targetRole === "ADMIN" ? "Administration" : targetRole === "HR" ? "Human Resources" : (targetRole === "FINANCE" ? "Finance" : defaultDept),
      isActive: true,
    });
    setCustomDepartment("");
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (target) => {
    setEditUser(target);
    setModalTargetRole(target.role || "FINANCE");
    setFormData({
      name: target.name || "",
      email: target.email || "",
      password: "",
      role: target.role || "FINANCE",
      department: target.department_name || target.department || "",
      isActive: target.is_active !== false,
    });
    setCustomDepartment("");
    setModalOpen(true);
  };

  // Open Delete Confirmation Modal
  const handleOpenDelete = (target) => {
    const isTargetSuper = Boolean(target.is_super_admin) || (target.email || "").toLowerCase() === "omraikar2128@gmail.com";
    if (isTargetSuper) {
      notification.error("The Primary Administrator is permanent and cannot be deleted.");
      return;
    }
    if (target.id === currentUserId) {
      notification.error("You cannot delete your own active account.");
      return;
    }
    setUserToDelete(target);
    setDeleteModalOpen(true);
  };

  // Submit User Create / Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      notification.error("Name and email are required.");
      return;
    }

    const resolvedDept =
      formData.role === "ADMIN"
        ? "Administration"
        : formData.role === "HR"
        ? "Human Resources"
        : formData.role === "FINANCE"
        ? "Finance"
        : formData.department === "CUSTOM"
        ? customDepartment.trim()
        : formData.department;

    if (!resolvedDept) {
      notification.error("Please select or enter a valid department name.");
      return;
    }

    try {
      setSubmitting(true);

      // Check if custom or newly entered department exists in DB; if not, persist it!
      const existsInDb = departmentsList.some(
        (d) => (d || "").toLowerCase().trim() === resolvedDept.toLowerCase().trim()
      );

      if (!existsInDb) {
        try {
          await createDepartment({
            name: resolvedDept,
            description: "Provisioned department during user role allocation",
            isActive: true,
          });
          notification.success(`New Department '${resolvedDept}' registered in database!`);
          await loadDepartmentsData();
        } catch (deptErr) {
          console.warn("Could not insert custom department into DB:", deptErr.message);
        }
      }

      if (editUser) {
        // Update existing user
        await updateUserAccount(editUser.id, {
          name: formData.name.trim(),
          role: formData.role,
          department: resolvedDept,
          departmentName: resolvedDept,
          isActive: formData.isActive,
        });
        notification.success(`Account for ${formData.name} updated successfully!`);
      } else {
        // Create new role-specific user
        await createUserAccount({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password || undefined,
          role: formData.role,
          department: resolvedDept,
          departmentName: resolvedDept,
        });
        notification.success(`${formData.role} account (${resolvedDept}) for ${formData.name} created & authenticated!`);
      }

      setModalOpen(false);
      setCustomDepartment("");
      await loadData();
    } catch (err) {
      notification.error(err.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      setDeleting(true);
      await deleteUserAccount(userToDelete.id);
      notification.success(`Account ${userToDelete.name} removed from database.`);
      setDeleteModalOpen(false);
      setUserToDelete(null);
      await loadData();
    } catch (err) {
      notification.error(err.message || "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  const getRoleBadge = (u) => {
    if (u.is_super_admin || u.id === 1) {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 11px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #DB2777 0%, #BE185D 100%)",
            color: "#FFFFFF",
            fontSize: "11px",
            fontWeight: "800",
            letterSpacing: "0.4px",
            boxShadow: "0 2px 8px rgba(219, 39, 119, 0.22)",
          }}
        >
          <ShieldCheck size={13} />
          PRIMARY ADMINISTRATOR
        </span>
      );
    }

    if (u.role === "ADMIN") {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "4px 10px",
            borderRadius: "14px",
            backgroundColor: "#FFF0F7",
            color: "#DB2777",
            border: "1px solid #FCE7F3",
            fontSize: "11px",
            fontWeight: "700",
          }}
        >
          <ShieldAlert size={12} />
          ADMINISTRATOR
        </span>
      );
    }

    if (u.role === "TEAM_LEAD") {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "4px 10px",
            borderRadius: "14px",
            backgroundColor: "#FFF0F7",
            color: "#DB2777",
            border: "1px solid #FBCFE8",
            fontSize: "11px",
            fontWeight: "700",
          }}
        >
          <ShieldCheck size={12} />
          TEAM LEAD
        </span>
      );
    }

    if (u.role === "HR") {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "4px 10px",
            borderRadius: "14px",
            backgroundColor: "#EFF6FF",
            color: "#2563EB",
            border: "1px solid #DBEAFE",
            fontSize: "11px",
            fontWeight: "700",
          }}
        >
          <Building size={12} />
          HR MANAGER
        </span>
      );
    }

    if (u.role === "FINANCE") {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "4px 10px",
            borderRadius: "14px",
            backgroundColor: "#ECFDF5",
            color: "#059669",
            border: "1px solid #A7F3D0",
            fontSize: "11px",
            fontWeight: "700",
          }}
        >
          <WalletCards size={12} />
          FINANCE EXECUTIVE
        </span>
      );
    }

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          padding: "4px 10px",
          borderRadius: "14px",
          backgroundColor: "#F8FAFC",
          color: "#475569",
          border: "1px solid #E2E8F0",
          fontSize: "11px",
          fontWeight: "700",
        }}
      >
        <User size={12} />
        EMPLOYEE
      </span>
    );
  };

  const getInitials = (name) => {
    if (!name) return "US";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // Get Role Specific Details for the Modal
  const getModalRoleMeta = () => {
    if (modalTargetRole === "ADMIN") {
      return {
        title: editUser ? "Edit Primary Administrator Account" : "Provision Primary Administrator Account",
        subtitle: "Assign Primary Administrative access for system operations (Strict 1 Primary Admin limit)",
        roleLabel: "PRIMARY ADMINISTRATOR (System Operations)",
        icon: ShieldCheck,
        badgeBg: "#FFF0F7",
        badgeBorder: "#FCE7F3",
        badgeColor: "#DB2777",
        defaultPasswordHint: "Admin@123",
      };
    }
    if (modalTargetRole === "TEAM_LEAD") {
      return {
        title: editUser ? "Edit Department Team Lead" : "Provision Department Team Lead",
        subtitle: "Assign Team Lead to manage department staff, attendance, and leave approvals",
        roleLabel: "DEPARTMENT TEAM LEAD (Department Head)",
        icon: ShieldCheck,
        badgeBg: "#FFF0F7",
        badgeBorder: "#FBCFE8",
        badgeColor: "#DB2777",
        defaultPasswordHint: "TeamLead@123",
      };
    }
    if (modalTargetRole === "HR") {
      return {
        title: editUser ? "Edit HR Manager Account" : "Provision HR Manager Account",
        subtitle: "Assign human resources management and onboarding authority",
        roleLabel: "HR MANAGER (Human Resources)",
        icon: Building,
        badgeBg: "#EFF6FF",
        badgeBorder: "#DBEAFE",
        badgeColor: "#2563EB",
        defaultPasswordHint: "HR@123",
      };
    }
    if (modalTargetRole === "EMPLOYEE") {
      return {
        title: editUser ? "Edit Employee Account" : "Provision Employee Account",
        subtitle: "Manage staff profile, status, and department assignment",
        roleLabel: "EMPLOYEE (Staff Member)",
        icon: User,
        badgeBg: "#F8FAFC",
        badgeBorder: "#E2E8F0",
        badgeColor: "#475569",
        defaultPasswordHint: "Employee@123",
      };
    }
    return {
      title: editUser ? "Edit Finance Team Account" : "Provision Finance Team Account",
      subtitle: "Assign payroll, financial reports, and compensation authority",
      roleLabel: "FINANCE EXECUTIVE (Accounts & Payroll)",
      icon: WalletCards,
      badgeBg: "#ECFDF5",
      badgeBorder: "#A7F3D0",
      badgeColor: "#059669",
      defaultPasswordHint: "Finance@123",
    };
  };

  const modalMeta = getModalRoleMeta();
  const ModalRoleIcon = modalMeta.icon;

  return (
    <div className="user-management-page" style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
      {/* PAGE HEADING */}
      <div className="module-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <p className="section-label">ENTERPRISE GOVERNANCE</p>
          <h1 style={{ margin: "4px 0 6px 0", fontSize: "26px", fontWeight: "800", color: "#0F172A" }}>
            Roles & Team Users
          </h1>
          <p style={{ margin: 0, color: "#64748B", fontSize: "14px", lineHeight: "1.5" }}>
            Provision enterprise administrators, configure HR & Finance teams, and manage permission hierarchies.
          </p>
        </div>

        {/* UNIFIED EXECUTIVE ACTION BUTTONS */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          {isSuperAdmin && (
            /* SUPER ADMIN: EXCLUSIVELY CAN PROVISION PRIMARY ADMINISTRATOR */
            <button
              type="button"
              onClick={() => handleOpenCreateForRole("ADMIN")}
              disabled={!canAddAdmin}
              onMouseEnter={() => setHoveredBtn("ADMIN")}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                height: "38px",
                padding: "0 18px",
                borderRadius: "10px",
                border: "1.5px solid #F3D3E7",
                backgroundColor: !canAddAdmin
                  ? "#F8FAFC"
                  : hoveredBtn === "ADMIN"
                    ? "#BE185D"
                    : "#FFF0F7",
                color: !canAddAdmin
                  ? "#94A3B8"
                  : hoveredBtn === "ADMIN"
                    ? "#FFFFFF"
                    : "#BE185D",
                fontSize: "13px",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                cursor: canAddAdmin ? "pointer" : "not-allowed",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: canAddAdmin && hoveredBtn === "ADMIN" ? "0 4px 12px rgba(190, 24, 93, 0.25)" : "none",
                transform: canAddAdmin && hoveredBtn === "ADMIN" ? "translateY(-1px)" : "none",
              }}
              title={canAddAdmin ? "Provision Primary Administrator Account (1 Admin Max)" : "Primary Administrator Capacity Reached (1/1)"}
            >
              <ShieldCheck size={16} color={!canAddAdmin ? "#94A3B8" : hoveredBtn === "ADMIN" ? "#FFFFFF" : "#BE185D"} />
              <span>+ Add Primary Admin ({coAdminCount}/{maxCoAdmins})</span>
            </button>
          )}

          {isPrimaryAdmin && (
            <>
              <button
                type="button"
                onClick={() => handleOpenCreateForRole("TEAM_LEAD")}
                onMouseEnter={() => setHoveredBtn("TEAM_LEAD")}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  height: "38px",
                  padding: "0 18px",
                  borderRadius: "10px",
                  border: "1.5px solid #FBCFE8",
                  backgroundColor: hoveredBtn === "TEAM_LEAD" ? "#DB2777" : "#FFF0F7",
                  color: hoveredBtn === "TEAM_LEAD" ? "#FFFFFF" : "#DB2777",
                  fontSize: "13px",
                  fontWeight: "700",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  cursor: "pointer",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: hoveredBtn === "TEAM_LEAD" ? "0 4px 12px rgba(219, 39, 119, 0.25)" : "none",
                  transform: hoveredBtn === "TEAM_LEAD" ? "translateY(-1px)" : "none",
                }}
                title="Provision Department Team Lead Account"
              >
                <ShieldCheck size={16} color={hoveredBtn === "TEAM_LEAD" ? "#FFFFFF" : "#DB2777"} />
                <span>+ Add Team Lead</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenCreateForRole("HR")}
                onMouseEnter={() => setHoveredBtn("HR")}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  height: "38px",
                  padding: "0 18px",
                  borderRadius: "10px",
                  border: "1.5px solid #DBEAFE",
                  backgroundColor: hoveredBtn === "HR" ? "#1D4ED8" : "#EFF6FF",
                  color: hoveredBtn === "HR" ? "#FFFFFF" : "#1D4ED8",
                  fontSize: "13px",
                  fontWeight: "700",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  cursor: "pointer",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: hoveredBtn === "HR" ? "0 4px 12px rgba(29, 78, 216, 0.25)" : "none",
                  transform: hoveredBtn === "HR" ? "translateY(-1px)" : "none",
                }}
                title="Provision HR Manager Account"
              >
                <Building size={16} color={hoveredBtn === "HR" ? "#FFFFFF" : "#1D4ED8"} />
                <span>+ Add HR Member</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenCreateForRole("FINANCE")}
                onMouseEnter={() => setHoveredBtn("FINANCE")}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  height: "38px",
                  padding: "0 18px",
                  borderRadius: "10px",
                  border: "1.5px solid #A7F3D0",
                  backgroundColor: hoveredBtn === "FINANCE" ? "#047857" : "#ECFDF5",
                  color: hoveredBtn === "FINANCE" ? "#FFFFFF" : "#047857",
                  fontSize: "13px",
                  fontWeight: "700",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  cursor: "pointer",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: hoveredBtn === "FINANCE" ? "0 4px 12px rgba(4, 120, 87, 0.25)" : "none",
                  transform: hoveredBtn === "FINANCE" ? "translateY(-1px)" : "none",
                }}
                title="Provision Finance Team Member Account"
              >
                <WalletCards size={16} color={hoveredBtn === "FINANCE" ? "#FFFFFF" : "#047857"} />
                <span>+ Add Finance Member</span>
              </button>
            </>
          )}

          {isHR && !isPrimaryAdmin && (
            <button
              type="button"
              onClick={() => handleOpenCreateForRole("TEAM_LEAD")}
              onMouseEnter={() => setHoveredBtn("TEAM_LEAD")}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                height: "38px",
                padding: "0 18px",
                borderRadius: "10px",
                border: "1.5px solid #FBCFE8",
                backgroundColor: hoveredBtn === "TEAM_LEAD" ? "#DB2777" : "#FFF0F7",
                color: hoveredBtn === "TEAM_LEAD" ? "#FFFFFF" : "#DB2777",
                fontSize: "13px",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: hoveredBtn === "TEAM_LEAD" ? "0 4px 12px rgba(219, 39, 119, 0.25)" : "none",
                transform: hoveredBtn === "TEAM_LEAD" ? "translateY(-1px)" : "none",
              }}
              title="Provision Department Team Lead Account"
            >
              <ShieldCheck size={16} color={hoveredBtn === "TEAM_LEAD" ? "#FFFFFF" : "#DB2777"} />
              <span>+ Add Team Lead</span>
            </button>
          )}
        </div>
      </div>

      {/* SEARCH & FILTERS SECTION */}
      <section className="dashboard-card" style={{ padding: "0", overflow: "hidden", borderRadius: "14px", border: "1px solid #E2E8F0" }}>
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #F1F5F9",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "14px",
            background: "#FAFCFF",
          }}
        >
          {/* TAB BUTTONS */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[
              { id: "ALL", label: "All Accounts" },
              { id: "ADMIN", label: `Administrators (${coAdminCount + 1})` },
              { id: "TEAM_LEAD", label: "Team Leads" },
              { id: "HR", label: "HR Department" },
              { id: "FINANCE", label: "Finance Team" },
              { id: "EMPLOYEE", label: "Employees" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "7px 15px",
                  borderRadius: "8px",
                  border: activeTab === tab.id ? "1.5px solid #DB2777" : "1px solid #E2E8F0",
                  backgroundColor: activeTab === tab.id ? "#FFF0F7" : "#FFFFFF",
                  color: activeTab === tab.id ? "#DB2777" : "#64748B",
                  fontSize: "12.5px",
                  fontWeight: activeTab === tab.id ? "700" : "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: activeTab === tab.id ? "0 2px 6px rgba(219, 39, 119, 0.08)" : "none",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* SEARCH INPUT */}
          <div style={{ position: "relative", minWidth: "240px" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 36px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                fontSize: "13px",
                outline: "none",
                backgroundColor: "#FFFFFF",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* DATA TABLE */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                <th style={{ padding: "14px 20px", fontSize: "12px", color: "#64748B", fontWeight: "700" }}>USER DETAILS</th>
                <th style={{ padding: "14px 20px", fontSize: "12px", color: "#64748B", fontWeight: "700" }}>ROLE & AUTHORITY</th>
                <th style={{ padding: "14px 20px", fontSize: "12px", color: "#64748B", fontWeight: "700" }}>ASSIGNED DEPARTMENT</th>
                <th style={{ padding: "14px 20px", fontSize: "12px", color: "#64748B", fontWeight: "700" }}>STATUS</th>
                <th style={{ padding: "14px 20px", fontSize: "12px", color: "#64748B", fontWeight: "700", textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: "34px", textAlign: "center", color: "#94A3B8" }}>
                    Loading user directory...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "34px", textAlign: "center", color: "#94A3B8" }}>
                    No users found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isTargetSuper = Boolean(u.is_super_admin) || (u.email || "").toLowerCase().trim() === "omraikar2128@gmail.com" || (u.email || "").toLowerCase().trim() === "omraikar2128@gamil.com";
                  const isTargetAdmin = u.role === "ADMIN";
                  const isSelf = u.id === currentUserId;

                  const canEditThisUser = isSuperAdmin
                    ? !isTargetSuper
                    : isTargetSuper || isTargetAdmin
                    ? false
                    : isPrimaryAdmin
                    ? true
                    : isHR
                    ? (u.role === "EMPLOYEE" || u.role === "TEAM_LEAD")
                    : false;

                  const canDeleteThisUser =
                    !isTargetSuper &&
                    !isSelf &&
                    (isSuperAdmin
                      ? isTargetAdmin
                      : isPrimaryAdmin
                      ? !isTargetAdmin
                      : isHR
                      ? (u.role === "EMPLOYEE" || u.role === "TEAM_LEAD")
                      : false);

                  const displayDeptName = isTargetSuper
                    ? "All Departments (Super Admin)"
                    : u.department_name || u.department || (u.role === "HR" ? "Human Resources" : u.role === "FINANCE" ? "Finance" : "Administration");

                  return (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: "1px solid #F1F5F9",
                        backgroundColor: isTargetSuper ? "rgba(219, 39, 119, 0.02)" : "#FFFFFF",
                        transition: "background-color 0.15s ease",
                      }}
                    >
                      {/* USER DETAILS */}
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div
                            style={{
                              width: "38px",
                              height: "38px",
                              borderRadius: "50%",
                              background: isTargetSuper
                                ? "linear-gradient(135deg, #DB2777 0%, #BE185D 100%)"
                                : "#F1F5F9",
                              color: isTargetSuper ? "#FFFFFF" : "#475569",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "700",
                              fontSize: "13px",
                              overflow: "hidden",
                              flexShrink: 0,
                            }}
                          >
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              getInitials(u.name)
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: "14px", fontWeight: "700", color: "#0F172A" }}>
                              {u.name} {isSelf && <span style={{ fontSize: "11.5px", color: "#DB2777", fontWeight: "600" }}>(You)</span>}
                            </div>
                            <div style={{ fontSize: "12.5px", color: "#64748B" }}>{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* ROLE BADGE */}
                      <td style={{ padding: "14px 20px" }}>
                        {getRoleBadge(u)}
                      </td>

                      {/* ASSIGNED DEPARTMENT */}
                      <td style={{ padding: "14px 20px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "700",
                            backgroundColor: isTargetSuper
                              ? "#FDF2F8"
                              : u.role === "HR"
                              ? "#EFF6FF"
                              : u.role === "FINANCE"
                              ? "#ECFDF5"
                              : "#F8FAFC",
                            color: isTargetSuper
                              ? "#BE185D"
                              : u.role === "HR"
                              ? "#1D4ED8"
                              : u.role === "FINANCE"
                              ? "#047857"
                              : "#334155",
                            border: isTargetSuper
                              ? "1px solid #FBCFE8"
                              : u.role === "HR"
                              ? "1px solid #BFDBFE"
                              : u.role === "FINANCE"
                              ? "1px solid #A7F3D0"
                              : "1px solid #E2E8F0",
                          }}
                        >
                          <Building size={13} />
                          {displayDeptName}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td style={{ padding: "14px 20px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "12.5px",
                            fontWeight: "600",
                            color: u.is_active !== false ? "#16A34A" : "#DC2626",
                          }}
                        >
                          <span
                            style={{
                              width: "7px",
                              height: "7px",
                              borderRadius: "50%",
                              backgroundColor: u.is_active !== false ? "#16A34A" : "#DC2626",
                            }}
                          />
                          {u.is_active !== false ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td style={{ padding: "14px 20px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                          {isTargetSuper ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "6px 14px",
                                borderRadius: "8px",
                                backgroundColor: "#F8FAFC",
                                border: "1px solid #E2E8F0",
                                color: "#64748B",
                                fontSize: "11.5px",
                                fontWeight: "700",
                              }}
                              title="Super administrator account is permanent"
                            >
                              <Lock size={13} />
                              Super Admin
                            </span>
                          ) : isTargetAdmin && !isSuperAdmin ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "6px 14px",
                                borderRadius: "8px",
                                backgroundColor: "#FFF0F7",
                                border: "1px solid #FBCFE8",
                                color: "#DB2777",
                                fontSize: "11.5px",
                                fontWeight: "700",
                              }}
                              title="Primary Admin is the executive head (Managed by Super Admin)"
                            >
                              <ShieldCheck size={13} />
                              Head Admin
                            </span>
                          ) : (
                            <>
                              {canEditThisUser && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(u)}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    padding: "6px 14px",
                                    borderRadius: "8px",
                                    border: "1px solid #CBD5E1",
                                    backgroundColor: "#FFFFFF",
                                    color: "#334155",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    transition: "all 0.15s ease",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = "#94A3B8";
                                    e.currentTarget.style.backgroundColor = "#F8FAFC";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = "#CBD5E1";
                                    e.currentTarget.style.backgroundColor = "#FFFFFF";
                                  }}
                                >
                                  <Edit2 size={13} />
                                  Edit
                                </button>
                              )}

                              {canDeleteThisUser && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenDelete(u)}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    padding: "6px 14px",
                                    borderRadius: "8px",
                                    border: "1px solid #FECDD3",
                                    backgroundColor: "#FFF1F2",
                                    color: "#BE123C",
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    transition: "all 0.15s ease",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = "#BE123C";
                                    e.currentTarget.style.color = "#FFFFFF";
                                    e.currentTarget.style.borderColor = "#BE123C";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "#FFF1F2";
                                    e.currentTarget.style.color = "#BE123C";
                                    e.currentTarget.style.borderColor = "#FECDD3";
                                  }}
                                >
                                  <Trash2 size={13} />
                                  Remove
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* DEDICATED ROLE-LOCKED PROVISION MODAL */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
            boxSizing: "border-box",
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "18px",
              width: "100%",
              maxWidth: "490px",
              maxHeight: "92vh",
              overflowY: "auto",
              border: "1px solid #E2E8F0",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.28)",
              boxSizing: "border-box",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER WITH ROLE BADGE */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #F1F5F9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(135deg, #FFFFFF 0%, #FFF8FC 100%)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "12px",
                    background: modalMeta.badgeBg,
                    border: `1.5px solid ${modalMeta.badgeBorder}`,
                    color: modalMeta.badgeColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <ModalRoleIcon size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16.5px", color: "#0F172A", fontWeight: "800" }}>
                    {modalMeta.title}
                  </h3>
                  <span style={{ fontSize: "12px", color: "#64748B" }}>
                    {modalMeta.subtitle}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{
                  border: "none",
                  background: "#F1F5F9",
                  color: "#64748B",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "background-color 0.15s ease",
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* ASSIGNED ROLE (LOCKED & PRESELECTED TO THE CLICKED BUTTON) */}
              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: "800", color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Assigned Authority & Role
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    backgroundColor: modalMeta.badgeBg,
                    border: `1.5px solid ${modalMeta.badgeBorder}`,
                    color: modalMeta.badgeColor,
                    fontSize: "13px",
                    fontWeight: "800",
                  }}
                >
                  <ModalRoleIcon size={16} />
                  <span>{modalMeta.roleLabel}</span>
                </div>
              </div>

              {/* NAME */}
              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: "800", color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Swapnil Patil"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: "100%",
                    height: "42px",
                    padding: "0 14px",
                    borderRadius: "10px",
                    border: "1.5px solid #CBD5E1",
                    fontSize: "13.5px",
                    outline: "none",
                    boxSizing: "border-box",
                    backgroundColor: "#FFFFFF",
                  }}
                  required
                />
              </div>

              {/* EMAIL */}
              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: "800", color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="e.g. swapnil@example.com"
                  value={formData.email}
                  disabled={!!editUser}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: "100%",
                    height: "42px",
                    padding: "0 14px",
                    borderRadius: "10px",
                    border: "1.5px solid #CBD5E1",
                    fontSize: "13.5px",
                    outline: "none",
                    backgroundColor: editUser ? "#F1F5F9" : "#FFFFFF",
                    boxSizing: "border-box",
                  }}
                  required
                />
              </div>

              {/* ASSIGNED DEPARTMENT */}
              <div>
                <label style={{ display: "block", fontSize: "11.5px", fontWeight: "800", color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Assigned Department *
                </label>
                {formData.role === "ADMIN" ? (
                  <input
                    type="text"
                    disabled
                    value="Administration"
                    style={{
                      width: "100%",
                      height: "42px",
                      padding: "0 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #CBD5E1",
                      fontSize: "13.5px",
                      backgroundColor: "#F1F5F9",
                      fontWeight: "700",
                      color: "#BE185D",
                      boxSizing: "border-box",
                    }}
                  />
                ) : formData.role === "HR" ? (
                  <input
                    type="text"
                    disabled
                    value="Human Resources"
                    style={{
                      width: "100%",
                      height: "42px",
                      padding: "0 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #CBD5E1",
                      fontSize: "13.5px",
                      backgroundColor: "#F1F5F9",
                      fontWeight: "700",
                      color: "#2563EB",
                      boxSizing: "border-box",
                    }}
                  />
                ) : formData.role === "FINANCE" ? (
                  <input
                    type="text"
                    disabled
                    value="Finance"
                    style={{
                      width: "100%",
                      height: "42px",
                      padding: "0 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #CBD5E1",
                      fontSize: "13.5px",
                      backgroundColor: "#F1F5F9",
                      fontWeight: "700",
                      color: "#059669",
                      boxSizing: "border-box",
                    }}
                  />
                ) : (
                  <>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      style={{
                        width: "100%",
                        height: "42px",
                        padding: "0 14px",
                        borderRadius: "10px",
                        border: "1.5px solid #CBD5E1",
                        fontSize: "13.5px",
                        outline: "none",
                        backgroundColor: "#FFFFFF",
                        boxSizing: "border-box",
                        fontWeight: "600",
                        color: "#0F172A",
                      }}
                      required
                    >
                      {availableAdminDepartments.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                      <option value="CUSTOM">+ Add Custom Department...</option>
                    </select>

                    {formData.department === "CUSTOM" && (
                      <input
                        type="text"
                        placeholder="Enter custom department name (e.g. AI Research)"
                        value={customDepartment}
                        onChange={(e) => setCustomDepartment(e.target.value)}
                        style={{
                          width: "100%",
                          height: "42px",
                          marginTop: "8px",
                          padding: "0 14px",
                          borderRadius: "10px",
                          border: "1.5px solid #DB2777",
                          fontSize: "13.5px",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                        required
                      />
                    )}
                  </>
                )}
                <p style={{ margin: "5px 0 0 0", fontSize: "11.5px", color: "#64748B", lineHeight: "1.4" }}>
                  {formData.role === "ADMIN"
                    ? "Primary Admin manages system-wide operations and departments."
                    : formData.role === "TEAM_LEAD"
                    ? "Assigns Team Lead authority over staff, attendance, and leave requests in this department."
                    : formData.role === "HR"
                    ? "Human Resources management and staff onboarding authority."
                    : "Financial operations and payroll access."}
                </p>
              </div>

              {/* PASSWORD (OPTIONAL FOR NEW) */}
              {!editUser && (
                <div>
                  <label style={{ display: "block", fontSize: "11.5px", fontWeight: "800", color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Initial Password (Optional)
                  </label>
                  <input
                    type="password"
                    placeholder={`Defaults to ${modalMeta.defaultPasswordHint} if left blank`}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    style={{
                      width: "100%",
                      height: "42px",
                      padding: "0 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #CBD5E1",
                      fontSize: "13.5px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <p style={{ margin: "5px 0 0 0", fontSize: "11.5px", color: "#64748B" }}>
                    User can log in immediately with this password upon database provisioning.
                  </p>
                </div>
              )}

              {/* STATUS (FOR EDIT) */}
              {editUser && !editUser.is_super_admin && editUser.id !== 1 && (
                <div>
                  <label style={{ display: "block", fontSize: "11.5px", fontWeight: "800", color: "#475569", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Account Status
                  </label>
                  <select
                    value={formData.isActive ? "true" : "false"}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
                    style={{
                      width: "100%",
                      height: "42px",
                      padding: "0 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #CBD5E1",
                      fontSize: "13.5px",
                      outline: "none",
                      backgroundColor: "#FFFFFF",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="true">Active (Access Enabled)</option>
                    <option value="false">Inactive (Suspended)</option>
                  </select>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    height: "40px",
                    padding: "0 20px",
                    borderRadius: "10px",
                    border: "1.5px solid #CBD5E1",
                    background: "#FFFFFF",
                    color: "#475569",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    height: "40px",
                    padding: "0 22px",
                    borderRadius: "10px",
                    border: "none",
                    background: "linear-gradient(135deg, #DB2777 0%, #BE185D 100%)",
                    color: "#FFFFFF",
                    fontSize: "13px",
                    fontWeight: "800",
                    cursor: submitting ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 14px rgba(219, 39, 119, 0.3)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  {submitting
                    ? "Saving to DB..."
                    : editUser
                    ? "Update Account"
                    : `Provision ${
                        formData.role === "TEAM_LEAD"
                          ? "Team Lead"
                          : formData.role === "HR"
                          ? "HR Manager"
                          : formData.role === "FINANCE"
                          ? "Finance Member"
                          : "Primary Admin"
                      }`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && userToDelete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => setDeleteModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "440px",
              border: "1px solid #FECDD3",
              boxShadow: "0 20px 45px rgba(0, 0, 0, 0.2)",
              padding: "24px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                backgroundColor: "#FFF1F2",
                color: "#E11D48",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <Trash2 size={22} />
            </div>

            <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", color: "#0F172A", fontWeight: "800" }}>
              Remove User Account?
            </h3>

            <p style={{ margin: "0 0 20px 0", fontSize: "13.5px", color: "#475569", lineHeight: "1.5" }}>
              Are you sure you want to remove <strong>{userToDelete.name}</strong> ({userToDelete.email}) from the database? They will immediately lose access to the portal.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                style={{
                  padding: "9px 18px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  background: "#FFFFFF",
                  color: "#475569",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                style={{
                  padding: "9px 20px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#DC2626",
                  color: "#FFFFFF",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: deleting ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 14px rgba(220, 38, 38, 0.3)",
                }}
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
