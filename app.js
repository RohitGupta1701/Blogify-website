require("dotenv").config();
const path = require('path');
const express = require('express');
const mongoose = require("mongoose");
const cookieParse = require("cookie-parser");

const Blog = require('./models/blog')


const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");

const exp = require('constants');
const { checkForAuthanticationCookie } = require('./middlewares/authantication');


const app = express();
const PORT = process.env.PORT || 8000;

//connection mongooDB
mongoose.connect(process.env.MONGO_URL).then((e) =>{
    console.log("MongoDB Connected")
}).catch(()=>{
    console.log("Can't connected mongoDB.");
})

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

//use Middleware
app.use(express.urlencoded({ extended : false}));
app.use(cookieParse());
app.use(checkForAuthanticationCookie('token'));
app.use(express.static(path.resolve('./public')));


app.get("/", async(req, res)=>{
    const allBlogs = await Blog.find({});
    res.render("home", {
        user : req.user,  
        blogs : allBlogs,
    });
});

app.use('/user', userRoute);
app.use('/blog', blogRoute);

app.listen(PORT, ()=>{
    console.log(`Server is running on PORT. ${PORT}`);
}) 