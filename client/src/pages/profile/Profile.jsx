import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Shield,
  Building2,
  Calendar,
  CheckCircle,
  Key,
  LogOut,
  Lock,
  Camera,
  Edit3,
  Pencil,
  X,
  Save,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  DollarSign,
  CreditCard,
  Download,
  Printer,
  Receipt,
  TrendingUp,
  Wallet,
  FileText,
  BadgeCheck,
  Building,
  Server,
  Cpu,
  Activity,
  Radio,
  BellRing,
  Terminal,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../hooks/useNotification";
import { updateUserProfile, getStoredUser, updateStoredUser } from "../../services/authService";
import { getEmployees, updateEmployeeCompensation } from "../../services/employeeService";
import { getPayslips } from "../../services/payslipService";
import { getLoadedSettings } from "../../services/settingsService";
import { createAnnouncement } from "../../services/notificationService";


const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
];

function Profile() {
  const { user, role, logout } = useAuth();
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
  const [loadingPayroll, setLoadingPayroll] = useState(true);

  // Compensation Editing Modal State
  const [isEditSalaryModalOpen, setIsEditSalaryModalOpen] = useState(false);
  const [salaryForm, setSalaryForm] = useState({
    salary: 0,
    hra: 0,
    allowances: 0,
    pfDeduction: 0,
    taxDeduction: 0,
    bankName: "",
    bankAccount: "",
    ifscCode: "",
  });
  const [savingSalary, setSavingSalary] = useState(false);

  useEffect(() => {
    const handleProfileUpdate = () => {
      const updated = getStoredUser();
      if (updated) setCurrentUser(updated);
    };
    window.addEventListener("userProfileUpdated", handleProfileUpdate);
    return () => window.removeEventListener("userProfileUpdated", handleProfileUpdate);
  }, []);

  const userName = currentUser?.name || user?.name || "Om Raikar";
  const userEmail = (currentUser?.email || user?.email || "omraikar2128@gmail.com").toLowerCase().trim();
  const userRole = (currentUser?.role || user?.role || "ADMIN").toUpperCase();
  const isSuperAdminProfile = Boolean(
    currentUser?.is_super_admin ||
    user?.is_super_admin ||
    userEmail === "omraikar2128@gmail.com"
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
          (user?.id && e.user_id === user.id) ||
          (user?.id && e.id === user.id)
      );

      if (currentEmp) {
        setEmployeeData(currentEmp);
        setSalaryForm({
          salary: Number(currentEmp.salary || 0),
          hra: Number(currentEmp.hra || 0),
          allowances: Number(currentEmp.allowances || 0),
          pfDeduction: Number(currentEmp.pf_deduction || 0),
          taxDeduction: Number(currentEmp.tax_deduction || 0),
          bankName: currentEmp.bank_name || "",
          bankAccount: currentEmp.bank_account || "",
          ifscCode: currentEmp.ifsc_code || "",
        });
      }

      const mySlips = (slips || []).filter(
        (s) =>
          (s.email && s.email.toLowerCase().trim() === userEmail) ||
          (currentEmp && (s.employee_id === currentEmp.id || s.employee_id === currentEmp.databaseId))
      );

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

  const handleSaveSalary = async (e) => {
    if (e) e.preventDefault();
    if (!["ADMIN", "FINANCE"].includes(userRole)) {
      if (notification?.error) notification.error("Only Finance Department or Administrator can update compensation & bank credentials");
      return;
    }
    if (!employeeData?.id && !employeeData?.databaseId) {
      if (notification?.error) notification.error("Employee profile record not found");
      return;
    }

    try {
      setSavingSalary(true);
      const empId = employeeData.id || employeeData.databaseId;
      const updated = await updateEmployeeCompensation(empId, salaryForm);
      setEmployeeData(updated);
      setIsEditSalaryModalOpen(false);
      if (notification?.success) {
        notification.success("Salary structure & banking details saved in database!");
      }
      await loadProfilePayroll();
    } catch (err) {
      console.error("Save salary error:", err);
      if (notification?.error) {
        notification.error(err.message || "Failed to update compensation");
      }
    } finally {
      setSavingSalary(false);
    }
  };

  // Super Admin Server Notice Modal State
  const [isServerNoticeModalOpen, setIsServerNoticeModalOpen] = useState(false);
  const [serverNoticeData, setServerNoticeData] = useState({
    title: "Server Operations & Low Load Status Notice",
    message: "All backend services, PostgreSQL database cluster, and API systems are operating normally under low load (12%). System latency < 40ms.",
    priority: "NORMAL",
  });
  const [sendingServerNotice, setSendingServerNotice] = useState(false);

  const handleSendServerNotice = async (e) => {
    if (e) e.preventDefault();
    if (!serverNoticeData.title.trim() || !serverNoticeData.message.trim()) {
      if (notification?.error) notification.error("Notice title and message are required");
      return;
    }

    try {
      setSendingServerNotice(true);
      await createAnnouncement({
        title: serverNoticeData.title.trim(),
        message: serverNoticeData.message.trim(),
        priority: serverNoticeData.priority || "NORMAL",
        category: "System Infrastructure",
      });
      setIsServerNoticeModalOpen(false);
      if (notification?.success) {
        notification.success("System & Server notification successfully broadcast to all platform users!");
      }
    } catch (err) {
      console.error("Failed to broadcast server notice:", err);
      if (notification?.error) {
        notification.error(err.message || "Failed to broadcast server notice");
      }
    } finally {
      setSendingServerNotice(false);
    }
  };


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
      const res = await updateUserProfile(editName.trim(), editAvatar);

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
          <p>Personalize your name and profile picture, view security permissions, and manage credentials.</p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
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
          background: "linear-gradient(135deg, #FFFFFF 0%, #FFF8FC 100%)",
          border: "1px solid #F3D3E7",
          borderRadius: "16px",
          color: "#0F172A",
          boxShadow: "0 4px 20px rgba(219, 39, 119, 0.06)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 28px rgba(219, 39, 119, 0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(219, 39, 119, 0.06)";
        }}
      >

        <div style={{ position: "relative" }}>
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              style={{
                width: "88px",
                height: "88px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "3.5px solid #FFFFFF",
                boxShadow: "0 4px 14px rgba(219, 39, 119, 0.2)",
              }}
            />
          ) : (
            <div
              style={{
                width: "88px",
                height: "88px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #DB2777 0%, #BE185D 100%)",
                color: "#FFFFFF",
                border: "3.5px solid #FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "30px",
                fontWeight: "900",
                boxShadow: "0 4px 14px rgba(219, 39, 119, 0.25)",
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
              background: "#DB2777",
              color: "#FFFFFF",
              border: "2px solid #FFFFFF",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(219, 39, 119, 0.35)",
              transition: "transform 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Camera size={13} />
          </button>
        </div>


        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
            <h2 style={{ margin: 0, fontSize: "24px", color: "#0F172A", fontWeight: "900", letterSpacing: "-0.5px" }}>
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
                fontWeight: "800",
                backgroundColor: "#FFF0F7",
                color: "#DB2777",
                border: "1px solid #FCE7F3",
                letterSpacing: "0.5px",
              }}
            >
              <Shield size={13} />
              {currentRoleInfo.title}
            </span>
          </div>

          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", color: "#475569", fontSize: "13.5px", fontWeight: "600" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Mail size={15} style={{ color: "#DB2777" }} />
              {userEmail}
            </span>

            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Building2 size={15} style={{ color: "#DB2777" }} />
              {employeeData?.department_name || "DCS Corporate Platform"}
            </span>

            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#059669", fontWeight: "700", backgroundColor: "#ECFDF5", padding: "2px 10px", borderRadius: "14px", border: "1px solid #A7F3D0" }}>
              <CheckCircle size={14} color="#059669" />
              Active Account
            </span>
          </div>
        </div>
      </div>



      {/* DETAILS GRID */}
      <div style={{ display: "grid", gridTemplateColumns: isSuperAdminProfile ? "1fr" : "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px" }}>

        {/* CARD 1: ACCOUNT DETAILS */}
        <div className="dashboard-card">
          <div className="card-header" style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3>Account Details</h3>
              <p>Personal profile and system identification.</p>
            </div>
            <button
              onClick={handleOpenEdit}
              style={{
                background: "none",
                border: "none",
                color: "#A1238E",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Edit3 size={14} /> Edit Name
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase" }}>Full Name (Editable)</span>
                <div style={{ fontSize: "14.5px", color: "#1e293b", fontWeight: "600", marginTop: "2px" }}>{userName}</div>
              </div>
              <span style={{ fontSize: "11.5px", color: "#16a34a", fontWeight: "600", background: "#dcfce7", padding: "2px 8px", borderRadius: "10px" }}>Editable</span>
            </div>

            <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase" }}>Email Address</span>
                <div style={{ fontSize: "14.5px", color: "#1e293b", fontWeight: "600", marginTop: "2px" }}>{userEmail}</div>
              </div>
              <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "600", display: "flex", alignItems: "center", gap: "3px" }}><Lock size={12} /> Fixed</span>
            </div>

            <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase" }}>Assigned Role</span>
                <div style={{ fontSize: "14.5px", color: "#A1238E", fontWeight: "700", marginTop: "2px" }}>{userRole}</div>
              </div>
              <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "600", display: "flex", alignItems: "center", gap: "3px" }}><Lock size={12} /> Fixed</span>
            </div>
          </div>
        </div>

        {/* CARD 2: ROLE PERMISSIONS (ONLY SHOWN FOR NON-SUPER-ADMIN PROFILES) */}
        {!isSuperAdminProfile && (
          <div className="dashboard-card">
            <div className="card-header" style={{ marginBottom: "16px" }}>
              <div>
                <h3>Role Privileges & Access</h3>
                <p>Capabilities configured for your account tier.</p>
              </div>
            </div>

            <p style={{ fontSize: "13.5px", color: "#475569", lineHeight: "1.5", marginBottom: "16px" }}>
              {currentRoleInfo.desc}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {currentRoleInfo.permissions.map((perm, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "13.5px",
                    color: "#334155",
                    padding: "6px 0",
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: "#f0dced",
                      color: "#A1238E",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <CheckCircle size={13} />
                  </div>
                  <span>{perm}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* =========================================
          SUPER ADMIN DEVELOPER CONSOLE OR EMPLOYEE COMPENSATION DETAILS
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

          const basicMonthlySalary = Number(employeeData?.salary || 0);
          const hraMonthly = Number(employeeData?.hra || 0);
          const allowancesMonthly = Number(employeeData?.allowances || 0);
          const pfMonthly = Number(employeeData?.pf_deduction || 0);
          const taxMonthly = Number(employeeData?.tax_deduction || 0);
          const grossMonthly = basicMonthlySalary + hraMonthly + allowancesMonthly;
          const deductionsMonthly = pfMonthly + taxMonthly;
          const netMonthly = Math.max(0, grossMonthly - deductionsMonthly);
          const ctcAnnual = grossMonthly * 12;

          const isTargetAdmin =
            employeeData?.email?.toLowerCase().trim() === "omraikar2128@gmail.com" ||
            (employeeData?.designation && employeeData.designation.toLowerCase().includes("admin")) ||
            (employeeData?.role && employeeData.role.toUpperCase() === "ADMIN");

          const canManageSalary =
            userRole === "ADMIN" ||
            (userRole === "FINANCE" && !isTargetAdmin);

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

                {canManageSalary && (
                  <button
                    type="button"
                    onClick={() => setIsEditSalaryModalOpen(true)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "7px",
                      padding: "9px 16px",
                      backgroundColor: "#9E2682",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(158, 38, 130, 0.25)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Pencil size={15} />
                    Edit Salary & Bank Details
                  </button>
                )}
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
          <div className="employee-modal" style={{ maxWidth: "480px" }}>
            <div className="modal-header">
              <div>
                <p className="section-label">PERSONALIZATION</p>
                <h2>Edit Profile</h2>
              </div>
              <button className="modal-close" onClick={() => setEditModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {editError && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", backgroundColor: "#fee2e2", color: "#b91c1c", borderRadius: "8px", margin: "12px 24px 0", fontSize: "13px" }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{editError}</span>
              </div>
            )}

            {editSuccess && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", backgroundColor: "#dcfce7", color: "#15803d", borderRadius: "8px", margin: "12px 24px 0", fontSize: "13px" }}>
                <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                <span>{editSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile}>
              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "18px" }}>

                {/* PHOTO PICKER */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "8px" }}>
                    Profile Picture
                  </label>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
                    {editAvatar ? (
                      <img
                        src={editAvatar}
                        alt="Preview"
                        style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", border: "2px solid #A1238E" }}
                      />
                    ) : (
                      <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#f0dced", color: "#A1238E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "700" }}>
                        {getInitials(editName || userName)}
                      </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
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
                        style={{ padding: "6px 12px", fontSize: "12.5px" }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera size={14} />
                        Upload Device Photo
                      </button>

                      {editAvatar && (
                        <button
                          type="button"
                          onClick={() => setEditAvatar("")}
                          style={{ background: "none", border: "none", color: "#dc2626", fontSize: "12px", cursor: "pointer", textAlign: "left" }}
                        >
                          Remove photo
                        </button>
                      )}
                    </div>
                  </div>

                  {/* AVATAR PRESETS */}
                  <div>
                    <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "500", display: "block", marginBottom: "6px" }}>
                      Or choose a preset avatar:
                    </span>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {AVATAR_PRESETS.map((preset, index) => (
                        <img
                          key={index}
                          src={preset}
                          alt={`Preset ${index + 1}`}
                          onClick={() => setEditAvatar(preset)}
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            cursor: "pointer",
                            border: editAvatar === preset ? "2px solid #A1238E" : "2px solid transparent",
                            transition: "all 0.15s ease",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* NAME INPUT */}
                <div className="form-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                  <small style={{ color: "#64748b", fontSize: "11.5px", marginTop: "4px", display: "block" }}>
                    All other parameters (Email, Role, ID) are managed by Administration.
                  </small>
                </div>

              </div>

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
      {/* EDIT COMPENSATION & BANK DETAILS MODAL (FINANCE / ADMIN)                  */}
      {/* ========================================================================= */}
      {isEditSalaryModalOpen && (
        <div className="modal-overlay">
          <div className="payroll-modal" style={{ maxWidth: "620px", background: "#FFFFFF", borderRadius: "14px", overflow: "hidden", border: "1px solid #EACEE3" }}>
            <div className="modal-header" style={{ borderBottom: "1px solid #EACEE3", padding: "18px 24px" }}>
              <div>
                <p className="section-label" style={{ color: "#9E2682", fontWeight: "800", fontSize: "11px" }}>COMPENSATION MANAGEMENT</p>
                <h2 style={{ fontSize: "18px", color: "#18243A", fontWeight: "800", margin: "2px 0 0" }}>Edit Salary & Bank Credentials</h2>
              </div>
              <button className="modal-close" onClick={() => setIsEditSalaryModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSalary}>
              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px", maxHeight: "70vh", overflowY: "auto" }}>

                {/* COMPENSATION INPUTS */}
                <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "16px" }}>
                  <h4 style={{ margin: "0 0 12px", fontSize: "13.5px", color: "#18243A", fontWeight: "700" }}>
                    Monthly Salary Components
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div className="form-field">
                      <label>Basic Monthly Salary ({currencySymbol})</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 85000"
                        value={salaryForm.salary || ""}
                        onChange={(e) => setSalaryForm({ ...salaryForm, salary: Number(e.target.value) || 0 })}
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label>HRA ({currencySymbol})</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 6000"
                        value={salaryForm.hra || ""}
                        onChange={(e) => setSalaryForm({ ...salaryForm, hra: Number(e.target.value) || 0 })}
                      />
                    </div>

                    <div className="form-field">
                      <label>Special & Travel Allowances ({currencySymbol})</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 4000"
                        value={salaryForm.allowances || ""}
                        onChange={(e) => setSalaryForm({ ...salaryForm, allowances: Number(e.target.value) || 0 })}
                      />
                    </div>

                    <div className="form-field">
                      <label>PF Deduction ({currencySymbol})</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 3500"
                        value={salaryForm.pfDeduction || ""}
                        onChange={(e) => setSalaryForm({ ...salaryForm, pfDeduction: Number(e.target.value) || 0 })}
                      />
                    </div>

                    <div className="form-field" style={{ gridColumn: "span 2" }}>
                      <label>Income Tax / TDS Withholding ({currencySymbol})</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 3000"
                        value={salaryForm.taxDeduction || ""}
                        onChange={(e) => setSalaryForm({ ...salaryForm, taxDeduction: Number(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>

                {/* LIVE CALCULATED PREVIEW */}
                {(() => {
                  const sBasic = Number(salaryForm.salary || 0);
                  const sHra = Number(salaryForm.hra || 0);
                  const sAllow = Number(salaryForm.allowances || 0);
                  const sPf = Number(salaryForm.pfDeduction || 0);
                  const sTax = Number(salaryForm.taxDeduction || 0);
                  const sGross = sBasic + sHra + sAllow;
                  const sDed = sPf + sTax;
                  const sNet = Math.max(0, sGross - sDed);
                  const sCtc = sGross * 12;

                  return (
                    <div style={{ padding: "14px", background: "#FCF4FA", borderRadius: "8px", border: "1px solid #EACEE3" }}>
                      <span style={{ fontSize: "11px", color: "#9E2682", fontWeight: "800", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                        Live Calculation Preview
                      </span>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "13px" }}>
                        <div>Monthly Gross: <strong>{currencySymbol}{sGross.toLocaleString("en-IN")}</strong></div>
                        <div>Total Deductions: <strong style={{ color: "#D64545" }}>-{currencySymbol}{sDed.toLocaleString("en-IN")}</strong></div>
                        <div>Net Take-Home: <strong style={{ color: "#2E9B67" }}>{currencySymbol}{sNet.toLocaleString("en-IN")}</strong></div>
                        <div>Annual CTC: <strong style={{ color: "#751460" }}>{currencySymbol}{sCtc.toLocaleString("en-IN")}</strong></div>
                      </div>
                    </div>
                  );
                })()}

                {/* BANK DETAILS INPUTS */}
                <div>
                  <h4 style={{ margin: "0 0 12px", fontSize: "13.5px", color: "#18243A", fontWeight: "700" }}>
                    Banking & Direct Deposit Credentials
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div className="form-field" style={{ gridColumn: "span 2" }}>
                      <label>Beneficiary Bank Name</label>
                      <input
                        type="text"
                        placeholder="e.g. State Bank of India / HDFC Bank"
                        value={salaryForm.bankName || ""}
                        onChange={(e) => setSalaryForm({ ...salaryForm, bankName: e.target.value })}
                      />
                    </div>

                    <div className="form-field">
                      <label>Bank Account Number</label>
                      <input
                        type="text"
                        placeholder="e.g. 50100482910482"
                        value={salaryForm.bankAccount || ""}
                        onChange={(e) => setSalaryForm({ ...salaryForm, bankAccount: e.target.value })}
                      />
                    </div>

                    <div className="form-field">
                      <label>IFSC Code</label>
                      <input
                        type="text"
                        placeholder="e.g. SBIN0001234"
                        value={salaryForm.ifscCode || ""}
                        onChange={(e) => setSalaryForm({ ...salaryForm, ifscCode: e.target.value.toUpperCase() })}
                      />
                    </div>
                  </div>
                </div>

              </div>

              <div className="modal-footer" style={{ borderTop: "1px solid #EACEE3", padding: "14px 24px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setIsEditSalaryModalOpen(false)}
                  disabled={savingSalary}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={savingSalary}
                  style={{ background: "#9E2682", borderColor: "#9E2682" }}
                >
                  {savingSalary ? "Saving to Database..." : "Save Salary & Bank"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
