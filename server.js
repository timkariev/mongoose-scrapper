var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/3000";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);


// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  axios.get("https://www.washingtonpost.com/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $(".story-body").each(function(i, element) {
      
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children("a").children("div").children("h2").text();
      result.link = $(this).children("a").attr("href");
      result.summary = $(this).children("a").children("div").children("p").text();
      result.image = $(this).children("a").children("div").children("img").attr("src");
      result.isSaved = false;

      
      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
      
    });

    // If we were able to successfully scrape and save an Article, send a message to the client
    res.send(result);
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  db.Article.find({}, function(err, found) {
    // Log any errors if the server encounters one
    if (err) console.log(err);
    else res.json(found);
    })
});

app.post("/saveArticle", function(req, res) {
  console.log("Saving article", req.body);
  db.Article.update({
    "link": req.body
  },
  {
    $set: {"isSaved": true}
  },
  function(err, found) {
    // Log any errors if the server encounters one
    if (err) console.log(err);
    else res.json(found);
    })
});

app.get("/saved", function(req, res) {
  db.Article.find({
    "saved": true
  }, function(err, found) {
    // Log any errors if the server encounters one
    if (err) console.log(err);
    else res.json(found);
    })
  // TODO
  // ====
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "note",
  // then responds with the article with the note included
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // TODO
  // ====
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "note",
  // then responds with the article with the note included
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // TODO
  // ====
  // save the new note that gets posted to the Notes collection
  // then find an article from the req.params.id
  // and update it's "note" property with the _id of the new note
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
