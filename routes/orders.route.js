const route = require("express").Router();
const service = require("../services/orders.service");

route.post("/", service.addOrder);
route.delete("/:id", service.deleteOrder);
route.put("/:id", service.updateOrder);
route.get("/", service.getOrders);
route.get("/orderno/:no", service.getOrderByNo);
route.get("/no", service.getOrderNo);
route.get("/id/:id", service.getOrderById);
route.get("/type/:type", service.getOrdersByType);
route.get("/calendar/all", service.getOrdersByMonth);
route.put("/cancel/:id", service.cancelOrder);

route.post("/payment", service.createOrder);
route.post("/payment/success", service.verifyPayment);

module.exports = route;
