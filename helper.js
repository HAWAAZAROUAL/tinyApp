//HELPER FUNCTIONS

//for making shortURL
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

const getUserByEmail = function(email, database) {
  for (let key in database) {
    if (email === database[key]["email"]) {
      return key;
    }
  }
}

//I don't ever use this in expressServer
const findURLInDatabase = function(id, database) {
  for (const url in database) {
    if (url === id) {
      return url;
    }
  }
  return false
}

const urlsForUser = function (id, urlDatabase) {
  const urls = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userId === id) {
      urls[key] = urlDatabase[key];
    }
  }
  return urls;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser,findURLInDatabase};
