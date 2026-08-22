// ==========================================
// ATTENDANCE SERVICE
// B11
// ==========================================

const {
  getAllAttendance,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
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


module.exports = {
  getAttendanceRecords,
  getAttendance,
  addAttendance,
  editAttendance,
  removeAttendance,
};