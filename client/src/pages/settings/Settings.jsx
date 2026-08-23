import { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Building,
  Shield,
  Clock,
  WalletCards,
  Calendar,
  Save,
  Database,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Server,
  Key,
} from "lucide-react";
import {
  fetchSystemSettings,
  updateSystemSettings,
  getLoadedSettings,
} from "../../services/settingsService";
import { useNotification } from "../../hooks/useNotification";

function Settings() {
  const notification = useNotification();
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [settings, setSettings] = useState(() => getLoadedSettings());

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchSystemSettings();
        setSettings(data);
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCurrencyChange = (e) => {
    const currencyVal = e.target.value;
    let symbol = "₹";
    if (currencyVal.includes("$") || currencyVal.includes("USD")) symbol = "$";
    else if (currencyVal.includes("€") || currencyVal.includes("EUR")) symbol = "€";
    else if (currencyVal.includes("£") || currencyVal.includes("GBP")) symbol = "£";
    else if (currencyVal.includes("₹") || currencyVal.includes("INR")) symbol = "₹";

    setSettings((prev) => ({
      ...prev,
      currency: currencyVal,
      currencySymbol: symbol,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    try {
      setSaving(true);
      const updated = await updateSystemSettings(settings);
      setSettings(updated);
      setSuccessMsg("System configuration successfully updated!");
      if (notification?.success) {
        notification.success("System settings updated successfully!");
      }
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Save error:", err);
      setErrorMsg(err.message || "Failed to update system settings.");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "general", label: "Organization & Branding", icon: Building },
    { id: "attendance", label: "Workforce & Attendance", icon: Clock },
    { id: "payroll", label: "Payroll & Currency", icon: WalletCards },
    { id: "leave", label: "Leave & HR Policies", icon: Calendar },
    { id: "security", label: "Security & Database", icon: Shield },
  ];

  return (
    <div className="settings-page">
      <div className="module-heading">
        <div>
          <p className="section-label">GLOBAL ADMINISTRATION</p>
          <h1>System Settings</h1>
          <p>Configure enterprise parameters, work policies, financial standards, and system security.</p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={handleSave}
          disabled={saving || loading}
        >
          <Save size={16} />
          {saving ? "Saving Changes..." : "Save Settings"}
        </button>
      </div>

      {successMsg && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 18px",
            backgroundColor: "#dcfce7",
            color: "#15803d",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "14px",
            border: "1px solid #bbf7d0",
          }}
        >
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 18px",
            backgroundColor: "#fee2e2",
            color: "#b91c1c",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "14px",
            border: "1px solid #fecaca",
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TABS NAVIGATION */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid #e2e8f0",
          marginBottom: "24px",
          overflowX: "auto",
          paddingBottom: "2px",
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                border: "none",
                background: isActive ? "#ffffff" : "transparent",
                color: isActive ? "#A1238E" : "#64748b",
                fontWeight: isActive ? "700" : "500",
                fontSize: "13.5px",
                cursor: "pointer",
                borderRadius: "8px 8px 0 0",
                borderBottom: isActive ? "2.5px solid #A1238E" : "2.5px solid transparent",
                transition: "all 0.15s ease",
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave}>
        {/* TAB 1: ORGANIZATION & BRANDING */}
        {activeTab === "general" && (
          <div className="dashboard-card">
            <div className="card-header" style={{ marginBottom: "20px" }}>
              <div>
                <h3>Organization & Corporate Identity</h3>
                <p>Company name and official communication parameters used across all modules.</p>
              </div>
            </div>

            <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
              <div className="form-field">
                <label>Company Legal Name</label>
                <input
                  name="companyName"
                  value={settings.companyName || ""}
                  onChange={handleChange}
                  placeholder="e.g. Dharam Consultancy Services (DCS)"
                  required
                />
                <small style={{ color: "#64748b", fontSize: "11.5px", marginTop: "4px" }}>
                  Reflected in headers, login branding, payslips, and official notices.
                </small>
              </div>

              <div className="form-field">
                <label>Official System / Support Email</label>
                <input
                  type="email"
                  name="systemEmail"
                  value={settings.systemEmail || ""}
                  onChange={handleChange}
                  placeholder="omraikar2128@gmail.com"
                  required
                />
                <small style={{ color: "#64748b", fontSize: "11.5px", marginTop: "4px" }}>
                  Used as official sender for OTP verification and automated notifications.
                </small>
              </div>

              <div className="form-field">
                <label>Operational Timezone</label>
                <select
                  name="timezone"
                  value={settings.timezone || "Asia/Kolkata (IST)"}
                  onChange={handleChange}
                >
                  <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST - UTC+05:30)</option>
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="America/New_York (EST)">America/New_York (EST - UTC-05:00)</option>
                  <option value="Europe/London (GMT)">Europe/London (GMT - UTC+00:00)</option>
                  <option value="Asia/Dubai (GST)">Asia/Dubai (GST - UTC+04:00)</option>
                  <option value="Asia/Singapore (SGT)">Asia/Singapore (SGT - UTC+08:00)</option>
                </select>
                <small style={{ color: "#64748b", fontSize: "11.5px", marginTop: "4px" }}>
                  Controls timestamp calculations for check-ins and audit logs.
                </small>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WORKFORCE & ATTENDANCE */}
        {activeTab === "attendance" && (
          <div className="dashboard-card">
            <div className="card-header" style={{ marginBottom: "20px" }}>
              <div>
                <h3>Workforce & Attendance Configuration</h3>
                <p>Standard working hour benchmarks, overtime rules, and shift thresholds.</p>
              </div>
            </div>

            <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
              <div className="form-field">
                <label>Daily Standard Working Hours</label>
                <input
                  type="number"
                  step="0.5"
                  min="4"
                  max="12"
                  name="workingHoursPerDay"
                  value={settings.workingHoursPerDay || "8.5"}
                  onChange={handleChange}
                  required
                />
                <small style={{ color: "#64748b", fontSize: "11.5px", marginTop: "4px" }}>
                  Threshold used to calculate full-day vs half-day attendance and employee work charts.
                </small>
              </div>

              <div className="form-field">
                <label>Standard Office Shift Timing</label>
                <input
                  value="09:00 AM - 06:00 PM"
                  disabled
                  style={{ backgroundColor: "#f8fafc", cursor: "not-allowed" }}
                />
                <small style={{ color: "#64748b", fontSize: "11.5px", marginTop: "4px" }}>
                  Standard corporate operating hours window.
                </small>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PAYROLL & CURRENCY */}
        {activeTab === "payroll" && (
          <div className="dashboard-card">
            <div className="card-header" style={{ marginBottom: "20px" }}>
              <div>
                <h3>Payroll & Currency Standards</h3>
                <p>Configure financial reporting units and salary calculation standards.</p>
              </div>
            </div>

            <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
              <div className="form-field">
                <label>Default Currency & Symbol</label>
                <select
                  name="currency"
                  value={settings.currency || "INR (₹)"}
                  onChange={handleCurrencyChange}
                >
                  <option value="INR (₹)">INR (₹) - Indian Rupee</option>
                  <option value="USD ($)">USD ($) - US Dollar</option>
                  <option value="EUR (€)">EUR (€) - Euro</option>
                  <option value="GBP (£)">GBP (£) - British Pound</option>
                  <option value="AED (د.إ)">AED (د.إ) - UAE Dirham</option>
                </select>
                <small style={{ color: "#64748b", fontSize: "11.5px", marginTop: "4px" }}>
                  Current active symbol: <strong style={{ color: "#A1238E" }}>{settings.currencySymbol || "₹"}</strong>
                </small>
              </div>

              <div className="form-field">
                <label>Monthly Salary Processing Cycle</label>
                <input
                  value="1st of Every Month (Auto-Generated)"
                  disabled
                  style={{ backgroundColor: "#f8fafc", cursor: "not-allowed" }}
                />
                <small style={{ color: "#64748b", fontSize: "11.5px", marginTop: "4px" }}>
                  Automated payslip computation schedule for Finance Department.
                </small>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LEAVE POLICIES */}
        {activeTab === "leave" && (
          <div className="dashboard-card">
            <div className="card-header" style={{ marginBottom: "20px" }}>
              <div>
                <h3>Leave & Time-Off Policies</h3>
                <p>Set statutory annual leave quotas and advance submission requirements.</p>
              </div>
            </div>

            <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
              <div className="form-field">
                <label>Annual Paid Leave Quota (Days / Year)</label>
                <input
                  type="number"
                  name="annualLeaveQuota"
                  value={settings.annualLeaveQuota || "18"}
                  onChange={handleChange}
                  min="1"
                  max="45"
                  required
                />
                <small style={{ color: "#64748b", fontSize: "11.5px", marginTop: "4px" }}>
                  Standard annual casual and earned leave allocation per employee.
                </small>
              </div>

              <div className="form-field">
                <label>Minimum Advance Application Notice (Days)</label>
                <input
                  type="number"
                  name="leaveNoticeDays"
                  value={settings.leaveNoticeDays || "2"}
                  onChange={handleChange}
                  min="0"
                  max="14"
                  required
                />
                <small style={{ color: "#64748b", fontSize: "11.5px", marginTop: "4px" }}>
                  Advance notice policy enforced for planned time-off requests.
                </small>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SECURITY & DATABASE */}
        {activeTab === "security" && (
          <div className="dashboard-card">
            <div className="card-header" style={{ marginBottom: "20px" }}>
              <div>
                <h3>Security Protocols & System Engine</h3>
                <p>Authentication thresholds, password complexity, and database connectivity.</p>
              </div>
            </div>

            <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
              <div className="form-field">
                <label>Session Expiration Window</label>
                <select
                  name="sessionExpiry"
                  value={settings.sessionExpiry || "24 Hours"}
                  onChange={handleChange}
                >
                  <option value="12 Hours">12 Hours</option>
                  <option value="24 Hours">24 Hours (Standard)</option>
                  <option value="7 Days">7 Days (Extended)</option>
                  <option value="30 Days">30 Days</option>
                </select>
                <small style={{ color: "#64748b", fontSize: "11.5px", marginTop: "4px" }}>
                  JWT authorization token validity period.
                </small>
              </div>

              <div className="form-field">
                <label>Minimum Password Length</label>
                <input
                  type="number"
                  name="minPasswordLength"
                  value={settings.minPasswordLength || "6"}
                  onChange={handleChange}
                  min="6"
                  max="16"
                  required
                />
                <small style={{ color: "#64748b", fontSize: "11.5px", marginTop: "4px" }}>
                  Enforced on password changes and employee account resets.
                </small>
              </div>

              <div className="form-field">
                <label>Storage & Security Architecture</label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px" }}>
                  <Shield size={16} color="#16a34a" />
                  <span style={{ fontSize: "13.5px", fontWeight: "600", color: "#15803d" }}>Enterprise Secure Vault — Online & Active</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default Settings;
