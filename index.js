var express = require('express');
var router = express.Router();
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios').default;
var db;
const port = 80;
app.listen(port);
app.use(bodyParser.json());
app.use(cors());

mongoose.connect(
  'mongodb+srv://rakesh:rocman911@moonlight.chwmmup.mongodb.net/moonlightdb?retryWrites=true&w=majority',
  { useNewUrlParser: true, useUnifiedTopology: true },
  function (err, database) {
    if (err) return console.log('error ', err);
    db = database;
    console.log('App is listening on port ' + port);
  }
);
app.get('/', (req, res) => {
  console.log('start');
  res.send('Hello');
});

app.post('/api/verify', (req, res) => {
  console.log(req.body);
  var nodemailer = require('nodemailer');
  var conn = mongoose.connection;

  var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secureConnection: false,
    secure: false,
    requireTLS: false,
    auth: {
      user: 'dev@altsaas.com',
      pass: 'ssemxbtjaggnbjiv'
    }
  });

  var mailOptions = {
    from: 'dev@altsaas.com',
    to: req.body.email,
    subject: 'Welcome to Moonlight: Verify your account',
    text: 'Please use the below verification code ' + req.body.code,
    html:
      '<h3>Please use the below verification code on http://altsaas.com</h3><h1>' +
      req.body.code +
      '</h1><p>Best wishes,</p><p>AltSaas</p>'
  };
  conn
    .collection('lead')
    .find({ email: req.body.email })
    .toArray()
    .then((response) => {
      console.log('response ', response);

      if (response.length > 0)
        return res.json({ message: 'already registered' });
      else {
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);

            res.json({ message: 'ok' });
          }
        });
      }
    });
});
app.post('/api/register', (req, res) => {
  // console.log('inside ', req.body);
  var conn = mongoose.connection;
  var ObjectID = require('mongodb').ObjectId;
  var user = {
    fullName: req.body.fullName,
    email: req.body.email,
    company: req.body.company,
    designation: req.body.designation,
    message: req.body.reason,
    _id: new ObjectID()
  };
  conn.collection('lead').insertOne(user);
  res.json({ message: 'record added' });
});

app.post('/registrants', (req, res) => {
  console.log('inside ', req.body);
  axios
    .post(
      `https://api.zoom.us/v2/webinars/${req.body.webinarId}/registrants`,
      {
        first_name: req.body.firstName,
        last_name: req.body.lastName,
        email: req.body.email,
        country: req.body.country,
        phone: req.body.phone,
        job_title: req.body.jobTitle,
        org: req.body.companyName
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: req.body.bearer
        }
      }
    )
    .then(() => {
      console.log('send json');
      res.json({ message: 'record added' });
    })
    .catch((err) => {
      console.log('====================================');
      console.log(err);
      console.log('====================================');
    });
});

module.exports = router;
