const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());

// database mongodb

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jgojmkc.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const productsCollection = client.db("productsDB").collection("products");
    const brandCollection = client.db("productsDB").collection("Brands");
    const cartCollection = client.db("productsDB").collection("cart");

    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/brands", async (req, res) => {
      const cursor = brandCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/products/brand", async (req, res) => {
      const id = req.params.brand;
      const query = { brand: id };
      console.log(id, query);
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    app.get("/products/:brand/:id", async (req, res) => {
      const id = req.params.id;
      const query = { brand: id };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      console.log(newProduct);
      const result = await productsCollection.insertOne(newProduct);
      res.send(result);
    });

    // app.get("/products/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) };
    //   const result = await productsCollection.findOne(query);
    //   res.send(result);
    // });

    app.put(`/products/:brand/:id`, async (req, res) => {
      const brand = req.params.brand;
      const id = req.params.id;
      // const name = req.params.name;
      const filter = { id, brand };
      const options = { upsert: true };
      const updateCoffee = req.body;
      const products = {
        $set: {
          photo: updateCoffee.photo,
          name: updateCoffee.name,
          brand: updateCoffee.brand,
          type: updateCoffee.type,
          price: updateCoffee.price,
          description: updateCoffee.description,
        },
      };
      const result = await productsCollection.updateOne(
        filter,
        products,
        options
      );

      console.log(
        `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`
      );
      res.send(result);
    });

    app.post("/cart", async (req, res) => {
      const newCart = req.body;
      console.log(newCart);
      const result = await cartCollection.insertOne(newCart);
      res.send(result);
    });

    app.get("/cart", async (req, res) => {
      const cursor = cartCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.delete("/cart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(PORT, () => {
  console.log("server is running", PORT);
});
