const express = require("express");
const cors = require("cors");
const db = require("./shared/db.connect");
const env = require("dotenv").config();

const customersRoute = require("./routes/customers.route");
const ordersRoute = require("./routes/orders.route");
const productsRoute = require("./routes/products.route");
const infoRoutes = require("./routes/info.route");
const usersRoute = require("./routes/users.route");

const { authTokenCheck } = require("./shared/auth");

const { dbAddTime } = require("./shared/utils");

const app = express();
const PORT = 3001;

(async () => {
  try {
    await db.connect();

    app.use(
      cors({
        origin: ["http://localhost:3000", "http://localhost:3001"],
      })
    );
    app.use(express.json());

    app.use(express.static("public"));

    //app.use(authTokenCheck);

    app.use("/users", usersRoute);
    app.use("/customers", customersRoute);
    app.use("/products", productsRoute);
    app.use("/orders", ordersRoute);
    app.use("/info", infoRoutes);

    app.listen(process.env.PORT || PORT);
  } catch (err) {
    console.log(`Error: ${err}`);
  }
})();
