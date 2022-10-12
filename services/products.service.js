const db = require("../shared/db.connect");
const { ObjectId } = require("mongodb");
const { productValid, contactName } = require("../shared/validation");
const { getTokenDetails, dateTime } = require("../shared/utils");
const path = require("path");
const formidable = require("formidable");
const fs = require("fs");

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage }).single("file");

// const storage = multer.diskStorage({
//     destination: "./public/img/",
//     filename: function(req, file, cb){
//        cb(null,"img-" + path.extname(file.originalname));
//     }
//  });

//  const upload = multer({
//     storage: storage,
//     limits:{fileSize: 1000000},
//  }).single("prod-img");

const services = {
  async addProduct(req, res) {
    console.log("add product called");
    try {
      const { error, value } = productValid.validate(req.body);
      if (error)
        return res.status(400).send({
          error: "Validation error",
          message: error.details[0].message,
        });
      const {
        user: { _id },
      } = getTokenDetails(req.headers.auth);
      const product = await db.products.findOne({
        name: value.name,
        userId: _id,
      });
      if (product) return res.status(400).send("Product already exists");
      const data = await db.products.insertOne({
        ...value,
        userId: _id,
        createdAt: dateTime,
      });
      return res.status(200).send("Product created");
    } catch (err) {
      console.log(`Error adding ${err}`);
    }
  },

  async deleteProduct(req, res) {
    const {
      user: { _id },
    } = getTokenDetails(req.headers.auth);
    try {
      const id = req.params.id;
      const data = await db.products.deleteOne({
        _id: ObjectId(id),
        userId: _id,
      });
      return res.status(200).send(data);
    } catch (err) {
      console.log(`Error deleting product ${err}`);
    }
  },

  async updateProduct(req, res) {
    const {
      user: { _id },
    } = getTokenDetails(req.headers.auth);
    try {
      const { error, value } = productValid.validate(req.body);
      if (error)
        return res.status(400).send({
          error: "Va;idation failed",
          message: error.details[0].message,
        });
      const id = req.params.id;
      const isExists = await db.products.findOne({
        name: value.name,
        userId: _id,
      });
      if (isExists._id != id)
        return res.status(400).send("Product already exists");
      const data = await db.products.findOneAndUpdate(
        { _id: ObjectId(id), userId: _id },
        { $set: value },
        { returnNewDocument: true }
      );
      return res.status(200).send(data);
    } catch (err) {
      console.log(`Error updating product ${err}`);
    }
  },

  async getProducts(req, res) {
    // const {user:{_id,email}}=getTokenDetails(req.headers.auth);
    try {
      const data = await db.products
        .find(
          {},
          {
            projection: {
              _id: 1,
              name: 1,
              price: 1,
              salePrice: 1,
              stock: 1,
              tax: 1,
              hsn: 1,
              description: 1,
              assured: 1,
              deliveryCharge: 1,
              img: 1,
              bulletPoints: 1,
              createdAt: 1,
            },
          }
        )
        .toArray();
      res.status(200).send(data);
    } catch (err) {
      console.log(`Error getting product ${err}`);
    }
  },

  async getProductIdByName(req, res) {
    //const {user:{_id}}=getTokenDetails(req.headers.auth);
    try {
      const { error, value } = contactName.validate(req.body);
      if (error)
        return res.status(400).send({
          error: "Validation error",
          message: error.details[0].message,
        });
      //const data= await db.products.findOne({name:value.name,userId:_id},{projection:{_id:1}});
      const data = await db.products.findOne(
        { name: value.name },
        { projection: { _id: 1 } }
      );
      res.status(200).send(data);
    } catch (err) {
      console.log(`Error getting product name by id : ${err}`);
    }
  },

  async getProductsNameOnly(req, res) {
    const {
      user: { _id },
    } = getTokenDetails(req.headers.auth);
    try {
      const data = await db.products
        .find({ userId: _id }, { projection: { _id: 0, name: 1 } })
        .toArray();
      return res.status(200).send(data);
    } catch (err) {
      console.log(`Error gettings product name only ${err}`);
    }
  },

  async getProductById(req, res) {
    //const {user:{_id}}=getTokenDetails(req.headers.auth);
    try {
      //const data= await db.products.findOne({_id:ObjectId(req.params.id)},{projection:{name:1,price:1,stock:1,hsn:1,tax:1}});
      const data = await db.products.findOne({ _id: ObjectId(req.params.id) });
      res.status(200).send(data);
    } catch (err) {
      console.log(`Error getting product by id : ${err}`);
    }
  },

  uploadImg(req, res) {
    upload(req, res, (err) => {
      if (err) {
        res.sendStatus(500);
      }
      res.send(req.file);
    });
  },

  imgSubmit(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      var oldpath = files.filetoupload.filepath;
      var newpath = "../images/" + files.filetoupload.originalFilename;
      fs.rename(oldpath, newpath, function (err) {
        if (err) throw err;
        res.write("File uploaded and moved!");
        res.end();
      });
      // res.write('File uploaded');
      // res.end();
    });
  },
};

module.exports = services;
