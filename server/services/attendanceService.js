const {
  getAllAttendance,
  getUserAttendance,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  recordFacePunch,
} = require("../models/attendanceModel");

// ------------------------------------------
// GET ALL ATTENDANCE (ADMIN / HR)
// ------------------------------------------

const getAttendanceRecords =
  async () => {

    return await getAllAttendance();

  };

// ------------------------------------------
// GET ATTENDANCE FOR A SPECIFIC USER
// ------------------------------------------

const getUserAttendanceRecords = async (user) => {
  if (!user) return [];
  return await getUserAttendance(user.id, user.email);
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
  getUserAttendanceRecords,
  getAttendance,
  addAttendance,
  editAttendance,
  removeAttendance,
};