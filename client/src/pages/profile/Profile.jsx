import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Shield,
  Building2,
  CheckCircle,
  Key,
  LogOut,
  Lock,
  Camera,
  Edit3,
  X,
  Save,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  CreditCard,
  Printer,
  Receipt,
  TrendingUp,
  Wallet,
  BadgeCheck,
  Building,
  Server,
  Cpu,
  Activity,
  Users,
  Layers,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../hooks/useNotification";
import { updateUserProfile, getStoredUser } from "../../services/authService";
import { getEmployees } from "../../services/employeeService";
import { getPayslips } from "../../services/payslipService";
import { getLoadedSettings } from "../../services/settingsService";


const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
];

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const notification = useNotification();
  const fileInputRef = useRef(null);

  // Profile data
  const [currentUser, setCurrentUser] = useState(() => getStoredUser() || user || {});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  // Password Modal State
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Payroll & Employee Data
  const settings = getLoadedSettings();
  const currencySymbol = settings.currencySymbol || "₹";
  const [employeeData, setEmployeeData] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [_loadingPayroll, setLoadingPayroll] = useState(true);

  useEffect(() => {
    const handleProfileUpdate = () => {
      const updated = getStoredUser();
      if (updated) setCurrentUser(updated);
    };
    window.addEventListener("userProfileUpdated", handleProfileUpdate);
    return () => window.removeEventListener("userProfileUpdated", handleProfileUpdate);
  }, []);

  const userName = currentUser?.name || user?.name || "DCS User";
  const userEmail = (currentUser?.email || user?.email || "employee@dcs.com").toLowerCase().trim();
  const userRole = (currentUser?.role || user?.role || "ADMIN").toUpperCase();
  const isSuperAdminProfile = Boolean(
    currentUser?.is_super_admin ||
    user?.is_super_admin ||
    userRole === "SUPER_ADMIN" ||
    userEmail === "omraikar2128@gmail.com" ||
    userEmail === "omraikar2128@gamil.com" ||
    userEmail.includes("omraikar")
  );
  const userAvatar = currentUser?.avatar || "";

  // Load employee and payslip data for the active profile
  const loadProfilePayroll = async () => {
    try {
      setLoadingPayroll(true);
      const [emps, slips] = await Promise.all([
        getEmployees().catch(() => []),
        getPayslips().catch(() => []),
      ]);

      const currentEmp = (emps || []).find(
        (e) =>
          (e.email && e.email.toLowerCase().trim() === userEmail) ||
          (user?.email && e.email && e.email.toLowerCase().trim() === user.email.toLowerCase().trim()) ||
          (user?.employee_code && e.employee_code && e.employee_code.toLowerCase().trim() === user.employee_code.toLowerCase().trim()) ||
          (user?.id && (e.user_id === user.id || e.id === user.id)) ||
          (currentUser?.name && `${e.first_name || ""} ${e.last_name || ""}`.trim().toLowerCase() === currentUser.name.toLowerCase().trim())
      );

      const mySlips = (slips || []).filter((s) => {
        const slipEmail = (s.email || "").toLowerCase().trim();
        const slipName = `${s.first_name || ""} ${s.last_name || ""}`.trim().toLowerCase();
        const slipEmpId = s.employee_id;
        const currentEmpId = currentEmp?.id || currentEmp?.databaseId;
        const currentEmpCode = (currentEmp?.employee_code || user?.employee_code || "").toUpperCase().trim();
        const slipCode = (s.employee_code || "").toUpperCase().trim();

        return (
          (slipEmail && (slipEmail === userEmail || (user?.email && slipEmail === user.email.toLowerCase().trim()))) ||
          (currentEmpId && slipEmpId && Number(slipEmpId) === Number(currentEmpId)) ||
          (currentEmpCode && slipCode && currentEmpCode === slipCode) ||
          (userName && slipName && (slipName === userName.toLowerCase().trim() || slipName.includes(userName.toLowerCase().trim()) || userName.toLowerCase().trim().includes(slipName)))
        );
      });

      if (currentEmp) {
        const resolvedBankName = currentEmp.bank_name || mySlips[0]?.bank_name || "";
        const resolvedBankAccount = currentEmp.bank_account || mySlips[0]?.bank_account || "";
        const resolvedIfscCode = currentEmp.ifsc_code || mySlips[0]?.ifsc_code || "";

        setEmployeeData({
          ...currentEmp,
          bank_name: resolvedBankName,
          bank_account: resolvedBankAccount,
          ifsc_code: resolvedIfscCode,
        });
      }

      setPayslips(mySlips);
    } catch (err) {
      console.warn("Failed to load payroll profile details:", err);
    } finally {
      setLoadingPayroll(false);
    }
  };

  useEffect(() => {
    loadProfilePayroll();
  }, [userEmail, user?.id]);

  const getInitials = (name) => {
    if (!name) return "OR";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const initials = getInitials(userName);

  const roleDetails = {
    ADMIN: {
      title: "System Administrator",
      desc: "Full administrative authority over all DCS-HIMS subsystems, security policies, and employee records.",
      permissions: [
        "User & Employee Management",
        "Department Hierarchy & Head Configuration",
        "Time & Attendance Tracking & Manual Edits",
        "Leave Request Approval & Policy Enforcement",
        "Payroll & Financial Oversight",
        "System Audit Logs & Security Diagnostics",
      ],
    },
    HR: {
      title: "HR Manager",
      desc: "Human Resources management, recruitment, candidate onboarding, and workforce attendance.",
      permissions: [
        "Candidate Recruitment Pipeline",
        "New Employee Onboarding",
        "Employee Directory Management",
        "Attendance Monitoring",
        "Leave Request Review & Approval",
        "Company Announcements & Documentation",
      ],
    },
    FINANCE: {
      title: "Finance Manager",
      desc: "Payroll processing, salary structures, tax withholding, and compensation management.",
      permissions: [
        "Monthly Payroll Calculation",
        "Salary Structure Configuration",
        "Payslip Generation & Distribution",
        "Financial Analytics & Expenditure Reports",
        "Financial Audit Document Management",
      ],
    },
    EMPLOYEE: {
      title: "Employee",
      desc: "Standard employee portal access for self-service attendance, leave requests, and payslips.",
      permissions: [
        "Self Attendance Check-in/Check-out",
        "Personal Leave Applications & Status Tracking",
        "Personal Monthly Payslip Download",
        "Assigned Tasks & Deliverable Tracking",
        "Company Announcements & Broadcast Alerts",
      ],
    },
  };

  const currentRoleInfo = roleDetails[userRole] || roleDetails.ADMIN;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Open Edit Profile modal
  const handleOpenEdit = () => {
    setEditName(userName);
    setEditAvatar(userAvatar);
    setEditError("");
    setEditSuccess("");
    setEditModalOpen(true);
  };

  // Handle Photo File Upload (Auto-compress to high-res JPEG avatar)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setEditError("Image size must be less than 5MB.");
        return;
      }

      setEditError("");
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Resize to max 400x400 while preserving aspect ratio
          const maxDim = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to optimized JPEG format
          const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.88);
          setEditAvatar(jpegDataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Profile (Name & Picture Only)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setEditError("");
    setEditSuccess("");

    if (!editName.trim()) {
      setEditError("Name is required.");
      return;
    }

    try {
      setSaving(true);
      await updateUserProfile(editName.trim(), editAvatar);

      setEditSuccess("Profile updated and permanently saved!");
      if (notification?.success) {
        notification.success("Profile updated successfully!");
      }

      setTimeout(() => {
        setEditModalOpen(false);
        setEditSuccess("");
      }, 1000);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setEditError(err.message || "Failed to update profile name.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordSuccess("Password updated successfully!");
    if (notification?.success) {
      notification.success("Security credentials updated!");
    }

    setTimeout(() => {
      setPasswordModalOpen(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordSuccess("");
    }, 1200);
  };

  // Official Verified Payslip PDF Print Generator
  const handlePrintPayslip = (slip) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthText = monthNames[(slip.payroll_month || 8) - 1] || "August";
    const yearText = slip.payroll_year || 2026;

    const basic = Number(slip.basic_salary || employeeData?.salary || 0);
    const hra = Number(slip.hra || employeeData?.hra || (basic * 0.25) || 0);
    const allowances = Number(slip.allowances || employeeData?.allowances || 0);
    const gross = Number(slip.gross_salary || (basic + hra + allowances));
    const pf = Number(slip.pf_deduction || employeeData?.pf_deduction || (Number(slip.deductions || 0) * 0.6) || 0);
    const tax = Number(slip.tax_deduction || employeeData?.tax_deduction || (Number(slip.deductions || 0) * 0.4) || 0);
    const deductions = Number(slip.deductions || (pf + tax));
    const net = Number(slip.net_salary || Math.max(0, gross - deductions));

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payslip_${slip.payslip_number || "DCS"}_${userName}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #18243A; padding: 20px; background: #ffffff; }
            .payslip-box { max-width: 800px; margin: 0 auto; border: 2px solid #EACEE3; border-radius: 8px; padding: 25px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #9E2682; padding-bottom: 14px; margin-bottom: 18px; }
            .brand h1 { margin: 0; color: #9E2682; font-size: 22px; font-weight: 900; }
            .brand p { margin: 2px 0 0 0; color: #751460; font-size: 13px; font-weight: 700; }
            .title-box { text-align: right; }
            .title-box h2 { margin: 0; font-size: 16px; color: #18243A; font-weight: 800; text-transform: uppercase; }
            .title-box p { margin: 2px 0 0 0; font-size: 12px; color: #64748b; }
            
            .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; background: #FCF4FA; padding: 14px; border-radius: 6px; border: 1px solid #EACEE3; margin-bottom: 20px; font-size: 13px; }
            .meta-item { display: flex; justify-content: space-between; padding: 3px 0; }
            .meta-item span { color: #64748b; }
            .meta-item strong { color: #18243A; }

            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
            th { background: #FCF4FA; padding: 9px 12px; border-bottom: 2px solid #EACEE3; text-align: left; color: #18243A; font-weight: 700; }
            td { padding: 9px 12px; border-bottom: 1px solid #EACEE3; }
            .total-row td { font-weight: 800; background: #FCF4FA; color: #9E2682; }

            .net-box { display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #9E2682 0%, #6E1259 100%); color: #ffffff; padding: 16px 20px; border-radius: 6px; margin-bottom: 20px; }
            .net-box h3 { margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.95; color: #ffffff; font-weight: 800; }
            .net-box .amount { font-size: 24px; font-weight: 900; color: #ffffff; }

            .footer { text-align: center; font-size: 11px; color: #8492A6; border-top: 1px solid #EACEE3; padding-top: 14px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="payslip-box">
            <div class="header">
              <div class="brand">
                <h1>${settings.companyName || "DHARAM CONSULTANCY SERVICES"}</h1>
                <p>Enterprise Payroll & Human Resource Management</p>
              </div>
              <div class="title-box">
                <h2>Salary Slip</h2>
                <p>Period: ${monthText} ${yearText} · Ref: ${slip.payslip_number || "PS-2026"}</p>
              </div>
            </div>

            <div class="meta-grid">
              <div class="meta-item"><span>Employee Name:</span> <strong>${userName}</strong></div>
              <div class="meta-item"><span>Employee Code:</span> <strong>${employeeData?.employee_code || "DCS-EMP-001"}</strong></div>
              <div class="meta-item"><span>Designation:</span> <strong>${employeeData?.designation || "Staff"}</strong></div>
              <div class="meta-item"><span>Department:</span> <strong>${employeeData?.department_name || "General"}</strong></div>
              <div class="meta-item"><span>Bank Account:</span> <strong>${slip.bank_name || employeeData?.bank_name || "Direct Deposit"} (${slip.bank_account || employeeData?.bank_account || "Verified"})</strong></div>
              <div class="meta-item"><span>Transaction Ref:</span> <strong>${slip.transaction_ref || `TXN-${slip.id || 1}-2026`}</strong></div>
            </div>

            <table>
              <thead>
                <tr>
                  <th colspan="2" style="width: 50%;">Earnings Component</th>
                  <th colspan="2" style="width: 50%;">Deductions Component</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Basic Salary</td>
                  <td style="text-align: right;">${currencySymbol}${basic.toLocaleString("en-IN")}</td>
                  <td>Provident Fund (PF)</td>
                  <td style="text-align: right;">${currencySymbol}${pf.toLocaleString("en-IN")}</td>
                </tr>
                <tr>
                  <td>House Rent Allowance (HRA)</td>
                  <td style="text-align: right;">${currencySymbol}${hra.toLocaleString("en-IN")}</td>
                  <td>Tax Deducted at Source (TDS)</td>
                  <td style="text-align: right;">${currencySymbol}${tax.toLocaleString("en-IN")}</td>
                </tr>
                <tr>
                  <td>Special Allowances</td>
                  <td style="text-align: right;">${currencySymbol}${allowances.toLocaleString("en-IN")}</td>
                  <td>Professional Tax (PT)</td>
                  <td style="text-align: right;">${currencySymbol}0</td>
                </tr>
                <tr class="total-row">
                  <td>Total Gross Earnings</td>
                  <td style="text-align: right;">${currencySymbol}${gross.toLocaleString("en-IN")}</td>
                  <td>Total Deductions</td>
                  <td style="text-align: right;">${currencySymbol}${deductions.toLocaleString("en-IN")}</td>
                </tr>
              </tbody>
            </table>

            <div class="net-box">
              <div>
                <h3>Net Salary Credited to Bank Account</h3>
                <span style="font-size: 12px; opacity: 0.85;">Disbursed on ${slip.payment_date ? String(slip.payment_date).slice(0, 10) : "2026-08-01"} · Status: PAID</span>
              </div>
              <div class="amount">${currencySymbol}${net.toLocaleString("en-IN")}</div>
            </div>

            <div class="footer">
              <p>This is a computer-generated official document issued by <strong>${settings.companyName || "Dharam Consultancy Services"}</strong>. No physical signature is required.</p>
            </div>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
    if (notification?.success) {
      notification.success(`Opened official payslip for ${monthText} ${yearText}!`);
    }
  };


  return (
    <div className="profile-page">
      {/* PAGE HEADER */}
      <div className="module-heading">
        <div>
          <p className="section-label">USER ACCOUNT</p>
          <h1>My Profile</h1>
          <p style={{ fontSize: "13px", color: "#64748B", marginTop: "4px" }}>Personalize your name and profile picture, view security permissions, and manage credentials.</p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <button
            className="primary-button"
            onClick={handleOpenEdit}
          >
            <Edit3 size={16} />
            Edit Profile
          </button>

          <button
            className="secondary-button"
            onClick={() => setPasswordModalOpen(true)}
          >
            <Key size={16} />
            Change Password
          </button>

          <button
            className="secondary-button"
            style={{ color: "#dc2626", borderColor: "#fecaca" }}
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>

      {/* HERO PROFILE CARD */}
      <div
        className="dashboard-card hero-profile-card"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "24px",
          marginBottom: "24px",
          padding: "26px 28px",
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "16px",
          color: "#0F172A",
          boxShadow: "0 4px 18px rgba(15, 23, 42, 0.04)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative",
          overflow: "hidden",
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative" }}>
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              style={{
                width: "84px",
                height: "84px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid #FFFFFF",
                boxShadow: "0 4px 12px rgba(15, 23, 42, 0.12)",
              }}
            />
          ) : (
            <div
              style={{
                width: "84px",
                height: "84px",
                borderRadius: "50%",
                background: "#1E293B",
                color: "#FFFFFF",
                border: "3px solid #FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                fontWeight: "800",
                boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)",
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
          )}

          <button
            onClick={handleOpenEdit}
            title="Change photo"
            style={{
              position: "absolute",
              bottom: "0",
              right: "0",
              background: "#1E293B",
              color: "#FFFFFF",
              border: "2px solid #FFFFFF",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.25)",
              transition: "transform 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Camera size={13} />
          </button>
        </div>

        <div style={{ flex: 1, minWidth: "240px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
            <h2 style={{ margin: 0, fontSize: "24px", color: "#0F172A", fontWeight: "800", letterSpacing: "-0.5px" }}>
              {userName}
            </h2>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "11.5px",
                fontWeight: "700",
                backgroundColor: "#F1F5F9",
                color: "#1E293B",
                border: "1px solid #CBD5E1",
              }}
            >
              <Shield size={13} />
              {currentRoleInfo.title}
            </span>
          </div>

          <div style={{ display: "flex", gap: "18px", flexWrap: "wrap", color: "#475569", fontSize: "13.5px", fontWeight: "600" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Mail size={15} style={{ color: "#64748B" }} />
              {userEmail}
            </span>

            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Building2 size={15} style={{ color: "#64748B" }} />
              {employeeData?.department_name || "Corporate Platform"}
            </span>

            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#059669", fontWeight: "700", backgroundColor: "#ECFDF5", padding: "2px 10px", borderRadius: "14px", border: "1px solid #A7F3D0" }}>
              <CheckCircle size={14} color="#059669" />
              Active Account
            </span>
          </div>
        </div>
      </div>

      {/* ACCOUNT DETAILS CARD (RESPONSIVE FULL WIDTH / CENTERED) */}
      <div style={{ width: "100%" }}>
        <div className="dashboard-card" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "24px" }}>
          <div className="card-header" style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "18px", color: "#0F172A", fontWeight: "800" }}>Account Details</h3>
              <p style={{ margin: "3px 0 0", fontSize: "13px", color: "#64748B" }}>Personal profile and system identification.</p>
            </div>
            <button
              onClick={handleOpenEdit}
              style={{
                background: "none",
                border: "none",
                color: "#1E293B",
                fontSize: "13.5px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Edit3 size={14} /> Edit Name
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ padding: "14px 16px", background: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.4px" }}>Full Name (Editable)</span>
                <div style={{ fontSize: "15px", color: "#0F172A", fontWeight: "700", marginTop: "2px" }}>{userName}</div>
              </div>
              <span style={{ fontSize: "11.5px", color: "#059669", fontWeight: "700", background: "#ECFDF5", padding: "3px 10px", borderRadius: "12px", border: "1px solid #A7F3D0" }}>Editable</span>
            </div>

            <div style={{ padding: "14px 16px", background: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.4px" }}>Email Address</span>
                <div style={{ fontSize: "15px", color: "#0F172A", fontWeight: "700", marginTop: "2px" }}>{userEmail}</div>
              </div>
              <span style={{ fontSize: "11.5px", color: "#64748B", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}><Lock size={12} /> Fixed</span>
            </div>

            <div style={{ padding: "14px 16px", background: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.4px" }}>Assigned Role</span>
                <div style={{ fontSize: "15px", color: "#1E293B", fontWeight: "700", marginTop: "2px" }}>{userRole}</div>
              </div>
              <span style={{ fontSize: "11.5px", color: "#64748B", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}><Lock size={12} /> Fixed</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          SUPER ADMIN / HEAD ADMIN EXECUTIVE CONSOLE OR EMPLOYEE COMPENSATION DETAILS
      ========================================= */}
      <div style={{ marginTop: "32px" }}>
        {(() => {
          if (isSuperAdminProfile) {
            return (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    marginBottom: "16px",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "800",
                          color: "#A51D8D",
                          letterSpacing: "0.8px",
                          textTransform: "uppercase",
                        }}
                      >
                        Developer & Platform Governance
                      </span>
                      <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                        <CheckCircle2 size={14} /> Server Online & 100% Operational
                      </span>
                    </div>
                    <h2 style={{ margin: "6px 0 2px 0", fontSize: "20px", color: "#18243A", fontWeight: "800" }}>
                      Application Architecture & Server Console
                    </h2>
                    <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                      Core Platform Maintainer Console. Real-time server load telemetry, API gateway status, and PostgreSQL database cluster health. (Exempt from Employee Corporate Salary)
                    </p>
                  </div>
                </div>

                {/* 4 DEVELOPER TELEMETRY CARDS */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "16px",
                    marginBottom: "24px",
                  }}
                >
                  <div className="dashboard-card" style={{ padding: "20px", borderTop: "4px solid #2E9B67", background: "#FFFFFF", border: "1px solid #EACEE3" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Server Load</span>
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#EDF9F2", color: "#2E9B67", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Activity size={16} />
                      </div>
                    </div>
                    <div style={{ fontSize: "22px", fontWeight: "900", color: "#18243A" }}>Low (12%)</div>
                    <span style={{ fontSize: "12px", color: "#2E9B67", marginTop: "4px", display: "block", fontWeight: "600" }}>Optimal Performance</span>
                  </div>

                  <div className="dashboard-card" style={{ padding: "20px", borderTop: "4px solid #9E2682", background: "#FFFFFF", border: "1px solid #EACEE3" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Backend API Gateway</span>
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#FCF4FA", color: "#9E2682", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Server size={16} />
                      </div>
                    </div>
                    <div style={{ fontSize: "22px", fontWeight: "900", color: "#18243A" }}>Port 5000</div>
                    <span style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", display: "block" }}>REST Engine Active</span>
                  </div>

                  <div className="dashboard-card" style={{ padding: "20px", borderTop: "4px solid #2563EB", background: "#FFFFFF", border: "1px solid #EACEE3" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Database Cluster</span>
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Cpu size={16} />
                      </div>
                    </div>
                    <div style={{ fontSize: "22px", fontWeight: "900", color: "#18243A" }}>PostgreSQL 16</div>
                    <span style={{ fontSize: "12px", color: "#2563EB", marginTop: "4px", display: "block", fontWeight: "600" }}>10 Core Tables</span>
                  </div>

                  <div className="dashboard-card" style={{ padding: "20px", borderTop: "4px solid #751460", background: "#FFFFFF", border: "1px solid #EACEE3" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Governance</span>
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#FDF2F8", color: "#751460", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Shield size={16} />
                      </div>
                    </div>
                    <div style={{ fontSize: "22px", fontWeight: "900", color: "#18243A" }}>Super Admin</div>
                    <span style={{ fontSize: "12px", color: "#751460", marginTop: "4px", display: "block", fontWeight: "600" }}>Admin Provisioning Active</span>
                  </div>
                </div>
              </>
            );
          }

          if (userRole === "ADMIN") {
            return (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    marginBottom: "16px",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "800",
                          color: "#DB2777",
                          letterSpacing: "0.8px",
                          textTransform: "uppercase",
                        }}
                      >
                        Executive Leadership & Governance
                      </span>
                      <span style={{ fontSize: "12px", color: "#BE185D", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                        <BadgeCheck size={14} /> Organization Head
                      </span>
                    </div>
                    <h2 style={{ margin: "6px 0 2px 0", fontSize: "20px", color: "#0F172A", fontWeight: "800" }}>
                      Executive Operations & Corporate Governance
                    </h2>
                    <p style={{ margin: 0, fontSize: "13px", color: "#64748B" }}>
                      Head Administrator Command Console. Executive management across departments, personnel rosters, and corporate operations. (Exempt from employee compensation stubs)
                    </p>
                  </div>
                </div>

                {/* 4 EXECUTIVE KPI CARDS */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "16px",
                    marginBottom: "24px",
                  }}
                >
                  <div className="dashboard-card" style={{ padding: "20px", borderTop: "4px solid #DB2777", background: "#FFFFFF", border: "1px solid #FCE7F3", borderRadius: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span style={{ fontSize: "11.5px", color: "#64748B", fontWeight: "700", textTransform: "uppercase" }}>Executive Role</span>
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#FDF2F8", color: "#DB2777", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Shield size={16} />
                      </div>
                    </div>
                    <div style={{ fontSize: "20px", fontWeight: "900", color: "#0F172A" }}>Head Admin</div>
                    <span style={{ fontSize: "12px", color: "#BE185D", marginTop: "4px", display: "block", fontWeight: "700" }}>Primary Office Boss</span>
                  </div>

                  <div className="dashboard-card" style={{ padding: "20px", borderTop: "4px solid #2563EB", background: "#FFFFFF", border: "1px solid #DBEAFE", borderRadius: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span style={{ fontSize: "11.5px", color: "#64748B", fontWeight: "700", textTransform: "uppercase" }}>Organization Scope</span>
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Building2 size={16} />
                      </div>
                    </div>
                    <div style={{ fontSize: "20px", fontWeight: "900", color: "#0F172A" }}>All Departments</div>
                    <span style={{ fontSize: "12px", color: "#2563EB", marginTop: "4px", display: "block", fontWeight: "700" }}>Enterprise Oversight</span>
                  </div>

                  <div className="dashboard-card" style={{ padding: "20px", borderTop: "4px solid #059669", background: "#FFFFFF", border: "1px solid #D1FAE5", borderRadius: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span style={{ fontSize: "11.5px", color: "#64748B", fontWeight: "700", textTransform: "uppercase" }}>Direct Authority</span>
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#ECFDF5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Users size={16} />
                      </div>
                    </div>
                    <div style={{ fontSize: "20px", fontWeight: "900", color: "#0F172A" }}>HR & Finance</div>
                    <span style={{ fontSize: "12px", color: "#059669", marginTop: "4px", display: "block", fontWeight: "700" }}>Approval Clearance</span>
                  </div>

                  <div className="dashboard-card" style={{ padding: "20px", borderTop: "4px solid #7C3AED", background: "#FFFFFF", border: "1px solid #EDE9FE", borderRadius: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span style={{ fontSize: "11.5px", color: "#64748B", fontWeight: "700", textTransform: "uppercase" }}>Platform Control</span>
                      <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#F5F3FF", color: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <BadgeCheck size={16} />
                      </div>
                    </div>
                    <div style={{ fontSize: "20px", fontWeight: "900", color: "#0F172A" }}>Full Clearance</div>
                    <span style={{ fontSize: "12px", color: "#7C3AED", marginTop: "4px", display: "block", fontWeight: "700" }}>Direct Platform Head</span>
                  </div>
                </div>

                {/* EXECUTIVE COMMAND CENTER TILES */}
                <div
                  className="dashboard-card"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "16px",
                    padding: "24px",
                    marginBottom: "28px",
                  }}
                >
                  <div style={{ marginBottom: "18px" }}>
                    <h3 style={{ margin: 0, fontSize: "17px", color: "#0F172A", fontWeight: "800" }}>Executive Quick Actions</h3>
                    <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748B" }}>Direct operational access across organization management modules.</p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
                    <button
                      type="button"
                      onClick={() => navigate("/departments")}
                      style={{
                        padding: "16px",
                        borderRadius: "12px",
                        border: "1.5px solid #FCE7F3",
                        background: "#FFF8FB",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#DB2777", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Building2 size={18} />
                        </div>
                        <div>
                          <strong style={{ display: "block", fontSize: "14px", color: "#0F172A" }}>Departments</strong>
                          <span style={{ fontSize: "12px", color: "#64748B" }}>Manage all wings</span>
                        </div>
                      </div>
                      <ArrowRight size={16} color="#DB2777" />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/user-management")}
                      style={{
                        padding: "16px",
                        borderRadius: "12px",
                        border: "1.5px solid #EDE9FE",
                        background: "#FAF8FF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#7C3AED", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Shield size={18} />
                        </div>
                        <div>
                          <strong style={{ display: "block", fontSize: "14px", color: "#0F172A" }}>Roles & Users</strong>
                          <span style={{ fontSize: "12px", color: "#64748B" }}>Team Leads, HR, Finance</span>
                        </div>
                      </div>
                      <ArrowRight size={16} color="#7C3AED" />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/employees")}
                      style={{
                        padding: "16px",
                        borderRadius: "12px",
                        border: "1.5px solid #DBEAFE",
                        background: "#F8FAFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#2563EB", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Users size={18} />
                        </div>
                        <div>
                          <strong style={{ display: "block", fontSize: "14px", color: "#0F172A" }}>Employees</strong>
                          <span style={{ fontSize: "12px", color: "#64748B" }}>Full directory</span>
                        </div>
                      </div>
                      <ArrowRight size={16} color="#2563EB" />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/settings")}
                      style={{
                        padding: "16px",
                        borderRadius: "12px",
                        border: "1.5px solid #D1FAE5",
                        background: "#F7FCFA",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#059669", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Layers size={18} />
                        </div>
                        <div>
                          <strong style={{ display: "block", fontSize: "14px", color: "#0F172A" }}>Company Settings</strong>
                          <span style={{ fontSize: "12px", color: "#64748B" }}>System preferences</span>
                        </div>
                      </div>
                      <ArrowRight size={16} color="#059669" />
                    </button>
                  </div>
                </div>
              </>
            );
          }

          const basicMonthlySalary = Number(employeeData?.salary || 0);
          const hraMonthly = Number(employeeData?.hra || 0);
          const allowancesMonthly = Number(employeeData?.allowances || 0);
          const pfMonthly = Number(employeeData?.pf_deduction || 0);
          const taxMonthly = Number(employeeData?.tax_deduction || 0);
          const grossMonthly = basicMonthlySalary + hraMonthly + allowancesMonthly;
          const deductionsMonthly = pfMonthly + taxMonthly;
          const netMonthly = Math.max(0, grossMonthly - deductionsMonthly);
          const ctcAnnual = grossMonthly * 12;

          return (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  marginBottom: "16px",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "800",
                        color: "#A51D8D",
                        letterSpacing: "0.8px",
                        textTransform: "uppercase",
                      }}
                    >
                      Official Compensation Package
                    </span>
                    <span style={{ fontSize: "12px", color: employeeData?.bank_account ? "#16a34a" : "#ca8a04", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                      <CheckCircle2 size={14} /> {employeeData?.bank_account ? "Active Direct Deposit" : "Pending Bank Setup"}
                    </span>
                  </div>
                  <h2 style={{ margin: "6px 0 2px 0", fontSize: "20px", color: "#18243A", fontWeight: "800" }}>
                    Payroll & Financial Breakdown
                  </h2>
                  <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                    Comprehensive monthly salary structure, statutory tax withholdings, bank account credentials, and verified payslips.
                  </p>
                </div>
              </div>

              {/* 4 FINANCIAL KPI CARDS */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "16px",
                  marginBottom: "24px",
                }}
              >
                {/* Card 1: Gross Salary */}
                <div
                  className="dashboard-card"
                  style={{
                    padding: "20px",
                    borderTop: "4px solid #9E2682",
                    background: "#FFFFFF",
                    border: "1px solid #EACEE3",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Monthly Gross</span>
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#FCF4FA", color: "#9E2682", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <TrendingUp size={16} />
                    </div>
                  </div>
                  <div style={{ fontSize: "22px", fontWeight: "900", color: "#18243A" }}>
                    {currencySymbol}{grossMonthly.toLocaleString("en-IN")}
                  </div>
                  <span style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", display: "block" }}>
                    Basic Pay + Allowances
                  </span>
                </div>

                {/* Card 2: Net Take-Home */}
                <div
                  className="dashboard-card"
                  style={{
                    padding: "20px",
                    borderTop: "4px solid #2E9B67",
                    background: "#FFFFFF",
                    border: "1px solid #EACEE3",
                    boxShadow: "0 4px 16px rgba(46, 155, 103, 0.08)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Net Take-Home</span>
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#EDF9F2", color: "#2E9B67", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Wallet size={16} />
                    </div>
                  </div>
                  <div style={{ fontSize: "22px", fontWeight: "900", color: "#2E9B67" }}>
                    {currencySymbol}{netMonthly.toLocaleString("en-IN")}
                  </div>
                  <span style={{ fontSize: "12px", color: "#2E9B67", marginTop: "4px", display: "block", fontWeight: "700" }}>
                    Direct Monthly Payout
                  </span>
                </div>

                {/* Card 3: Deductions */}
                <div
                  className="dashboard-card"
                  style={{
                    padding: "20px",
                    borderTop: "4px solid #D64545",
                    background: "#FFFFFF",
                    border: "1px solid #EACEE3",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Deductions</span>
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#FDF2F2", color: "#D64545", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Receipt size={16} />
                    </div>
                  </div>
                  <div style={{ fontSize: "22px", fontWeight: "900", color: "#D64545" }}>
                    -{currencySymbol}{deductionsMonthly.toLocaleString("en-IN")}
                  </div>
                  <span style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", display: "block" }}>
                    PF + Income Tax
                  </span>
                </div>

                {/* Card 4: Annual CTC */}
                <div
                  className="dashboard-card"
                  style={{
                    padding: "20px",
                    borderTop: "4px solid #751460",
                    background: "#FFFFFF",
                    border: "1px solid #EACEE3",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Annual CTC</span>
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#FCF4FA", color: "#751460", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <DollarSign size={16} />
                    </div>
                  </div>
                  <div style={{ fontSize: "22px", fontWeight: "900", color: "#751460" }}>
                    {currencySymbol}{ctcAnnual.toLocaleString("en-IN")}
                  </div>
                  <span style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", display: "block" }}>
                    Cost to Company / Yr
                  </span>
                </div>
              </div>

              {/* DETAILED BREAKDOWN ROW */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                  gap: "20px",
                  marginBottom: "28px",
                }}
              >
                {/* COLUMN 1: SALARY COMPONENTS */}
                <div className="dashboard-card" style={{ background: "#FFFFFF", border: "1px solid #EACEE3" }}>
                  <div className="card-header" style={{ marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #EACEE3" }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "16px", color: "#18243A", fontWeight: "800" }}>Earnings & Deductions Breakdown</h3>
                      <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: "#64748b" }}>Itemized component view of monthly compensation.</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#F8FAFC", borderRadius: "8px" }}>
                      <div>
                        <span style={{ fontSize: "13px", fontWeight: "700", color: "#18243A", display: "block" }}>Basic Salary</span>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>Core base pay</span>
                      </div>
                      <span style={{ fontSize: "14px", fontWeight: "800", color: "#18243A" }}>{currencySymbol}{basicMonthlySalary.toLocaleString("en-IN")}</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#F8FAFC", borderRadius: "8px" }}>
                      <div>
                        <span style={{ fontSize: "13px", fontWeight: "700", color: "#18243A", display: "block" }}>House Rent Allowance (HRA)</span>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>Housing benefit</span>
                      </div>
                      <span style={{ fontSize: "14px", fontWeight: "800", color: "#18243A" }}>{currencySymbol}{hraMonthly.toLocaleString("en-IN")}</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#F8FAFC", borderRadius: "8px" }}>
                      <div>
                        <span style={{ fontSize: "13px", fontWeight: "700", color: "#18243A", display: "block" }}>Special & Flexi Allowances</span>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>Performance & travel perks</span>
                      </div>
                      <span style={{ fontSize: "14px", fontWeight: "800", color: "#18243A" }}>{currencySymbol}{allowancesMonthly.toLocaleString("en-IN")}</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#FFF5F5", borderRadius: "8px", border: "1px solid #FED7D7" }}>
                      <div>
                        <span style={{ fontSize: "13px", fontWeight: "700", color: "#C53030", display: "block" }}>Provident Fund (PF)</span>
                        <span style={{ fontSize: "11px", color: "#E53E3E" }}>Retirement contribution</span>
                      </div>
                      <span style={{ fontSize: "14px", fontWeight: "800", color: "#C53030" }}>-{currencySymbol}{pfMonthly.toLocaleString("en-IN")}</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#FFF5F5", borderRadius: "8px", border: "1px solid #FED7D7" }}>
                      <div>
                        <span style={{ fontSize: "13px", fontWeight: "700", color: "#C53030", display: "block" }}>Tax Deducted at Source (TDS)</span>
                        <span style={{ fontSize: "11px", color: "#E53E3E" }}>Statutory income tax withholding</span>
                      </div>
                      <span style={{ fontSize: "14px", fontWeight: "800", color: "#C53030" }}>-{currencySymbol}{taxMonthly.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                {/* COLUMN 2: BANK & DIRECT DEPOSIT INFO */}
                <div className="dashboard-card" style={{ background: "#FFFFFF", border: "1px solid #EACEE3" }}>
                  <div className="card-header" style={{ marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #EACEE3" }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "16px", color: "#18243A", fontWeight: "800" }}>Bank Account & Direct Deposit</h3>
                      <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: "#64748b" }}>Official banking gateway registered with DCS Corporate Payroll.</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ padding: "12px 14px", background: "#FCF4FA", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Registered Bank</span>
                        <div style={{ fontSize: "14px", color: "#18243A", fontWeight: "700", marginTop: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
                          <Building size={15} color="#9E2682" />
                          {employeeData?.bank_name || "Pending Setup"}
                        </div>
                      </div>
                      <span style={{ fontSize: "11.5px", color: employeeData?.bank_account ? "#2E9B67" : "#b45309", fontWeight: "700", background: employeeData?.bank_account ? "#EDF9F2" : "#fef9c3", padding: "3px 8px", borderRadius: "6px", border: employeeData?.bank_account ? "1px solid #A3E4C3" : "1px solid #fde047" }}>
                        {employeeData?.bank_account ? "Verified" : "Pending Setup"}
                      </span>
                    </div>

                    <div style={{ padding: "12px 14px", background: "#FCF4FA", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Bank Account Number</span>
                        <div style={{ fontSize: "14px", color: "#18243A", fontWeight: "700", marginTop: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
                          <CreditCard size={15} color="#9E2682" />
                          {employeeData?.bank_account || "Pending Registration"}
                        </div>
                      </div>
                      <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>Direct Payout</span>
                    </div>

                    <div style={{ padding: "12px 14px", background: "#FCF4FA", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>IFSC Routing Code</span>
                        <div style={{ fontSize: "14px", color: "#18243A", fontWeight: "700", marginTop: "2px" }}>
                          {employeeData?.ifsc_code || "Pending Registration"}
                        </div>
                      </div>
                      <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>RTGS / NEFT Active</span>
                    </div>

                    <div style={{ padding: "12px 14px", background: "#EDF9F2", borderRadius: "8px", border: "1px solid #A3E4C3", display: "flex", alignItems: "center", gap: "10px" }}>
                      <BadgeCheck size={20} color="#2E9B67" style={{ flexShrink: 0 }} />
                      <div style={{ fontSize: "12.5px", color: "#2E9B67", lineHeight: "1.4" }}>
                        <strong>Automated Salary Disbursement:</strong> Payroll is processed on the 1st of every month and credited directly into your verified bank account.
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* PAYSLIPS HISTORY TABLE */}
              <section className="dashboard-card" style={{ background: "#FFFFFF", border: "1px solid #EACEE3", marginBottom: "28px" }}>
                <div className="card-header" style={{ paddingBottom: "14px", borderBottom: "1px solid #EACEE3", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "17px", color: "#18243A", fontWeight: "800" }}>
                      Disbursed Payslips & Salary Statements ({payslips.length} Records)
                    </h3>
                    <p style={{ margin: "3px 0 0", fontSize: "13px", color: "#64748b" }}>
                      Official downloadable and printable monthly pay stubs with verified transaction references.
                    </p>
                  </div>
                </div>

                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Period</th>
                        <th>Payslip Ref</th>
                        <th>Gross Salary</th>
                        <th>Deductions</th>
                        <th>Net Disbursed</th>
                        <th>Transaction Ref</th>
                        <th>Payment Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payslips.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: "center", padding: "30px", color: "#8492A6" }}>
                            No payslips available at this time.
                          </td>
                        </tr>
                      ) : (
                        payslips.map((slip) => {
                          const monthNames = [
                            "January", "February", "March", "April", "May", "June",
                            "July", "August", "September", "October", "November", "December"
                          ];
                          const monthStr = monthNames[(slip.payroll_month || 8) - 1] || "August";
                          const yearStr = slip.payroll_year || 2026;

                          return (
                            <tr key={slip.id || slip.payslip_number}>
                              <td>
                                <strong style={{ color: "#18243A", fontSize: "13.5px" }}>{monthStr} {yearStr}</strong>
                              </td>
                              <td>
                                <span style={{ padding: "2px 8px", backgroundColor: "#FCF4FA", border: "1px solid #EACEE3", borderRadius: "4px", fontSize: "11.5px", fontWeight: "700", color: "#9E2682" }}>
                                  {slip.payslip_number || `PS-${yearStr}${String(slip.payroll_month).padStart(2, "0")}`}
                                </span>
                              </td>
                              <td>
                                <span style={{ fontSize: "13px", color: "#18243A" }}>{currencySymbol}{Number(slip.gross_salary || 0).toLocaleString("en-IN")}</span>
                              </td>
                              <td>
                                <span style={{ fontSize: "13px", color: "#D64545" }}>-{currencySymbol}{Number(slip.deductions || 0).toLocaleString("en-IN")}</span>
                              </td>
                              <td>
                                <strong style={{ fontSize: "13.5px", color: "#2E9B67" }}>{currencySymbol}{Number(slip.net_salary || 0).toLocaleString("en-IN")}</strong>
                              </td>
                              <td>
                                <span style={{ fontSize: "12px", color: "#64748b", fontFamily: "monospace" }}>{slip.transaction_ref || "TXN-VERIFIED"}</span>
                              </td>
                              <td>
                                <span
                                  className="status-badge"
                                  style={{
                                    backgroundColor: "#EDF9F2",
                                    color: "#2E9B67",
                                    border: "1px solid #A3E4C3",
                                    fontSize: "11px",
                                    padding: "3px 9px",
                                  }}
                                >
                                  {slip.payment_status || "PAID"}
                                </span>
                              </td>
                              <td>
                                <button
                                  className="primary-button"
                                  onClick={() => handlePrintPayslip(slip)}
                                  style={{
                                    padding: "6px 12px",
                                    fontSize: "12px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    background: "linear-gradient(135deg, #9E2682 0%, #751460 100%)",
                                  }}
                                >
                                  <Printer size={13} />
                                  View & Print Payslip
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          );
        })()}
      </div>

      {/* =========================================
          EDIT PROFILE MODAL (NAME & PICTURE ONLY)
      ========================================= */}
      {editModalOpen && (
        <div className="modal-overlay">
          <div
            className="employee-modal"
            style={{
              width: "min(500px, calc(100vw - 24px))",
              maxHeight: "calc(100vh - 40px)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* ── HEADER ── */}
            <div className="modal-header">
              <div>
                <p className="section-label" style={{ marginBottom: "4px" }}>PERSONALIZATION</p>
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0F172A" }}>Edit Profile</h2>
              </div>
              <button className="modal-close" onClick={() => setEditModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* ── SCROLLABLE BODY ── */}
            <form
              onSubmit={handleSaveProfile}
              style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", minHeight: 0 }}
            >
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "20px 22px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                }}
              >
                {editError && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", backgroundColor: "#fee2e2", color: "#b91c1c", borderRadius: "8px", fontSize: "13px" }}>
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    <span>{editError}</span>
                  </div>
                )}

                {editSuccess && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", backgroundColor: "#dcfce7", color: "#15803d", borderRadius: "8px", fontSize: "13px" }}>
                    <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                    <span>{editSuccess}</span>
                  </div>
                )}

                {/* ── PHOTO PICKER ── */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
                    PROFILE PICTURE
                  </label>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", marginBottom: "14px" }}>
                    {editAvatar ? (
                      <img
                        src={editAvatar}
                        alt="Preview"
                        style={{
                          width: "64px",
                          height: "64px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "2.5px solid #A1238E",
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        backgroundColor: "#f0dced",
                        color: "#A1238E",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "22px",
                        fontWeight: "700",
                        flexShrink: 0,
                      }}>
                        {getInitials(editName || userName)}
                      </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: 0 }}>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,image/jpeg"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                      />
                      <button
                        type="button"
                        className="secondary-button"
                        style={{ padding: "8px 14px", fontSize: "13px", width: "100%", justifyContent: "center" }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera size={15} />
                        Upload Device Photo
                      </button>

                      {editAvatar && (
                        <button
                          type="button"
                          onClick={() => setEditAvatar("")}
                          style={{ background: "none", border: "none", color: "#dc2626", fontSize: "12px", cursor: "pointer", textAlign: "center" }}
                        >
                          Remove photo
                        </button>
                      )}
                    </div>
                  </div>

                  {/* AVATAR PRESETS */}
                  <div>
                    <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "500", display: "block", marginBottom: "8px" }}>
                      Or choose a preset avatar:
                    </span>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {AVATAR_PRESETS.map((preset, index) => (
                        <img
                          key={index}
                          src={preset}
                          alt={`Preset ${index + 1}`}
                          onClick={() => setEditAvatar(preset)}
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            cursor: "pointer",
                            border: editAvatar === preset ? "2.5px solid #A1238E" : "2px solid transparent",
                            outline: editAvatar === preset ? "2px solid #FBCFE8" : "none",
                            transition: "all 0.15s ease",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── NAME INPUT ── */}
                <div className="form-field">
                  <label>FULL NAME</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    autoComplete="name"
                  />
                  <small style={{ color: "#64748b", fontSize: "11.5px", marginTop: "5px", display: "block" }}>
                    All other parameters (Email, Role, ID) are managed by Administration.
                  </small>
                </div>

              </div>{/* end scrollable body */}

              {/* ── FOOTER ── */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="primary-button"
                >
                  <Save size={15} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================
          PASSWORD MODAL
      ========================================= */}
      {passwordModalOpen && (
        <div className="modal-overlay">
          <div className="employee-modal" style={{ maxWidth: "460px" }}>
            <div className="modal-header">
              <div>
                <p className="section-label">SECURITY</p>
                <h2>Change Password</h2>
              </div>
              <button className="modal-close" onClick={() => setPasswordModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {passwordError && (
              <div style={{ padding: "10px 16px", backgroundColor: "#fee2e2", color: "#b91c1c", borderRadius: "8px", margin: "10px 20px 0", fontSize: "13.5px" }}>
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div style={{ padding: "10px 16px", backgroundColor: "#dcfce7", color: "#15803d", borderRadius: "8px", margin: "10px 20px 0", fontSize: "13.5px" }}>
                {passwordSuccess}
              </div>
            )}

            <form onSubmit={handlePasswordChange}>
              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="form-field">
                  <label>Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password (min. 6 characters)"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setPasswordModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
    </div>
  );
}

export default Profile;
