const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing.js');

MONGOURL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(()=>{
    console.log("Connected to wanderlustDB");
}).catch((err)=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(MONGOURL);
}


const initDB = async()=>{
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);
    console.log("Database initialized with initData 30");
}

initDB();