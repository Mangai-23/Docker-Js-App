let express = require('express');
let path = require('path');
let fs = require('fs');
let MongoClient = require('mongodb').MongoClient;
let bodyParser = require('body-parser');
let app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get('/profile-picture', (req, res) => {
  let img = fs.readFileSync(path.join(__dirname, "images/profile-1.jpg"));
  res.writeHead(200, { 'Content-Type': 'image/jpg' });
  res.end(img, 'binary');
});

// Docker MongoDB connection string
let mongoUrlDocker = "mongodb://admin:password@mongodb:27017";

// Database and collection details
let databaseName = "my-db";
let collectionName = "users";

// Endpoint to update profile
app.post('/update-profile', async (req, res) => {
  try {
    let userObj = req.body;
    console.log("Updating profile:", userObj);

    const client = await MongoClient.connect(mongoUrlDocker, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB");

    const db = client.db(databaseName);
    userObj['userid'] = 1;

    const myquery = { userid: 1 };
    const newvalues = { $set: userObj };
    console.log("Updating user with query:", myquery, "values:", newvalues);

    const result = await db.collection(collectionName).updateOne(myquery, newvalues, { upsert: true });
    console.log("Update result:", result);

    await client.close();
    res.send(userObj);
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).send({ error: "Failed to update profile" });
  }
});

// Endpoint to get profile
app.get('/get-profile', async (req, res) => {
  try {
    const client = await MongoClient.connect(mongoUrlDocker, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB");

    const db = client.db(databaseName);
    const myquery = { userid: 1 };

    const result = await db.collection(collectionName).findOne(myquery);
    console.log("Fetched profile:", result);

    await client.close();
    res.send(result || {});
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).send({ error: "Failed to fetch profile" });
  }
});

app.listen(3000, () => {
  console.log("App listening on port 3000!");
});
