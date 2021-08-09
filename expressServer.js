//SETUP

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const { request, response } = require("express");
const {
  generateRandomString,
  getUserByEmail,
  urlsForUser,
  //findURLInDatabase,
} = require("./helper");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");

app.set("view engine", "ejs");
app.use(
  cookieSession({
    name: "session",
    keys: ["key1"],
  })
);

app.use(express.urlencoded({ extended: true }));

// BCRYPT-----
const password = "purple-monkey-dinosaur"; // found in the req.params object
const hashedPassword = bcrypt.hashSync(password, 10);
//to check if a password is hashed
bcrypt.compareSync("purple-monkey-dinosaur", hashedPassword); // returns true
bcrypt.compareSync("pink-donkey-minotaur", hashedPassword); // returns false

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

//this returns a message in our terminal when the port is listening
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//GET----

app.get("/urls", (req, res) => {
  const userid = req.session.user_id;
  const user = users[userid];
  if (!user) {
    return res.send("You must log in to see and make URLs");
    //res.redirect("login");
  }
  const templateVars = {
    user: user,
    urls: urlsForUser(userid, urlDatabase),
    shortURL: req.params.shortURL,
  };
  res.render("urlsIndex", templateVars);
});

//this provides html template
app.get("/urls/new", (req, res) => {
  const userid = req.session.user_id;
  const user = users[userid];
  const templateVars = { urls: urlDatabase, user: user };
  if (!templateVars.user) {
    return res.status(400).redirect("/login");
  }
  res.render("urlsNew", templateVars);
  // console.log("userID",userID);
  // console.log("userId",userId);
});

//returns the template for register
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  }
  const templateVars = {
    urls: urlDatabase,
    user: null,
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  if ((req.session.user_id !== undefined) && (!users[req.session.user_id] !== users[req.session.user_id])  && (req.session.user_id === users[req.session.user_id])) {
    res.redirect("/urls");
  }
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id],
  };
  res.render("login", templateVars);
});

//post login
app.post("/login", (req, res) => {
  const email = req.body.email;
  let password = req.body.password;
  const userid = getUserByEmail(email, users);
  const checkPassword = bcrypt.compareSync(password, users[userid].password);
  if (!userid) {
    return res.status(403).send("Invalid email or password. Try again");
  } else if (!checkPassword) {
    return res.status(403).send("Invalid email or password. Try again");
  }
  req.session.user_id = userid;
  if(!req.session.user_id) {
    return res.send("Please login to view the URLs")
  }
  res.redirect("/urls");
});

//this is the route to show user their new link - longURL ---- this needs adjusting
app.get("/urls/:shortURL", (req, res) => {
  //console.log(urlDatabase[req.params.shortURL].longURL);
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.send("This URL does not exist");
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  const userId = req.session.userId;
  user = users[req.session.user_id];
  const templateVars = {
    shortURL: shortURL,
    longURL: longURL,
    user: user,
  };
  if (users[req.session.user_id]) {
    if (urlDatabase[shortURL] && userId === urlDatabase[shortURL].user_id) {
      return res.render("urlsShow", templateVars);
    }
    return res.send("You cannot access these URLs");
  }
  res.send("Please log in");
});

//requests to this endpoint will redirect to longURL ----- this needs adjusting
app.get("/u/:shortURL", (req, res) => {
  const id = req.session.user_id;
  const shortURL= [req.params.shortURL];
  if (id !== shortURL) {
    return res.send("shortURL invalid");
  }
  if (!urlDatabase[shortURL]) {
    return res.send("This URL does not exist");
  }
  const longURL = urlDatabase[shortURL].longURL;
  if (!longURL) {
    return res.status(404).send("Invalid URL");
  }
  res.redirect(longURL);
});

//root path
app.get("/", (req, res) => {
  res.redirect("/login");
});

//POSTSS-----

//make the endpoint for POST register
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email === "" || password === "") {
    res.status(400).send("Invalid email or password. Try again");
  }

  const id = generateRandomString();
  for (const user in users) {
    if (users[user]["email"] === email) {
      res.status(400).send("This email already exists");
    }
  }

  //make a new user in object
  users[id] = {
    id: id,
    email: email,
    password: hashedPassword,
  };

  req.session.user_id = id;
  res.redirect("/urls");
});

//post logout
app.post("/logout", (req, res) => {
  // req.session["userId"] = null;
  req.session = null;
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  //console.log("shortURL:", shortURL);
  const longURL = req.body["longURL"];
  const userid = req.session.user_id;
  const user = users[userid];
  urlDatabase[shortURL] = {
    longURL: longURL,
    userId: userid,
  };
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let id = req.session.user_id;
  if (urlDatabase[req.params.shortURL]["userId"] === id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } 
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  if (!req.body.longURL.includes("http")) {
    req.body.longURL = "http://" + req.body.longURL;
  }
  const userid = req.session.user_id;
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userId: userid,
  };
  if (shortURL === userid) {
    return res.redirect(`/urls/${userid}`);
  }
  res.redirect("/urls");
  // res.redirect(`/urls/${shortURL}`);
});

app.get("/404", (req, res) => {
  res.send("Page cannot be found");
});


