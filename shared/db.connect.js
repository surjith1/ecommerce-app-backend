const { MongoClient } = require("mongodb");
const env = require("dotenv").config();

//const DB_URL= 'mongodb://localhost:27017';

const DB_URL = process.env.DB;
const DB_NAME = "ecom-app";

const client = new MongoClient(DB_URL);

module.exports = {
  //db names
  db: null,
  customers: null,
  products: null,
  orders: null,
  users: null,

  //connect to db
  async connect() {
    try {
      client.connect();

      this.db = client.db(DB_NAME);

      this.customers = this.db.collection("customers");
      this.products = this.db.collection("products");
      this.orders = this.db.collection("orders");
      this.users = this.db.collection("users");

      console.log("db ready");
    } catch (err) {
      console.log(`Error connecting to db ${err}`);
    }
  },
};
