const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');
const Joi = require('joi');
var favicon = require('serve-favicon')
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')



const db = require("./db");
const collection_clubs = "clubs";
const collection_user = "users"
const app = express();
app.use(favicon(path.join(__dirname, 'favicon.ico')))

app.use(cors())
// schema used for data validation for our todo document
// const schema = Joi.object().keys({
//     todo : Joi.string().required()
// });

// var Users = require('./routes/Users')

// app.use('/users', Users)

// parses json data sent to us by the user 
app.use(bodyParser.json());

// serve static html file to user
// app.get('/',(req,res)=>{
//     res.sendFile(path.join(__dirname,'index.html'));
// });

// read
app.get('/clubs',(req,res)=>{
    // get all clubs documents within our clubs collection
    // send back to user as json
    db.getDB().collection(collection_clubs).find({}).toArray((err,documents)=>{
        if(err)
            console.log(err);
        else{
            res.json(documents);
        }
    });
});

// get specific club info 

app.get('/clubs/:id', (req, res) => {
    // Primary Key of Todo Document we wish to update
    const clubID = req.params.id;
    // Document used to update
    const userInput = req.body;
    // Find Document By ID and Update
    // console.log(userInput);
    db.getDB().collection(collection_clubs).findOne({ _id: db.getPrimaryKey(clubID) }, (err, result) => {
        if (err)
            console.log(err);
        else {
            res.json(result);
        }
    });
});


// update
app.put('/clubs/:id',(req,res)=>{
    // Primary Key of Todo Document we wish to update
    const clubID = req.params.id;
    // Document used to update
    const userInput = req.body;
    // Find Document By ID and Update
    // console.log(userInput);
    db.getDB().collection(collection_clubs).findOneAndUpdate({_id : db.getPrimaryKey(clubID)},{$set : userInput},{returnOriginal : false},(err,result)=>{
        if(err)
            console.log(err);
        else{
            res.json(result);
        }      
    });
});

//create
app.post('/clubs',(req,res,next)=>{
    // Document to be inserted
    const userInput = req.body;

    // Validate document
    // If document is invalid pass to error middleware
    // else insert document within todo collection
    db.getDB().collection(collection_clubs).insertOne(userInput, (err, result) => {
        if (err) {
            const error = new Error("Failed to insert clubs Document");
            error.status = 400;
            next(error);
        }
        else
            res.json({ result: result, document: result.ops[0], msg: "Successfully inserted clubs!!!", error: null });
    });  
});

// Favorite post new user

app.post('/fav',(req,res)=>{
    // Document used to update
    const userInput = req.body;
    // console.log(userInput);
    db.getDB().collection('fav').insertOne(userInput, (err, result)=>{
        if(err)
            console.log(err);
        else{
            res.json(result);
        }      
    });
});


// Favorite get user fav list

app.get('/fav/:id', (req, res) => {
    // Primary Key of Todo Document we wish to update
    const userID = req.params.id;
    // Document used to update
    const userInput = req.body;
    // Find Document By ID and Update
    // console.log(userInput);
    db.getDB().collection('fav').findOne({ _id: userID }, (err, result) => {
        if (err)
            console.log(err);
        else {
            res.json(result);
        }
    });
});

// Favorite update
app.put('/fav/:id',(req,res)=>{
    // Primary Key of Todo Document we wish to update
    const userID = req.params.id;
    // Document used to update
    const userInput = req.body;
    // Find Document By ID and Update
    // console.log(userInput);
    db.getDB().collection('fav').findOneAndUpdate({_id : userID},{$set : userInput},{returnOriginal : false},(err,result)=>{
        if(err)
            console.log(err);
        else{
            res.json(result);
        }      
    });
});

// Booking new 
app.post('/booking',(req,res,next)=>{
  // Document to be inserted
  const userInput = req.body;

  // Validate document
  // If document is invalid pass to error middleware
  // else insert document within todo collection
  db.getDB().collection('booking').insertOne(userInput, (err, result) => {
      if (err) {
          const error = new Error("Failed to insert booking Document");
          error.status = 400;
          next(error);
      }
      else
          res.json({ result: result, document: result.ops[0], msg: "Successfully inserted booking!!!", error: null });
  });  
});

