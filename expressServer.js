//SETUP

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
const { request, response } = require("express");

//require cookie parser
//const cookieParser = require("cookie-parser");
//app.use(cookieParser());
//cookie parser gives you info needed for a certain page to load
const cookieSession = require("cookie-session");
app.use(
  cookieSession({
    name: "session",
    keys: ["scooby", "ruby"],
  })
);

//middleware
app.use(express.urlencoded({ extended: true }));

//for making shortURL
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

// BCRYPT-----
const bcrypt = require("bcrypt");
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

//this provides html template
app.get("/urls/new", (req, res) => {
  if (!req.session.userId) {
    //res.redirect("/login");
    res.send("Please log in to create a URL");
  }
  const templateVars = {
    user: users[req.session.userId],
  };
  res.render("urlsNew", templateVars);
  // console.log("userID",userID);
  // console.log("userId",userId);
});

//this is the route to show user their new link - longURL ---- this needs adjusting
app.get("/urls/:shortURL", (req, res) => {
  //console.log(urlDatabase[req.params.shortURL].longURL);
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.userId],
  };
  res.render("urlsShow", templateVars);
});

app.get("/urls", (req, res) => {
  if (!req.session.userId) {
    res.send("You must log in to see and make URLs");
    res.redirect("/login");
  }

  const ID = req.session.userId;

  const templateVars = {
    user: users[req.session.ID],
    urls: urlsForUser(ID, urlDatabase),
    shortURL: req.params.shortURL,
  };
  res.render("urlsIndex", templateVars);
});

//requests to this endpoint will redirect to longURL ----- this needs adjusting
app.get("/u/:shortURL", (req, res) => {
  const url = urlDatabase[req.params["shortURL"]];
  if (!longURL) {
    res.send("shortURL invalid");
  } else {
    res.redirect(longURL);
  }
  const longURL = urlDatabase[req.params["shortURL"]].longURL;
  if (!url) {
    res.status(404);
    res.redirect("/404");
    return;
  }
});

app.post("/urls", (req, res) => {
  if (!req.session.userId) {
    res.redirect("/login");
    return;
  }
  const shortURL = generateRandomString();
  if (!req.body.longURL.includes("http")) {
    req.body.longURL = "http://" + req.body.longURL;
  }
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.userId,
  };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params["shortURL"]];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  //console.log("shortURL:", shortURL);
  urlDatabase[shortURL]["longURL"] = req.body.Update;
  //console.log("urlDatabase[shortURL]:", urlDatabase[shortURL])
  res.redirect("/urls");
});

//returns the template for register
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.userId],
  };
  // console.log(templateVars);
  res.render("register", templateVars);
});

// also the emailLookup
const verifyEmail = (checkEmail, users) => {
  for (const user in users) {
    if (users[user]["email"] === checkEmail) {
      return true;
    }
  }
  return;
};

//make the endpoint for POST register
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Invalid email or password. Try again");
  }
  const checkEmail = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if(verifyEmail(checkEmail, users)) {
      res.status(400).send("Email already exists."); 
      return;
  }
  const userID = generateRandomString();
req.session.userId = userID;
req.session.email = checkEmail;
req.session.password = hashedPassword
  
//make a new user in object
users[userID] = {
    id: userID,
    email: checkEmail,
    password: hashedPassword,
  };
  
  //console.log("users:", users);
  res.redirect("/urls");
  
});

const urlsForUser = function (id, urlDatabase) {
  const urlsUser = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      urlsUser[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return urlsUser;
};

//check email and password - verify credentials
const checkLoginInfo = function (checkEmail, checkPassword, users) {
  for (const userId in users) {
    if (users[userId]["email"] === checkEmail) {
      if (bcrypt.compareSync(checkPassword, users[userId]["password"])) {
        return userId;
      }
    }
  }
};

//post login
app.post("/login", (req, res) => {
  const checkEmail = req.body.email;
  const checkPassword = req.body.password;
  const userId = checkLoginInfo(checkEmail, checkPassword, users);
  // for (const userId in users) {
  //   // if (users[userId]["email"] === req.body.email) {
  //   //   if (users[user]["password"] === req.body.password) {
  //   //     userId = users[user]["id"];
  //   //     res.cookie("userId", userId);
  //   //     res.redirect("/urls");
  //   //     return;
  //     }
  if (!userId) {
    res.status(403).send("Invalid email or password. Try again");
  } else {
    req.session.userId = userId;
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.userId],
  };
  res.render("login", templateVars);
});

//post logout
app.post("/logout", (req, res) => {
  req.session['userId'] = null;
  res.redirect("/login");
});

//display userId
app.get("/urls", (req, res) => {
  const templateVars = {
    user: user[req.session.userId],
    urls: urlDatabase,
  };
  res.render("urlsIndex", templateVars);
});
//root path
app.get("/", (req, res) => {
  res.send("Hello from TinyApp");
  res.redirect("/login");
});

app.get("/404", (req, res) => {
  res.send("Page cannot be found");
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
