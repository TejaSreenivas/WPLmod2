const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');
const Joi = require('joi');

const db = require("./db");
const collection = "clubs";
const app = express();

// schema used for data validation for our todo document
// const schema = Joi.object().keys({
//     todo : Joi.string().required()
// });

// parses json data sent to us by the user 
app.use(bodyParser.json());

// serve static html file to user
app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'index.html'));
});

// read
app.get('/clubs',(req,res)=>{
    // get all Todo documents within our todo collection
    // send back to user as json
    db.getDB().collection(collection).find({}).toArray((err,documents)=>{
        if(err)
            console.log(err);
        else{
            res.json(documents);
        }
    });
});

// get specific club info 

app.get('/:id', (req, res) => {
    // Primary Key of Todo Document we wish to update
    const clubID = req.params.id;
    // Document used to update
    const userInput = req.body;
    // Find Document By ID and Update
    // console.log(userInput);
    db.getDB().collection(collection).findOne({ _id: db.getPrimaryKey(clubID) }, (err, result) => {
        if (err)
            console.log(err);
        else {
            res.json(result);
        }
    });
});


// update
app.put('/:id',(req,res)=>{
    // Primary Key of Todo Document we wish to update
    const clubID = req.params.id;
    // Document used to update
    const userInput = req.body;
    // Find Document By ID and Update
    console.log(userInput);
    db.getDB().collection(collection).findOneAndUpdate({_id : db.getPrimaryKey(clubID)},{$set : userInput},{returnOriginal : false},(err,result)=>{
        if(err)
            console.log(err);
        else{
            res.json(result);
        }      
    });
});




//create
app.post('/',(req,res,next)=>{
    // Document to be inserted
    const userInput = req.body;

    // Validate document
    // If document is invalid pass to error middleware
    // else insert document within todo collection
    db.getDB().collection(collection).insertOne(userInput, (err, result) => {
        if (err) {
            const error = new Error("Failed to insert clubs Document");
            error.status = 400;
            next(error);
        }
        else
            res.json({ result: result, document: result.ops[0], msg: "Successfully inserted clubs!!!", error: null });
    });  
});



//delete
app.delete('/:id',(req,res)=>{
    // Primary Key of Todo Document
    const clubID = req.params.id;
    // Find Document By ID and delete document from record
    db.getDB().collection(collection).findOneAndDelete({_id : db.getPrimaryKey(clubID)},(err,result)=>{
        if(err)
            console.log(err);
        else
            res.json(result);
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

