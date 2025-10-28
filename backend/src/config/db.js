const db = require('mongoose');


const connectDB = async ()=>{
    try {
        const conn = await db.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        process.exit(1);
    }
}

module.exports = connectDB;