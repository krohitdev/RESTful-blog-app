var bodyParser  = require("body-parser"),
methodOverride  = require("method-override"),
expressSantizer = require("express-sanitizer"),
mongoose        = require("mongoose")
express         = require("express"),
app             = express();

//APP CONFIG
mongoose.connect("mongodb://localhost/restful_blog_app",{ useNewUrlParser: true });
app.set("view engine","ejs"); //set ejs as default template 
app.use(express.static("public")); // set public directory
app.use(bodyParser.urlencoded({extended:true})); // take form data
app.use(expressSantizer()); // express sanitizer to prevent user to add script in form data
app.use(methodOverride("_method")); // method override for put request

mongoose.set('useFindAndModify', false);


//MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
})

var Blog = mongoose.model("Blog",blogSchema);

//RESTFUL ROUTES

app.get("/",function(req,res){
    res.redirect("/blogs")
});

app.get("/blogs",function(req,res){
    Blog.find({},function(err,blogs){
        if(err){
            console.log(err)
        }
        else{
            res.render("index", {blogs:blogs});
        }
    });
});

//NEW ROUTE
app.get("/blogs/new",function(req,res){
    res.render("new");
});

//CREATE ROUTE
app.post("/blogs",function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body); //sanitize script
    //create blog
    Blog.create(req.body.blog,function(err,newBlog){
        if(err){
            res.render("new");
        }
        else{
            //then redirect to the index
            res.redirect("/blogs");
        }
    });
});

//SHOW ROUTE
app.get("/blogs/:id",function(req,res){
    Blog.findById(req.params.id, function(err,foundBlog){
        if(err){
            res.redirect("/blogs")
        }
        else{
            res.render("show",{blog: foundBlog});
        }
    });
});

//EDIT ROUTE
app.get("/blogs/:id/edit",function(req,res){
    Blog.findById(req.params.id,function(err,foundBlog){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.render("edit",{blog: foundBlog});
        }
    });
});

//UPDATE ROUTE
app.put("/blogs/:id",function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body); //sanitize script

    Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedBlog){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.redirect("/blogs/"+req.params.id);
        }
    });
});

//DELETE ROUTE
app.delete("/blogs/:id",function(req,res){
    // destroy blog
    Blog.findByIdAndRemove(req.params.id,function(err){
        if(err){
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs");
        }
    });
});

app.listen(3000,function(){
    console.log("server is running");
});