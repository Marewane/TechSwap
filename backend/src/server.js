const dotenv =  require('dotenv');
const connectDB = require('./config/db');



dotenv.config();
connectDB();

const app = require('./app');
app.listen(process.env.PORT,()=>{
    console.log('app start listening on port ', process.env.PORT);
    
})


