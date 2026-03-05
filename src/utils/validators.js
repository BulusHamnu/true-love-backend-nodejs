import Joi from "joi";
import { Types } from "mongoose";

/* Password field */
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

/* Email field */
export const emailField = Joi.string()
  .email({ minDomainSegments: 2, tlds: { allow: ["net", "com"] } })
  .required();

/* Resource objectId field */
export const objectIdField = Joi.string()
  .required()
  .custom((value, helpers) => {
    if (!Types.ObjectId.isValid(value)) {
      return helpers.error("id.invalid");
    }
    return value;
  })
  .label("id")
  .messages({
    "id.invalid": "Invalid Id parameter.",
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
  email: emailField,
});

/* Login body schema */
export const loginBodySchema = Joi.object({
  email: emailField,
  password: Joi.string().required(),
});

/* Email and Password body schema */
export const resetPasswordBodySchema = Joi.object({
  email: emailField,
  password: passwordField,
  confirmPassword: Joi.string().required().valid(Joi.ref("password")).messages({
    "any.only": "Confirm password must be the same with password.",
  }),
  resetToken: Joi.string().required().length(32),
});

/* Profile update body schema */
export const profileUpdateBodySchema = Joi.object({
  fullName: Joi.string().min(3).optional(),
  phone: Joi.string().min(11).optional(),
  age: Joi.number().min(14).optional(),
});

/* Checkoutbody schema */
export const checkoutBodySchema = Joi.object({
  product: Joi.string()
    .required()
    .valid("self-guided-program", "coaching-program")
    .messages({
      "any.only": "Product must be Self-guided-program or coaching-program",
    }),
  newDoor: Joi.boolean().optional().default(false),
});
