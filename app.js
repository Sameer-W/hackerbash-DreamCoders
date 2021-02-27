const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

const app = express()
app.set('view engine','ejs')
app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: true}))

mongoose.connect('mongodb://localhost:27017/HackerBashDB', {useNewUrlParser: true, useUnifiedTopology: true});


// ---------------------------------------userschema and database creation -------------------------------------------------------------------------------
const userSchema =new mongoose.Schema({
    password : String,
    username : String,
    email: String,
    name: String,
    shopname: String,
    Address : String,
    contactno : String
});

const User = mongoose.model("user",userSchema);

// ---------------------------------------itemschema and database creation ---------------------------------------------------------------------------
const itemSchema = new mongoose.Schema({
    name : String,
    stock : Number,
    price : Number,
    discount : Number
});

const finalItemSchema = new mongoose.Schema({
    items : [itemSchema]
});

const item = mongoose.model("item",finalItemSchema);

//--------------------------------------serviceschema and database creation-----------------------------------------

const serviceSchema = new mongoose.Schema({
    serviceprovider : String,
    Name : String,
    Price : Number,
    discount : Number 
});

const finalServiceSchema = new mongoose.Schema({
    services : [serviceSchema]
});

const service = mongoose.model("service",finalServiceSchema);


//------------------------------------billSchema and database creation------------------------------------------------

const itemBillSchema = new mongoose.Schema({
    itemdetails : itemSchema,
    sellquantity : Number
});

const serviceBillSchema = new mongoose.Schema({
    servicedetails : itemSchema,
    sellquantity : Number
});

const finalBillSchema = new mongoose.Schema({
    itemlist : [itemBillSchema],
    serviceList :[serviceBillSchema],  
    Total : Number,
    tax : Number,
    finaltotal : Number,
    Date : Date
});

const bill = mongoose.model("bill",finalBillSchema);

//-----------------------------------logschema and database creation---------------------------------------------

const logSchema = new mongoose.Schema({
    previousbills : [finalBillSchema] 
}); 

const log = mongoose.model("log",logSchema); 




app.get("/",function(req,res){
    res.send("Hi in am kamal")
})



app.listen(3000,function(){
    console.log("server has started")
})



