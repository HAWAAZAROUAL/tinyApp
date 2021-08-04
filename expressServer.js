const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
const { request, response } = require("express");

//require cookie parser
const cookieParser = require("cookie-parser");

//middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
//cookie parser gives you info needed

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

//this returns a message in our terminal when the port is listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//this provides html template
app.get("/urls/new", (req, res) => {
  const templateVars = {
    Username: req.cookies["Username"]
  }
  res.render("urlsNew", templateVars);
});

//this is the route to show user their new link - longURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    Username: req.cookies["Username"],
  };
  res.render("urlsShow", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urlsIndex", templateVars);
});

//requests to this endpoint will redirect to longURL
app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params["shortURL"]]);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  if (!req.body.longURL.includes("http")) {
    req.body.longURL = "http://" + req.body.longURL;
  }
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params["shortURL"]] = req.body.Update;
  res.redirect("/urls");
});

//post login
app.post("/login", (req, res) => {
  res.cookie("Username", req.body.Username);
  res.redirect("/urls");
});

//post logout
app.post("/logout", (req, res) => {
  res.clearCookie("Username", req.body.Username);
  res.redirect("/urls");
});

//display username
app.get("/urls", (req, res) => {
 const templateVars = {
  Username: req.cookies["Username"],
  urls: urlDatabase,
};
res.render("urlsIndex", templateVars); 
});


app.get("/", (req, res) => {
  res.send("Hello from TinyApp");
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });
