const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const _ = require("lodash");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express()
app.set('view engine','ejs')
app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: true}))
app.set('trust proxy', 1)

app.use(session({
    secret: 'Hacker Bash',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

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
//----------------------------------------------passport initialization----------------------------------------

userSchema.plugin(passportLocalMongoose);


const User = mongoose.model("user",userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// ---------------------------------------itemschema and database creation ---------------------------------------------------------------------------
const itemSchema = new mongoose.Schema({
    name : String,
    stock : Number,
    price : Number,
    discount : Number
});

const item = mongoose.model("item",itemSchema)

const finalItemSchema = new mongoose.Schema({
    username: String,
    items : [itemSchema]
});

const finalitem = mongoose.model("finalitem",finalItemSchema);

//--------------------------------------serviceschema and database creation-----------------------------------------

const serviceSchema = new mongoose.Schema({
    serviceprovider : String,
    Name : String,
    Price : Number,
    discount : Number 
});

const finalServiceSchema = new mongoose.Schema({
    shopname: String,
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

//-----------------------------------  logschema and database creation  ---------------------------------------------

const logSchema = new mongoose.Schema({
    previousbills : [finalBillSchema] 
}); 

const log = mongoose.model("log",logSchema); 

//------------------------------------------  hardcoded data   ---------------------------------------------------------
item1 = new item({
    name:"kamal",
    stock:20,
    price:25.5,
    discount: 5
})

item2 = new item({
    name:"kamal",
    stock:20,
    price:25.5,
    discount: 5
})

item3 = new item({
    name:"kamal",
    stock:20,
    price:25.5,
    discount: 5
})

item4 = new item({
    name:"kamal",
    stock:20,
    price:25.5,
    discount: 5
})

defaultItems = [item1,item2,item3,item4]







//------------------------------------    landing page   -----------------------------------------------------
app.get("/",function(req,res){
    res.render("landing")
})

app.get("/additems",function(req,res){
   finalItem2  = new finalitem({
       shopname : "kamal",
       items: defaultItems 
   })
   finalItem2.save()

   res.send("itemsss savedd")
})


  
//--------------------------------------   signin route    ----------------------------------------------------------
app.get("/login",function(req,res){
    res.render("signin")
})
//--------------------------------------    singing in        ---------------------------------------------
app.post("/login",function(req,res){
    const user = new User({
      username : req.body.username,
      password : req.body.password
    });
  
  
  
    req.login(user,function(err){
  
      if(err){
        console.log(err);
      }else{
        passport.authenticate("local")(req,res,function(){
  
          res.redirect("/");
        })
      }
    })
});



//----------------------------------------   signup route    ----------------------------------------------------------
app.get("/signup",function(req,res){
    res.render("signup")

})

//--------------------------------------  authenticating and creating a user  ---------------------------------------
app.post("/signup",function(req,res){
    User.register({username: req.body.username},req.body.password,function(err,user){
      if(err){
        console.log(err);
        res.redirect("/signup");
      }else{
        passport.authenticate("local")(req,res,function(){
          User.findOneAndUpdate({username:user.username},{$set:{name : req.body.name , shopname : req.body.shopname ,Address: req.body.address,contactno: req.body.txtEmpPhone, email : req.body.email}},function(err){
            if(err){
              console.log(err);
            }else{
                
            }
          });
          finalItem2  = new finalitem({
            username : req.body.username 
            })
            finalItem2.save()
     

          res.redirect("/");
        })
      }
    });
  });

//----------------------------------------    items page route     -----------------------------------------------------------
app.get("/items",function(req,res){
    finalitem.findOne({username:req.user.username},function(err,founditem){
        if(err){
            console.log(err)
        }else{
            if(founditem){
                res.render("item",{items: founditem.items})
            }else{
                console.log("no item found")
            }
        }
    })
})

//----------------------------------      post on items route ---------------------------------------------
app.post("/item",function(req,res){
    if(req.isAuthenticated()){
        newItem = new item({
            name : req.body.name,
            stock : req.body.stock,
            price : req.body.price,
            discount : req.body.discount
        })
        
        finalitem.findOne({username:req.user.username},function(err,founditem){
            if(err){
                console.log(err)
            }else{
                if(founditem){
                    founditem.items.push(newItem)
                    founditem.save()
                }else{
                    console.log("no item found")
                }
            }
        })
        res.redirect("/items")
    }
    


})

//------------------------------- delete an item -------------------------------------------------------
app.post("/delItem",function(req,res){
    const deleteId = req.body.delete
    finalitem.findOneAndUpdate({username: req.user.username},{$pull: {items: {_id : deleteId }}},function(err,foundItem){
        if(!err){
          res.redirect("/items");
        }
      })})

//-----------------------------------------   create bill route    -------------------------------------------------------

app.get("/createbill",function(req,res){
    res.render("createbill")
    // finalitem.findOne({username : req.user.username} , function(err,founditem){
    //     if(err){
    //         console.log(err)
    //     }else{
    //         if(founditem){
    //             res.render("createbill",{items:founditem.items})

    //         }else{
    //             console.log("no item found")
    //         }
    //     }
    // })
})
//------------------------------ bill details section ---------------------------------------------------
app.post("/itemDet",function(req,res){
    finalitem.findOne({username:req.user.username},function(err,foundItem){
        if(err){
            console.log(err)
        }else{
            console.log(foundItem)
        }
    })
})




app.listen(3000,function(){
    console.log("server has started")
})



