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
app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true,
}));

const io = socket(server,{
    cors: {
        origin: '*',
        credentials: true
    }
});


var allCustomer = []
const addUser = (customerId, socketId, userInfo) =>{
    const checkUser = allCustomer.some(u => u.customerId === customerId);
    if(!checkUser){
        allCustomer.push({
            customerId,
            socketId,
            userInfo
        });
    }
}

io.on('connection', (socket) => {
    console.log('socket server running');

    socket.on('add_user',(customerId, userInfo)=>{
        addUser(customerId,socket.id,userInfo);
    })

})



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