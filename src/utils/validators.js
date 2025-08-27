import Joi from "joi";

// sign up validation schema
export const signupSchema = Joi.object({
  fullName: Joi.string().required().min(3),
  phone: Joi.string().required().min(11),
  age: Joi.number().required().min(14),
  password: Joi.string()
    .required()
    .min(6)
    .custom((value, helpers) => {
      if (!/^(?=.*[A-Za-z]).+$/.test(value))
        return helpers.error("any.custom", {
          message:
            "Password must at least contain one letter (uppercase or lowercase)",
        });

      if (!/^(?=.*\d).+$/.test(value))
        return helpers.error("any.custom", {
          message: "Password must at least contain one number (0 - 9)",
        });

      if (!/^(?=.*[^A-Za-z\d]).+$/.test(value))
        return helpers.error("any.custom", {
          message:
            "Password must contain at least one symbol (e.g. !, @, #, $, %)",
        });

      return value;
    })
    .messages({ "any.custom": "{{#message}}" }),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["net", "com"] } })
    .required(),
});

// email and password validation schema
export const emailAndPasswordSchema = Joi.object({
  password: Joi.string()
    .required()
    .min(6)
    .custom((value, helpers) => {
      if (!/^(?=.*[A-Za-z]).+$/.test(value))
        return helpers.error("any.custom", {
          message:
            "Password must at least contain one letter (uppercase or lowercase)",
        });

      if (!/^(?=.*\d).+$/.test(value))
        return helpers.error("any.custom", {
          message: "Password must at least contain one number (0 - 9)",
        });

      if (!/^(?=.*[^A-Za-z\d]).+$/.test(value))
        return helpers.error("any.custom", {
          message:
            "Password must contain at least one symbol (e.g. !, @, #, $, %)",
        });

      return value;
    })
    .messages({ "any.custom": "{{#message}}" }),
  email: Joi.string().email().required().min(6),
});

// profile update validation schema
export const profileUpdate = Joi.object({
  fullName: Joi.string().min(3),
  phone: Joi.string().min(11),
  age: Joi.number().min(14),
});
