const express = require('express')
const app = express()
const port = 5174
//const { rejectExpiredFilter } = require('./app/cron/filter');

require('dotenv').config()
require('./config/express.js')(app,express)

app.set('trust proxy', true);

//rejectExpiredFilter();

app.listen(port, ()=>{
    console.log(`Server listening on port ${port}`)
})

require('./app/controllers')(app)