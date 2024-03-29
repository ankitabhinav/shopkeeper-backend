require('dotenv').config();
const express = require ('express')
const mongoose =require ('mongoose')
const bodyParser = require ('body-parser');
const registerUserRouter = require('./routes/register');
const productRouter = require('./routes/product');
const variantRouter = require('./routes/variant');
const categoryRouter = require('./routes/category');
const subCategoryRouter = require('./routes/subCategory');
const employeeRouter = require('./routes/employee');
const posCounterRouter = require('./routes/posCounter');
const loginUserRouter = require('./routes/login');
const searchRouter = require('./routes/search');
const orderRouter = require('./routes/order');
const favouriteRouter = require('./routes/favourite');
const cors = require('cors');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(cors());

app.use('/login', loginUserRouter);
app.use('/register',registerUserRouter);
app.use('/product',productRouter);
app.use('/variant',variantRouter);
app.use('/category',categoryRouter);
app.use('/subCategory',subCategoryRouter);
app.use('/employee',employeeRouter);
app.use('/posCounter',posCounterRouter);
app.use('/search',searchRouter);
app.use('/order',orderRouter);
app.use('/favourite',favouriteRouter);

// init mongoose

mongoose.connect( `${process.env.MONGO_URI}`, {useNewUrlParser: true,  useUnifiedTopology: true })
.then(() => console.log("connected successfully"))
.catch((err) => {return console.error("Could not connect:", err)} );

app.get('/', (req,res) => {
    
    res.send('hello this is shopkeeper node js backend');
});


const port=process.env.PORT || 3000

app.listen(port, ()=> console.log(`listning on port ${port}`));