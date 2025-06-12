const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const {dbConnect} = require("./utilities/db");
const socket = require('socket.io');
const http = require("http");
const server = http.createServer(app);

//create HTTP Server Initialise Socket.IO
// CORS config：allow port 3000 and 3001 send request to backend
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
}));

const io = socket(server,{
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        credentials: true
    }
});

//Create and maintain an array to store online user information
//allCustomer = [{ customerId, socketId, userInfo }, …]
const allCustomer = []
const addUser = (customerId, socketId, userInfo) =>{
    const exist = allCustomer.some(u => u.customerId === customerId);
    if(!exist){
        allCustomer.push({
            customerId,
            socketId,
            userInfo
        });
    }
}
const removeUser = (socketId) => {
    const idx = allCustomer.findIndex(u => u.socketId === socketId);
    if (idx !== -1) allCustomer.splice(idx, 1);
};

//manage socket connection
io.on('connection', (socket) => {
    //console.log('Socket connected, id =', socket.id);

    socket.on('add_user', (customerId, userInfo) => {
        addUser(customerId, socket.id, userInfo);
        //console.log('Current Online users:', allCustomer);
    });

    socket.on('disconnect', () => {
        removeUser(socket.id);
        //console.log('Socket disconnected:', socket.id);
    });

})

// Hook io and allCustomer to every request
app.use((req, res, next) => {
    req.io = io;
    req.allCustomer = allCustomer;
    next();
});

app.use(bodyParser.json());
app.use(cookieParser());

app.use('/api',require('./routes/authRoutes'));
app.use('/api',require('./routes/categoryRoutes'));
app.use('/api',require('./routes/producrRoutes'));
app.use('/api',require('./routes/chatRoutes'));

app.get('/',(req, res) =>
    res.send('My first express server'));
const port = process.env.PORT;
dbConnect();

server.listen(port, () => console.log(`Server is running on port ${port}`));