import { useState, useEffect } from "react";
import { getStoredUser } from "../../services/authService";

function ProfileHeader() {
  const [user, setUser] = useState(() => getStoredUser());

  useEffect(() => {
    const handleProfileUpdate = () => {
      const updated = getStoredUser();
      if (updated) setUser(updated);
    };
    window.addEventListener("userProfileUpdated", handleProfileUpdate);
    return () => window.removeEventListener("userProfileUpdated", handleProfileUpdate);
  }, []);

  const name = user?.name || "Om Raikar";
  const role = user?.role || "ADMIN";
  const email = user?.email || "admin@dcshims.com";
  const avatar = user?.avatar || "";

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const designationMap = {
    ADMIN: "System Administrator · Management",
    HR: "HR Manager · Human Resources",
    FINANCE: "Finance Manager · Accounts & Payroll",
    EMPLOYEE: "Software Engineer · Development",
  };

  const designation = designationMap[role] || `${role} · DCS Staff`;

  return (
    <div className="profile-header">
      <div className="profile-avatar" style={{ overflow: "hidden" }}>
        {avatar ? (
          <img src={avatar} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          initials
        )}
      </div>

      <div className="profile-info">
        <h2>{name}</h2>
        <p>{designation}</p>

        <div className="profile-tags">
          <span>{email}</span>
          <span className="active-tag">Active</span>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;