import { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  Users,
  Building,
  WalletCards,
  Lock,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Info,
  KeyRound,
  Mail,
  User,
  Search,
  Filter,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../hooks/useNotification";
import {
  getUsersList,
  createUserAccount,
  updateUserAccount,
  deleteUserAccount,
} from "../../services/userService";

function UserManagement() {
  const { user, role } = useAuth();
  const notification = useNotification();
  const userRole = (role || user?.role || "EMPLOYEE").toUpperCase();
  const currentUserId = user?.id || user?.userId;

  const isAdmin = userRole === "ADMIN";
  const isHR = userRole === "HR";

  const [data, setData] = useState({
    users: [],
    telemetry: {
      totalUsers: 0,
      primaryAdminCount: 1,
      coAdminCount: 0,
      maxCoAdmins: 4,
      canAddCoAdmin: false,
      remainingSlots: 4,
    },
    permissions: {},
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTargetRole, setModalTargetRole] = useState("ADMIN"); // 'ADMIN' | 'HR' | 'FINANCE'
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "ADMIN",
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  // Button Hover States for perfect visual control
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

  useEffect(() => {
    loadData();
  }, []);

  const { users = [], telemetry = {} } = data;

  const coAdminCount = telemetry.coAdminCount || 0;
  const maxCoAdmins = telemetry.maxCoAdmins || 4;
  const remainingSlots = Math.max(0, maxCoAdmins - coAdminCount);
  const canAddAdmin = isAdmin && remainingSlots > 0;

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (activeTab === "ADMIN" && u.role !== "ADMIN") return false;
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

    setFormData({
      name: "",
      email: "",
      password: "",
      role: targetRole,
      isActive: true,
    });
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
      isActive: target.is_active !== false,
    });
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

    try {
      setSubmitting(true);

      if (editUser) {
        // Update existing user
        await updateUserAccount(editUser.id, {
          name: formData.name.trim(),
          role: formData.role,
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
        });
        notification.success(`${formData.role} account for ${formData.name} created & authenticated in database!`);
      }

      setModalOpen(false);
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
        title: editUser ? "Edit Administrator Account" : "Provision Administrator Account",
        subtitle: "Assign secondary administrative access (up to 4 co-admins)",
        roleLabel: "ADMINISTRATOR (Co-Admin)",
        icon: ShieldCheck,
        badgeBg: "#FFF0F7",
        badgeBorder: "#FCE7F3",
        badgeColor: "#DB2777",
        defaultPasswordHint: "Admin@123",
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
            Team & Role Management
          </h1>
          <p style={{ margin: 0, color: "#64748B", fontSize: "14px", lineHeight: "1.5" }}>
            Provision enterprise administrators, configure HR & Finance teams, and manage permission hierarchies.
          </p>
        </div>

        {/* UNIFIED EXECUTIVE ACTION BUTTONS */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          {isAdmin && (
            <>
              {/* BUTTON 1: ADD ADMINISTRATOR */}
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
                title={canAddAdmin ? "Provision Administrator Account (up to 4 co-admins)" : "Administrator Capacity Reached (4/4)"}
              >
                <ShieldCheck size={16} color={!canAddAdmin ? "#94A3B8" : hoveredBtn === "ADMIN" ? "#FFFFFF" : "#BE185D"} />
                <span>+ Add Administrator ({coAdminCount}/4)</span>
              </button>

              {/* BUTTON 2: ADD HR MEMBER */}
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
            </>
          )}

          {/* BUTTON 3: ADD FINANCE MEMBER */}
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
        </div>
      </div>

      {/* TELEMETRY & CAPACITY CARDS */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
        {/* ADMIN CAPACITY CARD */}
        <div
          className="dashboard-card"
          style={{
            background: "linear-gradient(135deg, #FFFFFF 0%, #FFF8FC 100%)",
            border: "1px solid #F3D3E7",
            padding: "20px",
            borderRadius: "14px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#DB2777", letterSpacing: "0.5px" }}>
                ADMINISTRATOR CAPACITY
              </span>
              <h3 style={{ margin: "4px 0 0 0", fontSize: "22px", color: "#0F172A", fontWeight: "800" }}>
                {coAdminCount} / {maxCoAdmins} Assigned
              </h3>
            </div>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                background: "#FFF0F7",
                color: "#DB2777",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldCheck size={20} />
            </div>
          </div>

          {/* PROGRESS SLOTS */}
          <div style={{ display: "flex", gap: "6px", margin: "12px 0 10px" }}>
            {[1, 2, 3, 4].map((slot) => {
              const isFilled = slot <= coAdminCount;
              return (
                <div
                  key={slot}
                  style={{
                    flex: 1,
                    height: "7px",
                    borderRadius: "4px",
                    backgroundColor: isFilled ? "#DB2777" : "#FCE7F3",
                    transition: "all 0.3s ease",
                  }}
                  title={isFilled ? `Slot ${slot}: Assigned` : `Slot ${slot}: Available`}
                />
              );
            })}
          </div>
          <p style={{ margin: 0, fontSize: "12.5px", color: "#64748B" }}>
            {remainingSlots > 0
              ? `${remainingSlots} administrator slot(s) available for delegation.`
              : "Maximum capacity reached (4 co-admins assigned)."}
          </p>
        </div>

        {/* ROOT SUPER ADMIN PROTECTION */}
        <div
          className="dashboard-card"
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            padding: "20px",
            borderRadius: "14px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#059669", letterSpacing: "0.5px" }}>
                GOVERNANCE & SECURITY
              </span>
              <h3 style={{ margin: "4px 0 0 0", fontSize: "18px", color: "#0F172A", fontWeight: "800" }}>
                Primary Admin Protected
              </h3>
            </div>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                background: "#ECFDF5",
                color: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Lock size={20} />
            </div>
          </div>
          <p style={{ margin: 0, fontSize: "12.5px", color: "#64748B", lineHeight: "1.45" }}>
            The root enterprise administrator account is permanent and cannot be deleted or demoted.
          </p>
        </div>

        {/* HR & FINANCE CAPABILITY */}
        <div
          className="dashboard-card"
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            padding: "20px",
            borderRadius: "14px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#2563EB", letterSpacing: "0.5px" }}>
                DEPARTMENT DELEGATION
              </span>
              <h3 style={{ margin: "4px 0 0 0", fontSize: "18px", color: "#0F172A", fontWeight: "800" }}>
                HR & Finance Provisioning
              </h3>
            </div>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                background: "#EFF6FF",
                color: "#2563EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={20} />
            </div>
          </div>
          <p style={{ margin: 0, fontSize: "12.5px", color: "#64748B", lineHeight: "1.45" }}>
            HR managers have dedicated authority to provision, update, and manage Finance team members.
          </p>
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
                <th style={{ padding: "14px 20px", fontSize: "12px", color: "#64748B", fontWeight: "700" }}>STATUS</th>
                <th style={{ padding: "14px 20px", fontSize: "12px", color: "#64748B", fontWeight: "700", textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ padding: "34px", textAlign: "center", color: "#94A3B8" }}>
                    Loading user directory...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: "34px", textAlign: "center", color: "#94A3B8" }}>
                    No users found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSuper = Boolean(u.is_super_admin) || (u.email || "").toLowerCase() === "omraikar2128@gmail.com";
                  const isSelf = u.id === currentUserId;

                  const canEditThisUser =
                    isAdmin ||
                    (isHR && u.role === "FINANCE");

                  const canDeleteThisUser =
                    !isSuper &&
                    !isSelf &&
                    (isAdmin || (isHR && u.role === "FINANCE"));

                  return (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: "1px solid #F1F5F9",
                        backgroundColor: isSuper ? "rgba(219, 39, 119, 0.02)" : "#FFFFFF",
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
                              background: isSuper
                                ? "linear-gradient(135deg, #DB2777 0%, #BE185D 100%)"
                                : "#F1F5F9",
                              color: isSuper ? "#FFFFFF" : "#475569",
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
                          {isSuper ? (
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
                              title="Primary administrator is permanent and cannot be removed"
                            >
                              <Lock size={13} />
                              Permanent
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
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "500px",
              border: "1px solid #F3D3E7",
              boxShadow: "0 20px 45px rgba(0, 0, 0, 0.2)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER WITH ROLE BADGE */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #FCE7F3",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(135deg, #FFFFFF 0%, #FFF8FC 100%)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: modalMeta.badgeBg,
                    border: `1px solid ${modalMeta.badgeBorder}`,
                    color: modalMeta.badgeColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ModalRoleIcon size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px", color: "#0F172A", fontWeight: "800" }}>
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
                  background: "#FFF0F7",
                  color: "#64748B",
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* ASSIGNED ROLE (LOCKED & PRESELECTED TO THE CLICKED BUTTON) */}
              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Assigned Authority & Role
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    backgroundColor: modalMeta.badgeBg,
                    border: `1px solid ${modalMeta.badgeBorder}`,
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
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    fontSize: "13.5px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  required
                />
              </div>

              {/* EMAIL */}
              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="e.g. employee@example.com"
                  value={formData.email}
                  disabled={!!editUser}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    fontSize: "13.5px",
                    outline: "none",
                    backgroundColor: editUser ? "#F1F5F9" : "#FFFFFF",
                    boxSizing: "border-box",
                  }}
                  required
                />
              </div>

              {/* PASSWORD (OPTIONAL FOR NEW) */}
              {!editUser && (
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                    Initial Password (Optional)
                  </label>
                  <input
                    type="password"
                    placeholder={`Defaults to ${modalMeta.defaultPasswordHint} if left blank`}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #CBD5E1",
                      fontSize: "13.5px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <p style={{ margin: "4px 0 0 0", fontSize: "11.5px", color: "#64748B" }}>
                    User can log in immediately with this password upon database provisioning.
                  </p>
                </div>
              )}

              {/* STATUS (FOR EDIT) */}
              {editUser && !editUser.is_super_admin && editUser.id !== 1 && (
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                    Account Status
                  </label>
                  <select
                    value={formData.isActive ? "true" : "false"}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #CBD5E1",
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

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
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
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "9px 22px",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, #DB2777 0%, #BE185D 100%)",
                    color: "#FFFFFF",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: submitting ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 14px rgba(219, 39, 119, 0.3)",
                  }}
                >
                  {submitting ? "Saving to DB..." : editUser ? "Update Account" : `Provision ${formData.role}`}
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
