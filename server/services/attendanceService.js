const {
  getAllAttendance,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  recordFacePunch,
} = require("../models/attendanceModel");

// ------------------------------------------
// GET ALL ATTENDANCE
// ------------------------------------------

const getAttendanceRecords =
  async () => {

    return await getAllAttendance();

  };


// ------------------------------------------
// GET ATTENDANCE BY ID
// ------------------------------------------

const getAttendance =
  async (id) => {

    const record =
      await getAttendanceById(id);


    if (!record) {

      throw new Error(
        "Attendance record not found"
      );

    }


    return record;

  };


// ------------------------------------------
// CREATE
// ------------------------------------------

const addAttendance =
  async (attendanceData) => {

    return await createAttendance(
      attendanceData
    );

  };


// ------------------------------------------
// UPDATE
// ------------------------------------------

const editAttendance =
  async (
    id,
    attendanceData
  ) => {

    const existing =
      await getAttendanceById(id);


    if (!existing) {

      throw new Error(
        "Attendance record not found"
      );

    }


    return await updateAttendance(
      id,
      attendanceData
    );

  };


// ------------------------------------------
// DELETE
// ------------------------------------------

const removeAttendance =
  async (id) => {

    const existing =
      await getAttendanceById(id);


    if (!existing) {

      throw new Error(
        "Attendance record not found"
      );

    }


    return await deleteAttendance(id);

  };

// ------------------------------------------
// PROCESS FACE PUNCH (BIOMETRIC AI)
// ------------------------------------------

const processFacePunchService = async (punchData) => {
  return await recordFacePunch(punchData);
};

// ------------------------------------------
// PROCESS BATCH BIOMETRIC PUNCHES
// ------------------------------------------

const processBiometricBatchService = async (records = [], deviceId = "FACE_BATCH_SYS") => {
  const results = [];
  const errors = [];

  for (const item of records) {
    try {
      const punchRes = await recordFacePunch({
        employeeCode: item.employee_code || item.employeeCode,
        employeeId: item.employee_id || item.employeeId,
        email: item.email,
        punchTime: item.punch_time || item.punchTime || item.timestamp,
        deviceId: item.device_id || item.deviceId || deviceId,
        confidence: item.confidence !== undefined ? item.confidence : 1.0,
        punchType: item.punch_type || item.punchType || "AUTO",
        remarks: item.remarks || "Batch Biometric Sync",
      });
      results.push(punchRes);
    } catch (err) {
      errors.push({
        record: item,
        error: err.message,
      });
    }
  }

  return {
    total: records.length,
    successful: results.length,
    failed: errors.length,
    results,
    errors,
  };
};

module.exports = {
  getAttendanceRecords,
  getAttendance,
  addAttendance,
  editAttendance,
  removeAttendance,
  processFacePunchService,
  processBiometricBatchService,
};