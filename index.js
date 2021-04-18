const express = require("express");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const app = express();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1ibnm.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const serviceCollection = client
    .db(process.env.DB_NAME)
    .collection("services");
  const reviewCollection = client.db(process.env.DB_NAME).collection("reviews");
  const adminCollection = client.db(process.env.DB_NAME).collection("admins");
  const orderCollection = client.db(process.env.DB_NAME).collection("orders");
  const teamCollection = client.db(process.env.DB_NAME).collection("teams");

  // Add Order
  app.post("/placeOrder", (req, res) => {
    const order = req.body;
    orderCollection
      .insertOne(order)
      .then((result) => res.send(result.insertedCount > 0));
  });
  // Get Order By Email
  app.get("/clientOrders", (req, res) => {
    const email = req.query.email;
    orderCollection.find({ email }).toArray((err, collection) => {
      res.send(collection);
    });
  });
  // Get All Order
  app.get("/orders", (req, res) => {
    orderCollection.find({}).toArray((err, collection) => res.send(collection));
  });
  // Update Order Status
  app.patch("/updateOrder/:id", (req, res) => {
    orderCollection
      .updateOne(
        { _id: ObjectId(req.params.id) },
        {
          $set: {
            status: req.body.status,
          },
        }
      )
      .then((result) => res.send(result.modifiedCount > 0));
  });
  // Add Admin
  app.get("/addAdmin", (req, res) => {
    const email = req.query.email;
    adminCollection.insertOne({ email }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
  // Get Admin
  app.get("/isAdmin", (req, res) => {
    const email = req.query.email;
    adminCollection.find({ email }).toArray((err, collection) => {
      res.send(collection.length > 0);
    });
  });

  // Add Service
  app.post("/addService", (req, res) => {
    const service = req.body;
    serviceCollection
      .insertOne(service)
      .then((result) => res.send(result.insertedCount > 0));
  });
  // Get All Service
  app.get("/services", (req, res) => {
    serviceCollection
      .find({})
      .toArray((err, collection) => res.send(collection));
  });
  // Get Service By Id
  app.get("/service/:id", (req, res) => {
    serviceCollection
      .find({ _id: ObjectId(req.params.id) })
      .toArray((err, collection) => res.send(collection));
  });
  // Get Default Service
  app.get("/defaultService", (req, res) => {
    serviceCollection
      .find({})
      .limit(1)
      .toArray((err, collection) => res.send(collection));
  });
  // Delete Service
  app.delete("/deleteService/:id", (req, res) => {
    serviceCollection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => res.send(result.deletedCount > 0));
  });
  // Add Review
  app.post("/addReview", (req, res) => {
    const review = req.body;
    reviewCollection
      .insertOne(review)
      .then((result) => res.send(result.insertedCount > 0));
  });

  // Get All Review
  app.get("/reviews", (req, res) => {
    reviewCollection
      .find({})
      .toArray((err, collection) => res.send(collection));
  });
  // Get All Team Members
  app.get("/teams", (req, res) => {
    teamCollection.find({}).toArray((err, collection) => res.send(collection));
  });
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`App listening at Port:${port}`);
});
