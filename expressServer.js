//SETUP
// const bodyParser = require("body-parser");

const express = require("express");
const app = express();
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const PORT = 8080; // default port 8080


app.use(cookieSession({
    name: "session",
    keys: ["key1"],
  })
);
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(express.urlencoded({extended: true}));

const { request, response } = require("express");
const {generateRandomString,urlsForUser,checkEmail, addHttp, verifyEmail} = require("./helper");



// DATABASE, USERS
//store
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

//making the users object
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};




app.get("/404", (req, res) => {
  res.send("Page cannot be found");
});

//make the endpoint for POST register
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Invalid email or password. Try again");
  }
  const testEmail = req.body.email;
  const verifyPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(verifyPassword, 10);

  if (checkEmail(testEmail, users)) {
    res.status(400).send("This email already exists");
    return;
  }


  const userID = generateRandomString();
  req.session.user_id = userID;
  req.session.email = testEmail;
  req.session.password = hashedPassword;

  //make a new user in object
  users[userID] = {
    id: userID,
    email: testEmail,
    password: hashedPassword,
  };
  res.redirect("/urls");
});

//GET----

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.send("Please log in to see the URLs");
    res.redirect("/login");
  }
  const ID = req.session.user_id;
  
  const templateVars = {
    user: users[req.session.user_id],
    urls: urlsForUser(ID, urlDatabase),
    shortURL: req.params.shortURL,
  };
  res.render("urlsIndex", templateVars);
});

//this provides html template
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.send("Please log in to make a URL");
  }
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("urlsNew", templateVars);
});

//returns the template for register
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("login", templateVars);
});

//post login
app.post("/login", (req, res) => {
  const verEmail = req.body.email;
  const verifyPassword = req.body.password;
  const user_id = verifyEmail(verEmail, verifyPassword, users);
  if (!user_id) {
    return res.status(403).send("Invalid email or password. Try again");
  } else {
    req.session.user_id = user_id;
    res.redirect("/urls");
  }
});

//this is the route to show user their new link - longURL ---- this needs adjusting
app.get("/urls/:shortURL", (req, res) => {
  //console.log(urlDatabase[req.params.shortURL].longURL);
  if (!req.session.user_id) {
    res.status(403).send("You must log in to view this page");
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id],
  };
  res.render("urlsShow", templateVars);
});

//requests to this endpoint will redirect to longURL ----- this needs adjusting
app.get("/u/:shortURL", (req, res) => {
  const url = urlDatabase[req.params.shortURL];
  if (!url) {
    res.status(404);
    res.status("/404");
    return;
  }
  const longURL = urlDatabase[req.params["shortURL"]].longURL;
  
  if (!longURL) {
    res.send("Invalid URL");
  } else {
    res.redirect(longURL);
  }
});

//root path
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
    return;
  }
  res.redirect("/login");
});

//POSTSS-----

//post logout
app.post("/logout", (req, res) => {
  // req.session["userId"] = null;
  req.session = null;
  res.redirect("/login");
});

app.post("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    res.status(403).send("You must log in to vew this page");
  } else {
    const shortURL = req.params.shortURL;
  const longURL = addHttp(req.body.update);
  
  urlDatabase[shortURL]["longURL"] = longURL;
  
  res.redirect(303, `/urls/${req.params.shortURL}`);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params["shortURL"]];
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
    return;
  }
  const shortURL = generateRandomString();
  const finalURL = addHttp(req.body.longURL);
  urlDatabase[shortURL] = {
    longURL: finalURL,
    userID: req.session.user_id,
  };
  
  res.redirect(`/urls/${shortURL}`);
  // res.redirect(`/urls/${shortURL}`);
});

//this returns a message in our terminal when the port is listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


