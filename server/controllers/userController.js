// ==========================================
// USER & ROLE MANAGEMENT CONTROLLER
// Express Handlers
// ==========================================

const {
  fetchUsersList,
  createNewUser,
  modifyUser,
  removeUser,
} = require("../services/userService");

// ------------------------------------------
// GET ALL USERS & TELEMETRY
// ------------------------------------------
const getUsers = async (req, res) => {
  try {
    const data = await fetchUsersList(req.user);
    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch users",
    });
  }
};

// ------------------------------------------
// CREATE USER
// ------------------------------------------
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const requester = req.user;

    const user = await createNewUser(
      {
        name,
        email,
        password,
        role,
      },
      requester
    );

    return res.status(201).json({
      success: true,
      message: `${role} account for ${name} created successfully`,
      data: user,
    });
  } catch (error) {
    console.error("Create user error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create user",
    });
  }
};

// ------------------------------------------
// UPDATE USER
// ------------------------------------------
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, isActive } = req.body;
    const requester = req.user;

    const user = await modifyUser(
      id,
      { name, role, isActive },
      requester
    );

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update user",
    });
  }
};

// ------------------------------------------
// DELETE USER
// ------------------------------------------
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const requester = req.user;

    const deleted = await removeUser(id, requester);

    return res.status(200).json({
      success: true,
      message: `User ${deleted.name} (${deleted.email}) deleted successfully`,
      data: deleted,
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to delete user",
    });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
