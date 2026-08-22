/*
 * =========================================
 * FORM VALIDATION UTILITIES
 * =========================================
 */


/*
 * Required field
 */

export const required = (
  value,
  fieldName
) => {

  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {

    return `${fieldName} is required`;

  }

  return "";

};


/*
 * Email
 */

export const validEmail = (
  value
) => {

  if (!value) {
    return "Email is required";
  }


  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


  if (
    !emailPattern.test(value)
  ) {

    return "Enter a valid email address";

  }


  return "";

};


/*
 * Phone number
 */

export const validPhone = (
  value
) => {
  if (!value || String(value).trim() === "") {
    return "";
  }

  const cleanPhone = String(value).replace(/[\s\-()+]/g, "");

  if (cleanPhone.length < 7 || cleanPhone.length > 15 || !/^\d+$/.test(cleanPhone)) {
    return "Enter a valid phone number (e.g. +91 9876543210)";
  }

  return "";
};



/*
 * Minimum length
 */

export const minLength = (
  value,
  length,
  fieldName
) => {

  if (!value) {

    return `${fieldName} is required`;

  }


  if (
    String(value).length <
    length
  ) {

    return `${fieldName} must contain at least ${length} characters`;

  }


  return "";

};


/*
 * Positive number
 */

export const positiveNumber = (
  value,
  fieldName
) => {

  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {

    return `${fieldName} is required`;

  }


  if (
    Number.isNaN(
      Number(value)
    )
  ) {

    return `${fieldName} must be a number`;

  }


  if (
    Number(value) < 0
  ) {

    return `${fieldName} cannot be negative`;

  }


  return "";

};


/*
 * Date validation
 */

export const validDate = (
  value,
  fieldName
) => {

  if (!value) {

    return `${fieldName} is required`;

  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return `Enter a valid ${fieldName}`;

  }


  return "";

};


/*
 * Date comparison
 */

export const endDateAfterStartDate = (
  startDate,
  endDate
) => {

  if (
    !startDate ||
    !endDate
  ) {

    return "";

  }


  const start =
    new Date(startDate);

  const end =
    new Date(endDate);


  if (end < start) {

    return "End date cannot be before start date";

  }


  return "";

};