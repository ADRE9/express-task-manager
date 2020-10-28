const express = require('express');
require('./db/mongoose');

//Routes
const userRoute = require('./routers/user');
const taskRoute = require('./routers/task');

const app = express();
app.use(express.json());

//Routers
app.use(userRoute);
app.use(taskRoute);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Node App is running on " + PORT);
});