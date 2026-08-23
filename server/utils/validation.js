// ==========================================
// VALIDATION HELPERS
// ==========================================

// ------------------------------------------
// REQUIRED FIELD
// ------------------------------------------

const isRequired = (value) => {
  return (
    value !== undefined &&
    value !== null &&
    String(value).trim() !== ""
  );
};

// ------------------------------------------
// EMAIL
// ------------------------------------------

const isValidEmail = (email) => {
  if (!email) {
    return false;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// ------------------------------------------
// POSITIVE NUMBER
// ------------------------------------------

const isPositiveNumber = (value) => {
  return (
    value !== undefined &&
    value !== null &&
    Number(value) >= 0
  );
};

// ------------------------------------------
// PHONE NUMBER (EXACTLY 10 DIGITS)
// ------------------------------------------

const isValidPhone = (phone) => {
  if (!phone) {
    return false;
  }
  const cleanPhone = String(phone).replace(/[\s\-()+]/g, "");
  return cleanPhone.length === 10 && /^\d{10}$/.test(cleanPhone);
};

module.exports = {
  isRequired,
  isValidEmail,
  isValidPhone,
  isPositiveNumber,
};