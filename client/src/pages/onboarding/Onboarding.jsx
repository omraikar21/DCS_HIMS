import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  UserCheck,
} from "lucide-react";

import {
  getOnboarding,
  createOnboarding,
  updateOnboarding,
} from "../../services/onboardingService";

import {
  getDepartments,
} from "../../services/departmentService";

import OnboardingSummary
  from "../../components/onboarding/OnboardingSummary";

import OnboardingFilters
  from "../../components/onboarding/OnboardingFilters";

import OnboardingTable
  from "../../components/onboarding/OnboardingTable";

import OnboardingModal
  from "../../components/onboarding/OnboardingModal";

const statusToUI = {
  PENDING: "Started",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

const statusToBackend = {
  "Started": "PENDING",
  "In Progress": "IN_PROGRESS",
  "Almost Complete": "IN_PROGRESS",
  "Completed": "COMPLETED",
};

function Onboarding() {

  const [records, setRecords] =
    useState([]);

  const [departments, setDepartments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [department, setDepartment] =
    useState("All Departments");

  const [status, setStatus] =
    useState("All Status");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [selectedRecord, setSelectedRecord] =
    useState(null);

  const mapOnboardingToUI = (rec) => {
    const name = rec.candidate_name || `${rec.first_name || ""} ${rec.last_name || ""}`.trim() || "New Joiner";
    const joiningDate = rec.joining_date ? String(rec.joining_date).slice(0, 10) : "";
    let progress = 30;
    if (rec.onboarding_status === "COMPLETED") progress = 100;
    else if (rec.onboarding_status === "IN_PROGRESS") progress = 60;
    if (rec.documents_completed && rec.orientation_completed) progress = 100;

    return {
      id: `ONB-${String(rec.id).padStart(3, "0")}`,
      databaseId: rec.id,
      employeeId: rec.employee_code || (rec.candidate_id ? `CAN-${rec.candidate_id}` : `EMP-${rec.employee_id || rec.id}`),
      employeeName: name,
      department: rec.name || "Development",
      position: rec.designation || "Software Developer",
      joiningDate,
      documents: rec.documents_completed ? "5/5" : "3/5",
      progress,
      status: statusToUI[rec.onboarding_status] || "Started",
    };
  };

  const loadOnboardingData = async () => {
    try {
      setLoading(true);
      setError("");
      const [onboardingData, deptData] = await Promise.all([
        getOnboarding(),
        getDepartments().catch(() => []),
      ]);
      const mapped = (onboardingData || []).map(mapOnboardingToUI);
      setRecords(mapped);
      setDepartments(deptData || []);
    } catch (err) {
      console.error("Failed to load onboarding:", err);
      setError(err.message || "Failed to load onboarding data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOnboardingData();
  }, []);


  const filteredRecords =
    useMemo(() => {

      return records.filter(
        (record) => {

          const searchText =
            search.toLowerCase();


          const matchesSearch =
            record.employeeName
              .toLowerCase()
              .includes(searchText) ||

            record.position
              .toLowerCase()
              .includes(searchText) ||

            record.employeeId
              .toLowerCase()
              .includes(searchText);


          const matchesDepartment =
            department ===
              "All Departments" ||
            record.department ===
              department;


          const matchesStatus =
            status === "All Status" ||
            record.status ===
              status;


          return (
            matchesSearch &&
            matchesDepartment &&
            matchesStatus
          );

        }
      );

    }, [
      records,
      search,
      department,
      status,
    ]);


  const handleAdd = () => {

    setSelectedRecord(null);

    setModalOpen(true);

  };


  const handleView = (
    record
  ) => {

    setSelectedRecord(record);

    setModalOpen(true);

  };


  const handleEdit = (
    record
  ) => {

    setSelectedRecord(record);

    setModalOpen(true);

  };


  const handleSave = async (
    formData
  ) => {
    try {
      setLoading(true);
      setError("");

      let deptId = 1;
      if (departments.length > 0) {
        const found = departments.find(
          d => d.name?.toLowerCase() === formData.department?.toLowerCase()
        );
        if (found) deptId = found.id;
        else deptId = departments[0].id;
      }

      const backendStatus = statusToBackend[formData.status] || "PENDING";

      const payload = {
        candidateName: formData.employeeName,
        joiningDate: formData.joiningDate,
        departmentId: deptId,
        designation: formData.position,
        onboardingStatus: backendStatus,
        documentsCompleted: formData.progress >= 80,
        orientationCompleted: formData.progress >= 100,
      };

      if (selectedRecord) {
        await updateOnboarding(
          selectedRecord.databaseId || selectedRecord.id,
          payload
        );
      } else {
        await createOnboarding(payload);
      }

      await loadOnboardingData();
      setModalOpen(false);
      setSelectedRecord(null);
    } catch (err) {
      console.error("Failed to save onboarding:", err);
      setError(err.message || "Failed to save onboarding");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="onboarding-page">

      {/* HEADER */}

      <div className="module-heading">

        <div>

          <p className="section-label">
            EMPLOYEE INTEGRATION
          </p>

          <h1>
            Onboarding
          </h1>

          <p>
            Track and manage onboarding
            progress for new employees.
          </p>

        </div>


        <button
          className="primary-button"
          onClick={handleAdd}
        >

          <Plus size={17} />

          Add New Joiner

        </button>

      </div>

      {error && (
        <div className="dashboard-card">
          <p style={{ color: "#e11d48" }}>{error}</p>
        </div>
      )}


      {/* SUMMARY */}

      <OnboardingSummary
        records={filteredRecords}
      />


      {/* TABLE */}

      <section className="dashboard-card">

        <div className="onboarding-section-header">

          <div>

            <h3>
              New Joiners
            </h3>

            <p>
              Monitor documentation,
              assets and training progress.
            </p>

          </div>


          <div className="onboarding-total-label">

            <UserCheck size={16} />

            {filteredRecords.length}
            {" "}
            Joiners

          </div>

        </div>


        <OnboardingFilters
          search={search}
          setSearch={setSearch}
          department={department}
          setDepartment={setDepartment}
          status={status}
          setStatus={setStatus}
        />


        <OnboardingTable
          records={filteredRecords}
          onView={handleView}
          onEdit={handleEdit}
        />

      </section>


      {/* MODAL */}

      <OnboardingModal
        isOpen={modalOpen}
        onClose={() => {

          setModalOpen(false);

          setSelectedRecord(null);

        }}
        onSave={handleSave}
        record={selectedRecord}
      />

    </div>
  );
}

export default Onboarding;