const express = require("express");

const {
  pool,
} = require("../config/database");


const router =
  express.Router();


// ------------------------------------------
// DATABASE TEST
// ------------------------------------------

router.get(
  "/test",
  async (req, res) => {

    try {

      const result =
        await pool.query(
          "SELECT NOW() AS current_time"
        );


      res.json({

        success: true,

        message:
          "PostgreSQL query successful",

        currentTime:
          result.rows[0].current_time,

      });


    } catch (error) {

      console.error(
        error
      );


      res.status(500).json({

        success: false,

        message:
          "Database query failed",

      });

    }

  }
);


module.exports = router;