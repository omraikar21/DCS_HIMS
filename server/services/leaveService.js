// ==========================================
// LEAVE SERVICE
// B12
// ==========================================

const {
    getAllLeaves,
    getLeaveById,
    createLeave,
    updateLeave,
    deleteLeave,
    approveLeave,
    rejectLeave,
} = require("../models/leaveModel");


// ------------------------------------------
// GET ALL LEAVES
// ------------------------------------------

const getLeaves =
    async () => {

        return await getAllLeaves();

    };


// ------------------------------------------
// GET LEAVE BY ID
// ------------------------------------------

const getLeave =
    async (id) => {

        const leave =
            await getLeaveById(id);


        if (!leave) {

            throw new Error(
                "Leave request not found"
            );

        }


        return leave;

    };


// ------------------------------------------
// CREATE LEAVE
// ------------------------------------------

const addLeave =
    async (leaveData) => {

        return await createLeave(
            leaveData
        );

    };


// ------------------------------------------
// UPDATE LEAVE
// ------------------------------------------

const editLeave =
    async (
        id,
        leaveData
    ) => {

        const existing =
            await getLeaveById(id);


        if (!existing) {

            throw new Error(
                "Leave request not found"
            );

        }


        if (
            existing.status !== "PENDING"
        ) {

            throw new Error(
                "Only pending leave requests can be updated"
            );

        }


        return await updateLeave(
            id,
            leaveData
        );

    };


// ------------------------------------------
// DELETE LEAVE
// ------------------------------------------

const removeLeave =
    async (id) => {

        const existing =
            await getLeaveById(id);


        if (!existing) {

            throw new Error(
                "Leave request not found"
            );

        }


        if (
            existing.status !== "PENDING"
        ) {

            throw new Error(
                "Only pending leave requests can be deleted"
            );

        }


        return await deleteLeave(id);

    };


// ------------------------------------------
// APPROVE LEAVE
// ------------------------------------------

const approve =
    async (
        id,
        approvedBy
    ) => {

        const existing =
            await getLeaveById(id);


        if (!existing) {

            throw new Error(
                "Leave request not found"
            );

        }


        if (
            existing.status !== "PENDING"
        ) {

            throw new Error(
                "Only pending leave requests can be approved"
            );

        }


        return await approveLeave(
            id,
            approvedBy
        );

    };


// ------------------------------------------
// REJECT LEAVE
// ------------------------------------------

const reject =
    async (
        id,
        rejectionReason
    ) => {

        const existing =
            await getLeaveById(id);


        if (!existing) {

            throw new Error(
                "Leave request not found"
            );

        }


        if (
            existing.status !== "PENDING"
        ) {

            throw new Error(
                "Only pending leave requests can be rejected"
            );

        }


        return await rejectLeave(
            id,
            rejectionReason
        );

    };


// ------------------------------------------
// HOLD / PENDING LEAVE
// ------------------------------------------

const hold =
    async (
        id
    ) => {

        const existing =
            await getLeaveById(id);

        if (!existing) {
            throw new Error(
                "Leave request not found"
            );
        }

        return await holdLeave(id);

    };


module.exports = {

    getLeaves,

    getLeave,

    addLeave,

    editLeave,

    removeLeave,

    approve,

    reject,

    hold,

};