// return booking query
app.post('/book',(req,res)=>{
  // Document to be inserted
  const userInput = req.body;
  // console.log(userInput);
  // Validate document
  // If document is invalid pass to error middleware
  // else insert document within todo collection
  db.getDB().collection('booking').find(userInput).toArray((err,documents)=>{
    if(err)
        console.log(err);
    else{
        res.json(documents);
    }
  });  
});

// Booking update
app.put('/booking/:id',(req,res)=>{
  // Primary Key of Todo Document we wish to update
  const bookID = req.params.id;
  // Document used to update
  const userInput = req.body;
  // Find Document By ID and Update
  // console.log(userInput);
  db.getDB().collection('booking').findOneAndUpdate({_id : db.getPrimaryKey(bookID)},{$set : userInput},{returnOriginal : false},(err,result)=>{
      if(err)
          console.log(err);
      else{
          res.json(result);
      }      
  });
});


// TEJA NOTES: NOT NEEDED
app.delete('/clubs/:id',(req,res)=>{
    // Primary Key of Todo Document
    const clubID = req.params.id;
    // Find Document By ID and delete document from record
    db.getDB().collection(collection_clubs).findOneAndDelete({_id : db.getPrimaryKey(clubID)},(err,result)=>{
        if(err)
            console.log(err);
        else
            res.json(result);
    });
});

// users
process.env.SECRET_KEY = 'secret'

app.post('/users/register', (req, res) => {
    const today = new Date()
    const userData = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      password: req.body.password,
      created: today,
      membership_type: req.body.membership_type,
      isAdmin: req.body.isAdmin
    }
  
    db.getDB().collection(collection_user).findOne({
      email: req.body.email
    })
      .then(user => {
        if (!user) {
          bcrypt.hash(req.body.password, 10, (err, hash) => {
            userData.password = hash
            db.getDB().collection(collection_user).insertOne(userData)
              .then(user => {
                res.json({ status: user.email + 'Registered!' })
              })
              .catch(err => {
                res.send('error: ' + err)
              })
          })
        } else {
          res.json({ error: 'User already exists' })
        }
      })
      .catch(err => {
        res.send('error: ' + err)
      })
  })

  
  app.post('/users/login', (req, res) => {
    db.getDB().collection(collection_user).findOne({
    email: req.body.email
  })
    .then(user => {
      if (user) {
        if (bcrypt.compareSync(req.body.password, user.password)) {
          // Passwords match
          const payload = {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            isAdmin: user.isAdmin
          }
          let token = jwt.sign(payload, process.env.SECRET_KEY, {
            expiresIn: 1440
          })
          res.send(token)
        } else {
          // Passwords don't match
          res.send(401, 'missing authorization header');
        }
      } else {
        res.send(401, 'missing authorization header');
      }
    })
    .catch(err => {
      res.send('error: ' + err)
    })
})

app.get('/users/profile', (req, res) => {
    var decoded = jwt.verify(req.headers['authorization'], process.env.SECRET_KEY)
  
    db.getDB().collection(collection_user).findOne({
      _id: decoded._id
    })
      .then(user => {
        if (user) {
          res.json(user)
        } else {
          res.send('dfghj')
        }
      })
      .catch(err => {
        res.send('error: ' + err)
      })
  })

  app.get('/users/userdetails',(req,res)=>{
    db.getDB().collection(collection_user).find({}).toArray((err,documents)=>{
        if(err)
            console.log(err);
        else{
            res.json(documents);
        }
    });
});
  

// Middleware for handling Error
// Sends Error Response Back to User
app.use((err,req,res,next)=>{
    res.status(err.status).json({
        error : {
            message : err.message
        }
    });
})


db.connect((err)=>{
    // If err unable to connect to database
    // End application
    if(err){
        console.log('unable to connect to database');
        process.exit(1);
    }
    // Successfully connected to database
    // Start up our Express Application
    // And listen for Request
    else{
        app.listen(3000,()=>{
            console.log('connected to database, app listening on port 3000');
        });
    }
});

