const express = require("express");
const app = express();
const PORT = 8080;
const bcrypt = require('bcryptjs');

app.set("view engine", "ejs");

const generateRandomString = function() {
  return Math.random().toString(36).substr(2, 6);
};

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "userRandomID"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "user2RandomID"
  }
};

const bodyParser = require("body-parser");
const cookieSession = require("cookie-session")
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "session",
  keys: ['keys1', 'key2']
}));

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}


function urlsForUser(id) {
  let filteredUrls = {};
  for (let shortURL in urlDatabase) {
    let userID = urlDatabase[shortURL].userID;
    if (userID === id) {
      filteredUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return filteredUrls;
}

const getUserByEmail = function (email) {
  for (const id in users) {
    const user = users[id];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

app.post("/register", function(req, res) {
  let email = req.body.email;
  let password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!email || email === "" && !password || password === ""){
    res.sendStatus(400)
  } else {
    let match = false 
    for (let i in users){
      if (users[i].email === email){
        match = true
      }
    }
    if (match) {
      res.sendStatus(400)
    }
    let id = generateRandomString()
    users[id] = {
    id: id,
    email: email,
    password: hashedPassword
  };

    res.session("user_id", id);
    res.redirect("/urls");
}
});

app.post("/login", (req, res) => {

  const user = getUserByEmail(req.body.email);
  let password = req.body.password;
  if (!user) {
    return res.status(401).send
  }
  const passwordIsCorrect = bcrypt.compareSync(password, user.password);
  if (!passwordIsCorrect) {
    return res.status(401)
  }

  res.session("user_id", user.id);
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const user = users[req.session["user_id"]];
  console.log( bcrypt.hashSync("purple-monkey-dinosaur", 10))
  console.log( bcrypt.hashSync("dishwasher-funk", 10))
  res.render("urls_register", {user});
});


app.get("/urls_register", (req, res) => {
  res.render("urls_register");
});

app.post("/urls_register", (req, res) =>  {
  res.end("/urls");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const user = users[req.session["user_id"]];
  if (user){
  const templateVars = { urls: urlDatabase, user};
  res.render("urls_index", templateVars);
 } else { res.redirect("/register");}
});

app.get("/urls_register", (req, res) => {
  res.render("urls_register");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  //const userID = req.session["user_id"] 
  urlDatabase[shortURL] = {longURL: req.body.longURL} //userID: userID}
  res.redirect(`urls/${shortURL}`);
});

app.post("/urls/:id", (req, res) => {
  const user = users[req.session["user_id"]];
  if (user){
  let shortURL = req.params.shortURL;
  if (user === urlDatabase[shortURL].userID){
  urlDatabase[shortURL] 
  res.redirect("/urls")}
  else{res.status(401).send("User login can not edit this url")}
  }else{
  res.status(401).send("User not login can not delete this url");}
}); 

app.post("/urls/:shortURL/delete", (req, res) => { 
  const user = users[req.session["user_id"]];
  if (user){
  let shortURL = req.params.shortURL;
  if (user === urlDatabase[shortURL].userID){
  delete urlDatabase[shortURL]
  res.redirect("/urls");}
  else{res.status(401).send("User login can not delete this url")}  
  }else{
  res.status(401).send("User not login can not delete this url");}
});


app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
  const templateVars = {user: req.session.user_id};
  res.render("urls_new", templateVars);}
  else {res.redirect("/urls");}
});

app.get("/login", (req, res) => {
  const user = users[req.session["user_id"]]; 
  res.render("login",{user});
});

app.post("/login", (req, res) => {
  res.cookie('user_id', req.body.username);
  res.redirect('/urls');
});
  
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
}); 

app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session["user_id"]];
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID === req.session.user_id){
  let templateVars = { shortURL, user, longURL: urlDatabase[shortURL].longURL};
  res.render("urls_show", templateVars);  
  } else {
    res.redirect("/urls");
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL] 
  console.log(longURL)
  res.redirect(longURL);
});

//shortURL part 2

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});