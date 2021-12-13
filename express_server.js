const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const generateRandomString = function() {
  return Math.random().toString(36).substr(2, 6);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser")
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

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
  if (!email || email === "" && !password || password === ""){
    res.sendStatus(400)
  } else {
    let match = false 
    for (let i in users){
      if (users[i].email === email && users[i].password === password){
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
    password: password
  };

    res.cookie("user_id", id);
    res.redirect("/urls");
}
});

app.post("/login", (req, res) => {
  const user = 
  getUserByEmail(req.body.email);
  if (!user) {
    return res.status(401).send
  }
  if (req.body.password !== user.password) {
    return res.status(401)
  }

  res.cookie("user_ID", user.id);
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]];
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
  const templateVars = { urls: urlDatabase, user: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

app.get("/urls_register", (req, res) => {
  res.render("urls_register");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`urls/${shortURL}`);
});

app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL
  res.redirect("/urls")
}) 

app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL]
  res.redirect("/urls");
});


app.get("/urls/new", (req, res) => {
  const templateVars = {user: req.cookies.username};
  res.render("urls_new", templateVars);
});

app.get("/login", (req, res) => {
  const user = users[req.cookies["user_id"]]; 
  res.render("login",{user});
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});
  
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
}); 

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let templateVars = { shortURL, longURL: urlDatabase[shortURL]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL] 
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});