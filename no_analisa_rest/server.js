require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');

const port = process.env.SERVER_PORT || 5174;
//const { rejectExpiredFilter } = require('./app/cron/filter');

// Izinkan frontend Vite
app.use(cors({
    origin: 'http://192.168.11.110:5173',
    credentials: true
}));

require('./config/express.js')(app,express)

app.set('trust proxy', true);

//rejectExpiredFilter();

app.listen(port, ()=>{
    console.log(`Server listening on port ${port}`)
})

require('./app/controllers')(app)
