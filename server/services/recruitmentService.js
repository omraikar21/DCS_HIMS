// ==========================================
// RECRUITMENT SERVICE
// B16
// ==========================================

const {
  getAllRecruitment,
  getRecruitmentById,
  createRecruitment,
  updateRecruitment,
  deleteRecruitment,
} = require("../models/recruitmentModel");


// ------------------------------------------
// GET ALL
// ------------------------------------------

const getRecruitmentRecords = async () => {

  return await getAllRecruitment();

};


// ------------------------------------------
// GET BY ID
// ------------------------------------------

const getRecruitment = async (id) => {

  const record =
    await getRecruitmentById(id);

  if (!record) {

    throw new Error(
      "Recruitment record not found"
    );

  }

  return record;
};


// ------------------------------------------
// CREATE
// ------------------------------------------

const addRecruitment = async (data) => {

  return await createRecruitment(data);

};


// ------------------------------------------
// UPDATE
// ------------------------------------------

const editRecruitment = async (
  id,
  data
) => {

  const existing =
    await getRecruitmentById(id);

  if (!existing) {

    throw new Error(
      "Recruitment record not found"
    );

  }

  return await updateRecruitment(
    id,
    data
  );
};


// ------------------------------------------
// DELETE
// ------------------------------------------

const removeRecruitment = async (id) => {

  const existing =
    await getRecruitmentById(id);

  if (!existing) {

    throw new Error(
      "Recruitment record not found"
    );

  }

  return await deleteRecruitment(id);
};


module.exports = {
  getRecruitmentRecords,
  getRecruitment,
  addRecruitment,
  editRecruitment,
  removeRecruitment,
};