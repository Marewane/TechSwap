const db = require('mongoose');


const connectDB = async ()=>{
    try {
        const conn = await db.connect(process.env.MONGO_URI);
        console.log('this is conn : ',conn.connection.host);
    } catch (error) {
        console.log('error during connection to database : ',error.message)
    }
}

module.exports = connectDB;