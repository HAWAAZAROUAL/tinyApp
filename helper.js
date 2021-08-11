//HELPER FUNCTIONS
const bcrypt = require("bcrypt");
//for making a random shortURL
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}
//making sure each email is unique and not registered already
const checkEmail = function(testEmail, users) {
  for (const user in users) {
    if (users[user]["email"] === testEmail) {
      return true;
    }
  }
  return;
}

// LOGIN: verification of email and password entered by user.
const verifyEmail = (verEmail, verifyPassword, users) => {

  // check user input against email/password stored in database.
  for (const user_id in users) {
    if (users[user_id]['email'] === verEmail) {
      if (bcrypt.compareSync(verifyPassword, users[user_id]['password'])) {
        return user_id;
      }
    }
  }
  return undefined;
};


// Adds http:// to the longURL
const addHttp = longURL => {

  if (!(longURL).includes('http')) {
    longURL = 'http://' + longURL;
  }
  return longURL;
};


//get the urls made by user
const urlsForUser = function (userid, urlDatabase) {
  const urls = {};
  for (const URL in urlDatabase) {
    if (urlDatabase[URL].userID === userid) {
      urls[URL] = urlDatabase[URL];
    }
  }
  return urls;
};

module.exports = { generateRandomString,urlsForUser,checkEmail, addHttp, verifyEmail};
