// ==========================================
// DEPARTMENT CONTROLLER
// B10
// ==========================================

const {
  getDepartments,
  getDepartment,
  addDepartment,
  editDepartment,
  removeDepartment,
} = require("../services/departmentService");


const {
  isRequired,
} = require("../utils/validation");


// ------------------------------------------
// GET ALL
// ------------------------------------------

const getAll =
  async (req, res) => {

    try {

      const departments =
        await getDepartments();


      return res.status(200).json({

        success: true,

        count:
          departments.length,

        data:
          departments,

      });

    } catch (error) {

      console.error(
        "Get departments error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch departments",

      });

    }

  };


// ------------------------------------------
// GET BY ID
// ------------------------------------------

const getById =
  async (req, res) => {

    try {

      const department =
        await getDepartment(
          req.params.id
        );


      return res.status(200).json({

        success: true,

        data:
          department,

      });

    } catch (error) {

      console.error(
        "Get department error:",
        error
      );


      return res.status(404).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// ------------------------------------------
// CREATE
// ------------------------------------------

const create =
  async (req, res) => {

    try {

      const {
        name,
        description,
      } = req.body;


      if (
        !isRequired(name)
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Department name is required",

        });

      }


      const department =
        await addDepartment({

          name:
            name.trim(),

          description:
            description || null,

        });


      return res.status(201).json({

        success: true,

        message:
          "Department created successfully",

        data:
          department,

      });

    } catch (error) {

      console.error(
        "Create department error:",
        error
      );


      if (
        error.code === "23505"
      ) {

        return res.status(409).json({

          success: false,

          message:
            "Department already exists",

        });

      }


      return res.status(500).json({

        success: false,

        message:
          "Failed to create department",

      });

    }

  };


// ------------------------------------------
// UPDATE
// ------------------------------------------

const update =
  async (req, res) => {

    try {

      const {
        name,
        description,
        isActive,
      } = req.body;


      if (
        !isRequired(name)
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Department name is required",

        });

      }


      const department =
        await editDepartment(

          req.params.id,

          {

            name:
              name.trim(),

            description:
              description || null,

            isActive:
              isActive !== undefined
                ? isActive
                : true,

          }

        );


      return res.status(200).json({

        success: true,

        message:
          "Department updated successfully",

        data:
          department,

      });

    } catch (error) {

      console.error(
        "Update department error:",
        error
      );


      return res.status(404).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// ------------------------------------------
// DELETE / DEACTIVATE
// ------------------------------------------

const remove =
  async (req, res) => {

    try {

      const department =
        await removeDepartment(
          req.params.id
        );


      return res.status(200).json({

        success: true,

        message:
          "Department deactivated successfully",

        data:
          department,

      });

    } catch (error) {

      console.error(
        "Delete department error:",
        error
      );


      return res.status(404).json({

        success: false,

        message:
          error.message,

      });

    }

  };


module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};