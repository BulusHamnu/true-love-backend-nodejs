import Joi from "joi";

const passwordField = Joi.string()
  .required()
  .min(6)
  .pattern(
    new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$"),
  )
  .messages({
    "string.pattern.base":
      "Password must contain an uppercase, a number, letter and symbols.",
    "string.min": "Password is too short.",
  });

/* Signup body schema */
export const signupSchema = Joi.object({
  fullName: Joi.string().required().min(3),
  phone: Joi.string().min(11).optional().default(""),
  age: Joi.number().min(14).default(""),
  password: passwordField,
  confirmPassword: Joi.string().required().valid(Joi.ref("password")).messages({
    "any.only": "Confirm password must be the same with password.",
  }),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["net", "com"] } })
    .required(),
});

/* Email and Password body schema */
export const emailAndPasswordSchema = Joi.object({
  password: passwordField,
  email: Joi.string().email().required().min(6),
});

/* Profile update body schema */
export const profileUpdate = Joi.object({
  fullName: Joi.string().min(3).optional(),
  phone: Joi.string().min(11).optional(),
  age: Joi.number().min(14).optional(),
});

/* Self-guided body schema */
export const selfGuidedValidator = Joi.object({
  programProgress: Joi.object({
    currentWeek: Joi.number().min(0).max(6).messages({
      "number.min": "Week cannot be less than 0",
      "number.max": "Week cannot be greater than 6",
    }),
  }),
}).min(1);
