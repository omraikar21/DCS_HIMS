// ==========================================
// VALIDATION HELPERS
// B9
// ==========================================


// ------------------------------------------
// REQUIRED FIELD
// ------------------------------------------

const isRequired =
  (value) => {

    return (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    );

  };


// ------------------------------------------
// EMAIL
// ------------------------------------------

const isValidEmail =
  (email) => {

    if (!email) {

      return false;

    }


    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      .test(email);

  };


// ------------------------------------------
// POSITIVE NUMBER
// ------------------------------------------

const isPositiveNumber =
  (value) => {

    return (
      value !== undefined &&
      value !== null &&
      Number(value) >= 0
    );

  };


module.exports = {
  isRequired,
  isValidEmail,
  isPositiveNumber,
};