//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const lodash = require("lodash");
const mongoose = require("mongoose");

const mongoConnectionString = "mongodb+srv://<username>/<password>eyqoobs.mongodb.net/blogDB";
mongoose.connect(mongoConnectionString, function(err){
  if(err){
    console.log("DB connection failed")
  } else{
    console.log("DB Connection established");
  }
});

const postSchema=new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  }
});

const starterSchema=new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true
  }
});


const Post = new mongoose.model("Post", postSchema);
const Starter = new mongoose.model("Starter", starterSchema);

const homeStartingContent = new Starter({
  title: "Home",
  content: "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing."
});

const aboutContent = new Starter({
  title: "About",
  content: "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui."
});

const contactContent = new Starter({
  title: "Contact",
  content: "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero."
});

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.get("/", (req, res) => {
  Starter.find({title:"Home"}, function(err, result){
    if(err){
      console.log(err);
    } else{
      if(result.length===0){
        console.log("Nothing was found in the Starters collection. Inserting default content and redirecting server...");

        Starter.insertMany([homeStartingContent, aboutContent, contactContent], function(err){
          if(err){
            console.log(err);
          } else {
            console.log("Successfully inserted Starting Content. redirecting now...");
            res.redirect("/");
          }
        });
        } else{
        Post.find({}, (err, posts)=>{
          res.render("home", {
            homeStartingContent: result[0].content,
            posts: posts
          });
        })
      }
    }
  })
});

app.get("/about", (req, res) => {
  Starter.find({title:"About"}, function(err, result){
    if(err){
        console.log(err);
    }else{
        res.render("about", {
          aboutContent: result[0].content
        });
    }
  })
});

app.get("/contact", (req, res) => {

  Starter.find({title:"Contact"}, function(err, result){
    if(err){
        console.log(err);
    }else{
        res.render("contact", {
          contactContent: result[0].content
        });
    }
  })
});

app.get("/compose", (req, res) => {
  res.render("compose");
})

app.post("/compose", (req, res) => {
  const now = new Date();
  const post = new Post({
    date: now.toISOString(),
    title: lodash.lowerCase(req.body.newContentTitle),
    content: req.body.newContentBody,
  });
  post.save();

  res.redirect("/");
})

app.get("/posts/:title", (req, res) => {
  const queryTitle = lodash.lowerCase(req.params.title);

Post.findOne({title: queryTitle}, (err, post)=>{
  if(err){
    console.log(err);
  } else{
    res.render("post", {
      postTitle: lodash.capitalize(post.title),
      postDate: post.date,
      postContent: post.content
    });
  }
});

})


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started on port 3000");
});
