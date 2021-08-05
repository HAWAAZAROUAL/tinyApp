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
//cookie parser gives you info needed for a certain page to load

//store
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//making the users object
const users = {};

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
    users,
    user: users[req.cookies.userId],
  };
  res.render("urlsNew", templateVars);
});

//this is the route to show user their new link - longURL ---- this needs adjusting
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    users,
    user: users[req.cookies.userId],
  };
  res.render("urlsShow", templateVars);
});

app.get("/urls", (req, res) => {
  console.log("req.cookies:", req.cookies);
  const templateVars = { urls: urlDatabase };
  res.render("urlsIndex", templateVars);
});

//requests to this endpoint will redirect to longURL ----- this needs adjusting
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params["shortURL"]];
  if (!longURL) {
    res.send("shortURL invalid");
  } else {
    res.redirect(longURL);
  }
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
  delete urlDatabase[req.params['shortURL']];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params["shortURL"]] = req.body.Update;
  res.redirect("/urls");
});

//returns the template for register
app.get("/register", (req, res) => {
  const templateVars = {
    users,
    user: users[req.cookies.userId],
  };
  console.log(templateVars);
  res.render("register", templateVars);
});

//make the endpoint for POST register
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Invalid email or password. Try again");
  }
  for (const user in users) {
    if (users[user][email] === email) {
      res.status(400).send("Email already exists.");
    }
  }
  const userId = generateRandomString();
  users[userId] = {
    id: userId,
    email: req.body.email,
    password: req.body.password,
  };
  res.cookie("userId", userId);
  console.log("users:", users);
  res.redirect("/urls");
});

//post login
app.post("/login", (req, res) => {
  for (const user in users) {
    if (users[user]["email"] === req.body.email) {
      if (users[user]["password"] === req.body.password) {
        userId = users[user]["id"];
        res.cookie("userId", userId);
        res.redirect("/urls");
        return;
      }
    }
  }
  res.status(403).send("Invalid email or password. Try again");
});

app.get("/login", (req, res) => {
  const templateVars = {
    users,
    user: users[req.cookies.userId],
  };
  res.render("login", templateVars);
});

//post logout
app.post("/logout", (req, res) => {
  res.clearCookie("userId", req.body.userId);
  res.redirect("/urls");
});

//display userId
app.get("/urls", (req, res) => {
  const templateVars = {
    user: user[req.cookies.userId],
    urls: urlDatabase,
  };
  res.render("urlsIndex", templateVars);
});
//root path
app.get("/", (req, res) => {
  res.send("Hello from TinyApp");
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });
