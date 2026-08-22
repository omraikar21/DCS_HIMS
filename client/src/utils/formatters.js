/*
 * =========================================
 * COMMON FORMATTERS
 * =========================================
 */


/*
 * Currency
 */

export const formatCurrency = (
  value
) => {

  const amount =
    Number(value) || 0;


  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }
  ).format(amount);

};


/*
 * Date
 */

export const formatDate = (
  value
) => {

  if (!value) {
    return "-";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "-";

  }


  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );

};


/*
 * Capitalize
 */

export const capitalize = (
  value
) => {

  if (!value) {
    return "";
  }


  return String(value)
    .charAt(0)
    .toUpperCase() +
    String(value)
      .slice(1);

};