const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

let userIncrId = 1;
let exerciseIncrId = 1;

const userDb = {};
const exerciseDb = {};

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.post("/api/users", (req, res) => {
  const {username} = req.body;

  if(!username){
    return res.status(400).send('Username and/or password are required');
  }

  userDb[userIncrId++] = {username};

  return res.json({username, _id: String(userIncrId-1)});
})

app.get("/api/users", (req, res) => {
  const response = Object.entries(userDb).map(([id, content]) => ({
    ...content,
        _id: id
  }));

  return res.json(response);
})

app.get("/api/users/:id/logs", (req, res) => {
  const userId = parseInt(req.params.id);
  const {from, to, limit} = req.query;

  if(!userDb[userId]) {
    return res.status(400).send('User does not exist');
  }

  let exercises = Object.values(exerciseDb).filter(exercise => exercise._id === userId).filter(exercise => {
    if(from && new Date(exercise.date) < new Date(from)) {
      return false;
    }

    if(to && new Date(exercise.date) > new Date(to)) {
      return false;
    }

    return true;
  })

  if(limit) {
    exercises = exercises.slice(0, Number(limit));
  }

  return res.json({
    ...userDb[userId],
    count: exercises.length,
    log: exercises
  })
});

app.post("/api/users/:id/exercises", (req, res) => {
  const userId = parseInt(req.params.id);
  const {description, duration, date} = req.body;

  if(!description || !duration){
    return res.status(400).send('Description and duration are required');
  }

  if(!userDb[userId]) {
    return res.status(400).send('User does not exist');
  }

  exerciseDb[exerciseIncrId++] = {description, duration: Number(duration), date: new Date(Date.parse(date) ? date : Date.now()).toDateString(), _id: userId};


  return res.json({...exerciseDb[exerciseIncrId-1], ...userDb[userId]});
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
