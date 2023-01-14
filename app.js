//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const _ = require('lodash');
const md5 = require("md5");
require('dotenv').config()

const homeStartingContent = "A blog, short for weblog, is a frequently updated web page used for personal commentary or business content. Blogs are often interactive and include sections at the bottom of individual blog posts where readers can leave comments. Most are written in a conversational style to reflect the voice and personal views of the blogger. Some businesses use blogs to connect with target audiences and sell products. Blogs were originally called weblogs, which were websites that consisted of a series of entries arranged in reverse chronological order, so the newest posts appeared at the top. They were frequently updated with new information about various topics.";
const aboutContent = `Field Ready creates this blog to share stories and highlight events, activities and notable achievements. The work we do is sometimes of a highly technical nature thus we see the need to share more in-depth material pertaining to the technical facets of the organization. We will discuss methodology, designs, technology and other elements that relate to the technical components of our work. We hope this can be of assistance to makers, engineers and others with similar expertise or interest. \n We will continue to post our traditional blog posts, but want this space to address the work that our innovators, designers and engineers frequently encounter in their work. There is a lot that goes on behind the scenes so we hope that this will be of use to share the insights we may have, as well as hear any feedback or advice. The technical posts will aim to: Focus on technology and making, Share information about ongoing work, Create dialogue and discussion `;

let loggedIn = "";
// let posts = [];

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.set('strictQuery', false);

mongoose.connect("mongodb://127.0.0.1:27017/blogDB", { useNewUrlParser: true })

const postsSchema = {
  title: String,
  content: String
}

const authorSchema = {
  email: String,
  password: String
}

const Post = mongoose.model("Post", postsSchema);
const Author = mongoose.model("Author", authorSchema);

const author = new Author({
  email: "muskaanpuri04@gmail.com",
  password: md5(process.env.PASSWORD)
})

author.save();

app.get("/", function (req, res) {
  Post.find({}, (err, posts) => {
    res.render("home", { homeContent: homeStartingContent, posts: posts });

  })
});

app.get("/about", function (req, res) {
  res.render("about", { aboutPageContent: aboutContent });
});

app.get("/compose", function (req, res) {
  if(loggedIn) {
  res.render("compose");
  } else {
    res.render("login");
  }
});

app.get("/login", function(req, res) {
  res.render("login");
})

app.post("/login", function(req, res) {
  const username = req.body.authorId;
  const password = md5(req.body.authorPass);

  Author.findOne({email: username}, function(err, author) {
    if(err) {
      console.log(err);
    } else if(author) {
      if(author.password === password) {
        loggedIn = true; 
        res.render("compose");
      }
    }
  })

})

app.post("/compose", function (req, res) {
  const post = new Post({
    title: req.body.newBlogTitle,
    content: req.body.newBlogContent
  })
  post.save(function(err){
    if (!err){
      loggedIn = false;
      res.redirect("/");
    }
  });
})

app.get("/posts/:reqPostId", (req, res) => {
  const postId = req.params.reqPostId;
  Post.findOne({ _id: postId }, (err, post) => {
    res.render("post", { postTitle: post.title, postContent: post.content })
  })
})
















app.listen(3000, function () {
  console.log("Server started on port 3000");
});
