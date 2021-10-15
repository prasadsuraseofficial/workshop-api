require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
// const fetch = require("node-fetch");
// const axios = require("axios");
const cors = require("cors");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");

const fs = require("fs");
// const file = fs.readFileSync(__dirname + "/emails/welcome/index.html", "utf8");

const PORT = 5000;
const app = express();
app.use(bodyParser.json());
app.use(cors());

// nodemailer config
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

transporter.use(
  "compile",
  hbs({
    viewEngine: "express-handlebars",
    viewPath: __dirname + "/emails/welcome/",
  })
);

// PROD
// const conn = mysql.createConnection({
//   host: "184.168.115.18",
//   user: "zicflow",
//   password: "zicFlow#123",
//   database: "zicflow_funnel",
// });

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "zicflow_funnel",
});

conn.connect((err) => {
  if (!err) {
    console.log("successful");
  } else {
    console.log(err);
    res.send(err);
  }
});

app.listen(PORT || process.env.PORT, () => {
  console.log(`server is listening on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("<h1>Hello from node</h1>");
});

// new student registration
app.post("/signup", (req, res) => {
  const { fullName, email, mobNumber } = req.body;

  var timeStamp = new Date().toDateString();
  // console.log(timeStamp);
  var insertQuery = `INSERT INTO students(ID, FULL_NAME, EMAIL, MOB_NUMBER, TIMESTAMP) values(0, "${fullName}", "${email}", "${mobNumber}", "${timeStamp}")`;
  conn.query(insertQuery, (err, result) => {
    if (!err) {
      // send email to student
      let mailOptions = {
        from: "zicflowsolutions@gmail.com",
        to: email,
        subject: `Dear ${fullName}, Your Registration Is Successful!`,
        // text: `Dear ${fullName}, Your Registration Has Been Confirmed! Thank You!`,
        template: "index",
        // html: "index",
      };
      transporter.sendMail(mailOptions, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Email Sent");
          console.log(data);
        }
      });

      res.status(200).send({ msg: "Successful..!" });
    } else {
      res.status(500).send({ msg: "Failed..!" });
    }
  });
});

app.post("/auth", (req, res) => {
  // console.log(req.body);
  var selectUsers = `SELECT * FROM user WHERE EMAIL="${req.body.username}" && PASS="${req.body.pass}"`;
  conn.query(selectUsers, (err, rows, fields) => {
    if (!err) {
      if (rows[0]) {
        res.status(200).send(rows[0]);
      } else {
        res.status(203).send({ err: "not found" });
      }
    } else {
      console.log(err);
      res.status(500).send({ err: err });
    }
  });
});

app.get("/getAllStudents", (req, res) => {
  var getAllStudents = "SELECT * FROM students";
  conn.query(getAllStudents, (err, rows, fields) => {
    if (!err) {
      console.log(rows);
      res.status(200).send(rows);
    } else {
      res.status(500).send({ err: err });
    }
  });
});

// -------------------------------------------------
// app.post("/signup-mailchimp", (req, res) => {
//   // console.log(req.body);

//   const { fullName, email, mobNumber } = req.body;

//   // build data object
//   const data = {
//     members: [
//       {
//         email_address: email,
//         status: "subscribed",
//         merge_fields: {
//           fullName: fullName,
//           mobNumber: mobNumber,
//         },
//       },
//     ],
//   };

//   // request headers
//   const dataWithHeaders = {
//     headers: {
//       Authorization: "auth 6686714052dcb1325cc7ef9965684176-us5",
//     },
//     method: "POST",
//     body: data,
//   };

//   // send data to server and email marketing software
//   axios
//     .post(
//       "https://us5.api.mailchimp.com/3.0/lists/<YOUR_AUDIENCE_ID>",
//       dataWithHeaders
//     )
//     .then((res) => {
//       // console.log(res);
//       res.status(200).send({ msg: "success" });
//     })
//     .catch((e) => {
//       // console.log(e);
//       res.status(403).send({ msg: "failed" });
//     });

//   // res.status(500).send("failed");
// });
