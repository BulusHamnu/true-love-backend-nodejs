import xss from "xss";
const escapeFields = ["password", "email"];

function cleanData(value, field = "") {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return value;

  let g = value.trim();

  if (field && escapeFields.includes(field)) {
    return g;
  }
  g = xss(g);
  return g;
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

// const data = sanitizeData({
//   fullName: `Bulus <script>alert("xss");</script>`,
//   age: 21,
//   profession: " programmer ",
//   favouriteFoods: [" <iframe>Hello</iframe>", ``],
//   cars: [
//     {
//       car1: `aston martin <a href="javascript:alert(1)">Click</a>`,
//       car2: "porshe 911",
//     },
//   ],
// });

// console.log("data", data);
