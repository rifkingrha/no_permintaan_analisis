const cors = require('cors');

module.exports = (app, express) => {
    const corsOptions = {
        // origin: 'http://192.168.11.232:8080/', // Replace with your frontend's exact origin
        // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        // // credentials: true, // If you need to handle cookies or authorization headers
        // allowedHeaders: '*', // Add any custom headers your frontend sends
        // exposedHeaders: 'Content-Length' // Add any custom headers you want to expose to the client
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: '*',
        credentials: true
      };
    app.use(cors(corsOptions));
    app.use(express.json({limit:'50mb'})) // Used to parse JSON bodies
    app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit:50000 })) //Parse URL-encoded bodies
    app.use(express.static('assets'))
}