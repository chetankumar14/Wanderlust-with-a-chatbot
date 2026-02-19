    require("dotenv").config();
    const express = require('express');
    const app = express();
    const mongoose = require('mongoose');
    const Listing = require('./models/listing.js');
    const path = require('path');
    const methodOverride = require('method-override');
    const ejsMate = require('ejs-mate');
    const wrapAsync = require('./utils/wrapAsync.js');
    const ExpressError = require('./utils/ExpressError.js');
    const {listingSchema} = require('./schema.js');
    const chatRoutes = require("./routes/chat");


app.use(express.json());
app.use("/chat", chatRoutes);


    const port = 8080;

    MONGOURL = "mongodb://127.0.0.1:27017/wanderlust";

    main().then(()=>{
        console.log("Connected to wanderlustDB");
    }).catch((err)=>{
        console.log(err);
    })

    async function main(){
        await mongoose.connect(MONGOURL);
    }

    app.set("view engine","ejs");
    app.set("views",path.join(__dirname,"views"));
    app.use(express.urlencoded({extended:true}));
    app.use(methodOverride('_method'));
    app.engine("ejs",ejsMate);
    app.use(express.static(path.join(__dirname,"/public")));

    app.get("/",(req,res)=>{
        res.send("Hi,I am root")
    });

    const validateListing = (req,res,next) => {
        let {error} = listingSchema.validate(req.body);
        // console.log(error);
        if(error){
            let errMsg = error.details.map((el) => el.message).join(",");
            throw new ExpressError(400,errMsg);
        } else{
            next();
        }
    }

    //INDEX ROUTE ===
    app.get("/listings",wrapAsync(async (req,res)=>{
        const allListings = await Listing.find({});
        res.render("listings/index.ejs",{allListings});
    }));


    //NEW ROUTE === 
    app.get("/listings/new",(req,res)=>{
        res.render("listings/new.ejs");
    })


    //SHOW ROUTE ===
    app.get("/listings/:id",wrapAsync(async (req,res)=>{
        let {id} = req.params;
        const listing = await Listing.findById(id);
        res.render("listings/show.ejs",{listing});
    }));


    //CREATE ROUTE ===
    app.post("/listings",validateListing,wrapAsync(async (req,res)=>{
        // console.log(!req.body.listing);
        //  if(!req.body.listing){
        //     throw new ExpressError(400,"Send Valid data for Listing");
        // }
        //let {title,description,price,location,country} = req.body;

        //let listing = req.body
        //let listing = req.body.listing;
        //let Listing(listing);

        /////////////////////////////////////
        // let result = listingSchema.validate(req.body);
        // if(result.error){
        //     throw new ExpressError(400,"result.err");
        // }
        // console.log(result);
        ////////////////////////////////////////////

        const newListing = new Listing(req.body.listing);

        //if a field is missing
        // if(!newListing.description){
        //     throw new ExpressError(400,"Description is missing");
        // }
        //   if(!newListing.title){
        //     throw new ExpressError(400,"Title is missing");
        // }
        //   if(!newListing.location){
        //     throw new ExpressError(400,"Location is missing");
        // }
        //   if(!newListing.country){
        //     throw new ExpressError(400,"Country is missing");
        // }
        //   if(!newListing.price){
        //     throw new ExpressError(400,"Price is missing");
        // }


        await newListing.save();
        res.redirect("/listings");
    }));


    //EDIT ROUTE ===
    app.get("/listings/:id/edit",wrapAsync(async (req,res)=>{
        let {id} = req.params;
        const listing = await Listing.findById(id);
        res.render("listings/edit.ejs",{listing});
    }));


    //UPDATE ROUTE ===
    app.put("/listings/:id",validateListing,wrapAsync(async (req,res)=>{
         if(!req.body.listing){
            throw new ExpressError(400,"Send Valid data for Listing");
        }
        let {id} = req.params;
        await Listing.findByIdAndUpdate(id,{...req.body.listing});
        res.redirect(`/listings/${id}`);

    }));


    //DELETE ROUTE ===
    app.delete("/listings/:id",wrapAsync(async (req,res)=>{
        let {id} = req.params;
        let deletedListing =await Listing.findByIdAndDelete(id);
        console.log(deletedListing);
        res.redirect("/listings")
    }));

    // //NEW ROUTE === 
    // app.get("/listings/new",(req,res)=>{  //in here listings/new == listings/id
    //     res.render("listings/new.ejs");  //new == id
    // })


    // app.get("/testlistings",(req,res)=>{
    //     let sampleListing = new listing({
    //         title:"My New Villa",
    //         description:"By the beach",
    //         price:1200,
    //         location:"Calangute,Goa",
    //         country:"India"
    //     });

    //     sampleListing.save();
    //     console.log("Sample was saved");
    //     res.send("Successful testing")
    // });


    //MIDDLEWARE

    // 404 handler (must be AFTER all routes)
    app.use((req,res,next)=>{
        next(new ExpressError(404,"Page Not Found"));
    })

    app.use((err,req,res,next) =>{
        let {statusCode =500,message = "Something Went Wrong"} = err;
        // res.status(statusCode).send(message);
        res.status(statusCode).render("error.ejs",{err});
    });

    app.listen(port,()=>{
        console.log(`Server is running on port ${port}`);
    });

