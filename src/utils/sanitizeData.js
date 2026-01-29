import xss from "xss";

/* Sanitization functions */
function cleanData(value, field = "") {
  // Number and non string value don't need cleaning
  if (typeof value !== "string") return value;

  let cleanValue = value.trim();
  if (field === "password" || field === "confirmPassword") {
    const normalizedPassword = cleanValue.normalize("NFC");
    return normalizedPassword;
  }

  cleanValue = xss(cleanValue);
  return cleanValue;
}

export default function sanitizeData(data, field = "") {
  if (Array.isArray(data)) {
    // check if data is array
    return data.map((value) => sanitizeData(value));
  } else if (typeof data === "object") {
    // check if data is an object
    const result = {};
    for (const field of Object.keys(data)) {
      result[field] = sanitizeData(data[field], field);
    }
    return result;
  } else {
    // else return clean function
    return cleanData(data, field);
  }
}
