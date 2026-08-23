import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  UserPlus,
} from "lucide-react";

import {
  getRecruitment,
  createRecruitment,
  updateRecruitment,
} from "../../services/recruitmentService";

import {
  getDepartments,
} from "../../services/departmentService";

import RecruitmentSummary
  from "../../components/recruitment/RecruitmentSummary";

import RecruitmentFilters
  from "../../components/recruitment/RecruitmentFilters";

import RecruitmentTable
  from "../../components/recruitment/RecruitmentTable";

import RecruitmentModal
  from "../../components/recruitment/RecruitmentModal";

const statusToUI = {
  APPLIED: "Applied",
  SCREENING: "Shortlisted",
  INTERVIEW: "In Progress",
  SELECTED: "Selected",
  REJECTED: "Rejected",
};

const statusToBackend = {
  "Applied": "APPLIED",
  "Shortlisted": "SCREENING",
  "In Progress": "INTERVIEW",
  "Selected": "SELECTED",
  "Rejected": "REJECTED",
  "Active": "APPLIED",
};

function Recruitment() {

  const [records, setRecords] =
    useState([]);

  const [departments, setDepartments] =
    useState([]);

  const [_loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [department, setDepartment] =
    useState("All Departments");

  const [status, setStatus] =
    useState("All Status");

  const [stage, setStage] =
    useState("All Stages");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [selectedRecord, setSelectedRecord] =
    useState(null);

  const mapRecruitmentToUI = (rec) => {
    const appliedDate = rec.application_date ? String(rec.application_date).slice(0, 10) : "";
    const interviewDate = rec.interview_date ? String(rec.interview_date).slice(0, 10) : "";
    const uiStatus = statusToUI[rec.status] || rec.status || "Applied";
    return {
      id: `REC-${String(rec.id).padStart(3, "0")}`,
      databaseId: rec.id,
      candidateName: rec.candidate_name || "",
      email: rec.email || "",
      phone: rec.phone || "",
      position: rec.position || "",
      department: rec.name || rec.department_name || "General",
      departmentId: rec.department_id,
      experience: rec.experience_years ? `${rec.experience_years} Years` : "Fresher",
      appliedDate,
      interviewDate,
      stage: rec.status === "INTERVIEW" ? "Technical Interview" : (rec.status === "SELECTED" ? "Selected" : "Screening"),
      status: uiStatus,
      notes: rec.notes || "",
    };
  };

  const loadRecruitmentData = async () => {
    try {
      setLoading(true);
      setError("");
      const [candidatesData, deptData] = await Promise.all([
        getRecruitment(),
        getDepartments().catch(() => []),
      ]);
      const mapped = (candidatesData || []).map(mapRecruitmentToUI);
      setRecords(mapped);
      setDepartments(deptData || []);
    } catch (err) {
      console.error("Failed to load recruitment:", err);
      setError(err.message || "Failed to load recruitment data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecruitmentData();
  }, []);


  /* FILTER */

  const filteredRecords =
    useMemo(() => {

      return records.filter(
        (record) => {

          const searchText =
            search.toLowerCase();


          const matchesSearch =
            record.candidateName
              .toLowerCase()
              .includes(searchText) ||

            record.position
              .toLowerCase()
              .includes(searchText) ||

            record.email
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


          const matchesStage =
            stage === "All Stages" ||
            record.stage ===
              stage;


          return (
            matchesSearch &&
            matchesDepartment &&
            matchesStatus &&
            matchesStage
          );

        }
      );

    }, [
      records,
      search,
      department,
      status,
      stage,
    ]);


  /* ADD */

  const handleAdd = () => {

    setSelectedRecord(null);

    setModalOpen(true);

  };


  /* EDIT */

  const handleEdit = (
    record
  ) => {

    setSelectedRecord(record);

    setModalOpen(true);

  };


  /* VIEW */

  const handleView = (
    record
  ) => {

    setSelectedRecord(record);

    setModalOpen(true);

  };


  /* SAVE */

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

      const experienceNum = parseInt(formData.experience) || 1;
      const backendStatus = statusToBackend[formData.status] || "APPLIED";

      const payload = {
        candidateName: formData.candidateName,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        departmentId: deptId,
        experienceYears: experienceNum,
        status: backendStatus,
        interviewDate: formData.interviewDate || null,
        notes: `Stage: ${formData.stage || "Screening"}`,
      };

      if (selectedRecord) {
        await updateRecruitment(
          selectedRecord.databaseId || selectedRecord.id,
          payload
        );
      } else {
        await createRecruitment(payload);
      }

      await loadRecruitmentData();
      setModalOpen(false);
      setSelectedRecord(null);
    } catch (err) {
      console.error("Failed to save candidate:", err);
      setError(err.message || "Failed to save candidate");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="recruitment-page">

      {/* HEADER */}

      <div className="module-heading">

        <div>

          <p className="section-label">
            TALENT ACQUISITION
          </p>

          <h1>
            Recruitment
          </h1>

          <p>
            Track candidate pipeline
            and interview processes.
          </p>

        </div>


        <button
          className="primary-button"
          onClick={handleAdd}
        >

          <Plus size={17} />

          Add Candidate

        </button>

      </div>

      {error && (
        <div className="dashboard-card">
          <p style={{ color: "#e11d48" }}>{error}</p>
        </div>
      )}


      {/* SUMMARY */}

      <RecruitmentSummary
        records={filteredRecords}
      />


      {/* TABLE */}

      <section className="dashboard-card">

        <div className="recruitment-section-header">

          <div>

            <h3>
              Candidate Pipeline
            </h3>

            <p>
              Manage active job
              applications.
            </p>

          </div>


          <div className="recruitment-total-label">

            <UserPlus size={16} />

            {filteredRecords.length}
            {" "}
            Candidates

          </div>

        </div>


        <RecruitmentFilters
          search={search}
          setSearch={setSearch}
          department={department}
          setDepartment={setDepartment}
          status={status}
          setStatus={setStatus}
          stage={stage}
          setStage={setStage}
        />


        <RecruitmentTable
          records={filteredRecords}
          onView={handleView}
          onEdit={handleEdit}
        />

      </section>


      {/* MODAL */}

      <RecruitmentModal
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

export default Recruitment;