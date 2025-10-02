const mongoose = require('mongoose');


const sessionSchema = new mongoose.Schema({
    hostId:{
        type:mongoose.Schema.Types.ObjectId
    }
})