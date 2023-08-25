const express = require("express");
const path = require("path");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");

let db = null;
const dbPath = path.join(__dirname, "userData.db");

const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server getting started");
    });
  } catch (e) {
    console.log(`Error : ${e.message}`);
    process.exit(1);
  }
};
initializeDBandServer();

app.post("/register", async (request, response) => {
  const userDetails = request.body;
  const { username, name, password, gender, location } = userDetails;

  const userQuery = `SELECT * FROM user WHERE username = '${username}';`;
  const userFound = await db.get(userQuery);
  const hashedPassword = await bcrypt.hash(password, 10);

  if (userFound) {
    response.status(400);
    response.send("User already exists");
  } else {
    if (password.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const sqlQuery = `
            INSERT INTO user (username,name,password,gender,location)
            VALUES(
            '${username}','${name}','${hashedPassword}','${gender}','${location}'
            );
            `;
      const dbResponse = await db.run(sqlQuery);
      response.status(200);
      response.send("User created successfully");
      console.log("success");
    }
  }
});

app.post("/login", async (request, response) => {
  const { username, password } = request.body;

  const userQuery = `SELECT * FROM user where username = '${username}';`;
  const dbUser = await db.get(userQuery);
  console.log(dbUser);
  if (dbUser !== undefined) {
    const passwordMatched = await bcrypt.compare(password, dbUser.password);
    if (passwordMatched) {
      console.log("success");
      response.status = 200;
      response.send("Login success");
    } else {
      console.log("password failed");
      response.status = 400;
      response.send("Invalid password");
    }
  } else {
    response.status = 400;
    response.send("Invalid user");
  }
});
app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;

  const userQuery = `SELECT * FROM user where username = '${username}';`;
  const dbUser = await db.get(userQuery);
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  console.log(dbUser);
  if (dbUser) {
    const passwordMatched = await bcrypt.compare(oldPassword, dbUser.password);
    if (passwordMatched) {
      if (newPassword.length < 5) {
        response.status = 400;
        response.send("Password is too short");
      } else {
        console.log("matched");
        const sqlUpdateQuery = `UPDATE user SET password = '${hashedPassword}' where username = '${username}';`;
        response.status = 200;
        response.send("Login success");
      }
    } else {
      console.log("unmatched");
      response.status = 400;
      response.send("Invalid current password");
    }
  }
});

module.exports = app;
