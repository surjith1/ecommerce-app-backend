const db = require("../shared/db.connect");
const {
  addOrder,
  deleteOrder,
  updateOrder,
  getOrdersByType,
} = require("../shared/validation");
const { dateTime, getTokenDetails } = require("../shared/utils");
const { ObjectId } = require("mongodb");
const dotenv = require("dotenv").config();
const razorpay = require("razorpay");
const crypto = require("crypto");

const events = {
  async addOrder(req, res) {
    try {
      //validate data
      console.log(req.body);
      const { error, value } = addOrder.validate(req.body);
      if (error)
        return res.status(400).send({
          error: "Validation failed",
          message: error.details[0].message,
        });
      //const {user:{_id}}=getTokenDetails(req.headers.auth);
      //check if same invoice no exists
      //const order= await db.orders.find({no:value.no,userId:_id}).toArray();
      //if(order.length>0) return res.status(200).send('An order already exists in the same no');
      // else {
      //const data= await db.orders.insertOne({...value,createdAt:dateTime,userId:_id});
      const data = await db.orders.insertOne({ ...value, createdAt: dateTime });
      return res.status(200).send(data);
      //}
    } catch (err) {
      console.log(`Add order error ${err}`);
    }
  },

  async deleteOrder(req, res) {
    try {
      const { error, value } = deleteOrder.validate({ id: req.params.id });
      if (error)
        return res.status(400).send({
          error: "Validation failed",
          message: error.details[0].message,
        });
      const {
        user: { _id },
      } = getTokenDetails(req.headers.auth);
      const data = await db.orders.deleteOne({
        _id: ObjectId(value.id),
        userId: _id,
      });
      res.status(200).send(data);
    } catch (err) {
      console.log(err);
    }
  },

  async updateOrder(req, res) {
    try {
      const id = req.params.id;
      const { error, value } = updateOrder.validate(req.body);
      if (error)
        return res.status(400).send({
          error: "Validation failed",
          message: error.details[0].message,
        });
      const {
        user: { _id },
      } = getTokenDetails(req.headers.auth);
      const data = await db.orders.findOneAndUpdate(
        { _id: ObjectId(id), userId: _id },
        { $set: { ...value } }
      );
      return res.status(200).send(data);
    } catch (err) {
      console.log(`Error updating ${err}`);
    }
  },

  async getOrders(req, res) {
    const {
      user: { _id },
    } = getTokenDetails(req.headers.auth);
    try {
      const orders = await db.orders.find({ userId: _id }).toArray();
      return res.status(200).send(orders);
    } catch (err) {
      console.log(`Error getting orders ${err}`);
    }
  },

  async getOrderByNo(req, res) {
    console.log("order by no called");
    const orderNo = req.params.no;
    const {
      user: { _id },
    } = getTokenDetails(req.headers.auth);
    console.log(orderNo, _id);
    try {
      const orders = await db.orders.findOne({
        no: parseInt(orderNo),
        userId: _id,
      });
      console.log("orders", orders);
      return res.status(200).send(orders);
    } catch (err) {
      console.log(`Error getting order ${err}`);
    }
  },

  async getOrderById(req, res) {
    console.log("get order by Id called");
    const id = req.params.id;
    const {
      user: { _id },
    } = getTokenDetails(req.headers.auth);
    console.log(id);
    try {
      const orders = await db.orders.findOne(
        { _id: ObjectId(id), userId: _id },
        { _id: 0, userId: 0 }
      );
      console.log("orders", orders);
      return res.status(200).send(orders);
    } catch (err) {
      console.log(`Error getting orders ${err}`);
    }
  },

  async getOrdersByType(req, res) {
    try {
      const { error, value } = getOrdersByType.validate({
        type: req.params.type,
      });
      if (error)
        return res.status(400).send({
          error: "Validation error",
          message: error.details[0].message,
        });
      const {
        user: { _id },
      } = getTokenDetails(req.headers.auth);
      const data = await db.orders
        .find({ type: value.type, userId: _id })
        .sort({ date: 1 })
        .toArray();
      return res.status(200).send(data);
    } catch (err) {
      console.log(`Get events by type error: ${err}`);
    }
  },

  async getOrdersByMonth(req, res) {
    try {
      // const {error,value}= getEventsByType.validate({type:req.params.type});
      // if(error) return res.status(400).send({
      //     error:'Validation error',
      //     message:error.details[0].message,
      //     })
      const {
        user: { _id },
      } = getTokenDetails(req.headers.auth);
      const data = await db.orders
        .find({ userId: _id })
        .sort({ date: 1 })
        .toArray();
      return res.status(200).send(data);
    } catch (err) {
      console.log(`Get events by type error: ${err}`);
    }
  },

  async statusUpdate(req, res) {
    const {
      user: { _id },
    } = getTokenDetails(req.headers.auth);
    try {
      const data = await db.orders.findOneAndUpdate(
        { _id: ObjectId(req.query.id), userId: _id },
        { $set: { status: req.query.status } }
      );
      console.log(data);
      return res.status(200).send("Updated order status");
    } catch (err) {
      console.log(`Error updating order status ${err}`);
    }
  },

  async cancelOrder(req, res) {
    const {
      user: { _id },
    } = getTokenDetails(req.headers.auth);
    try {
      const data = await db.orders.findOneAndUpdate(
        { _id: ObjectId(req.params.id), userId: _id },
        { $set: { status: "Cancelled" } }
      );
      console.log(data);
      return res.status(200).send("Cancel order");
    } catch (err) {
      console.log(`Error cancelling order ${err}`);
    }
  },

  async getOrderNo(req, res) {
    try {
      const {
        user: { _id },
      } = getTokenDetails(req.headers.auth);
      const data = await db.orders
        .find({ userId: _id })
        .sort({ no: -1 })
        .limit(1)
        .toArray();
      console.log(data);
      return res.status(200).send(data);
    } catch (err) {
      console.log(`Get order no error: ${err}`);
    }
  },

  async createOrder(req, res) {
    try {
      const instance = new razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_SECRET,
      });

      const options = {
        amount: req.body.amount,
        currency: "INR",
        receipt: "receipt#" + Date.now(),
      };

      const order = await instance.orders.create(options);
      if (!order) return res.status(500).send(order);
      else return res.status(200).send(order);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  },

  async verifyPayment(req, res) {
    try {
      const {
        orderCreationId,
        razorpayPaymentId,
        razorpayOrderId,
        razorpaySignature,
      } = req.body;

      const shasum = crypto.createHmac("sha256", "w2lBtgmeuDUfnJVp43UpcaiT");
      shasum.update(`${orderCreationId}|${razorpayPaymentId}`);

      const digest = shasum.digest("hex");
      if (digest !== razorpaySignature)
        //return res.status(400).json({ msg: "Transaction not legit!" });
        return res.json({
          msg: "success",
          orderId: razorpayOrderId,
          paymentId: razorpayPaymentId,
        });
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },
};

module.exports = events;
