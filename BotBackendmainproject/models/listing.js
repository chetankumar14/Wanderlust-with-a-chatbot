const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title:{
        type:String,
        required:true,
    },
    description:String,
    image:{ 
        filename:String,
        url:{
        type:String,
        default:"https://images.unsplash.com/photo-1769425105570-b47c0b235933?q=80&w=372&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        set:(v)=> v === "" ? "https://images.unsplash.com/photo-1769425105570-b47c0b235933?q=80&w=372&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" : v,
        }
    },
    price:Number,
    location:String,
    country:String,
});

const listing = mongoose.model('listing',listingSchema);
module.exports = listing;