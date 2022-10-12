const Joi = require("joi");

const validate = {
  registerUser: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(16).required(),
    phone: Joi.optional(),
    type: Joi.string().required(),
  }),
  loginUser: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(16).required(),
  }),
  forgotPassword: Joi.object({
    email: Joi.string().email().required(),
  }),
  passwordReset: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(16).required(),
  }),
  addOrder: Joi.object({
    name: Joi.string().required(),
    cartItems: Joi.required(),
    phone: Joi.required(),
    email: Joi.required(),
    address: Joi.required(),
    pincode: Joi.number().required(),
  }),
  deleteOrder: Joi.object({
    id: Joi.string().min(24).max(24).required(),
  }),
  updateOrder: Joi.object({
    no: Joi.required(),
    date: Joi.string().required(),
    customer: Joi.string().required(),
    products: Joi.required(),
    subtotal: Joi.number().required(),
    tax: Joi.required(),
    total: Joi.required(),
    type: Joi.string().required(),
  }),
  getOrdersByType: Joi.object({
    type: Joi.string().min(5).required(),
  }),
  customerValid: Joi.object({
    name: Joi.string().required(),
    phone: Joi.optional(),
    email: Joi.string().email().optional(),
    address: Joi.string().optional(),
    state: Joi.string().required(),
  }),
  productValid: Joi.object({
    name: Joi.string().required(),
    price: Joi.number().optional(),
    salePrice: Joi.number().optional(),
    tax: Joi.number().optional(),
    hsn: Joi.optional(),
    stock: Joi.number().required(),
    deliveryCharge: Joi.number().required(),
    description: Joi.string().optional(),
    bulletPoints: Joi.array().optional(),
    assured: Joi.required(),
    img: Joi.optional(),
  }),
  contactName: Joi.object({
    name: Joi.string().min(1).required(),
  }),
  personalDiary: Joi.object({
    date: Joi.string().required(),
    content: Joi.string().min(10).max(255).required(),
  }),
};

module.exports = validate;
