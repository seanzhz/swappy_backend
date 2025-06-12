const userModel = require("../models/userModel");
const userChatModel = require("../models/userChatModel");
const messageModel = require("../models/messageModel");
const {responseReturn} = require("../utilities/response");


class ChatController {
    add_customer_friend = async (req, res) => {
        const {sellerId, userId} = req.body; //userID = me

        try{
            if(sellerId !== ''){
                const seller = await userModel.findById(sellerId);
                const user = await userModel.findById(userId);
                const checkConnection = await userChatModel.findOne({
                    $and: [
                        {
                            myId: {
                            $eq : userId
                            }
                            },{
                            myFriendId: {
                            $elemMatch: {
                                friendId: sellerId
                            }
                        }
                        }
                    ]
                });

                if(!checkConnection){
                    await userChatModel.updateOne({
                        myId: userId
                    },{
                        $push: {
                            myFriendId: {
                                friendId: sellerId,
                                name: seller.username,
                                image: seller.image //TODO: IMAGE DISPLAY
                            }
                        }
                    })
                }else{
                    console.log('These two user Already connected');
                }

                //PASSIVE ADD被动添加
                const checkConnection_a = await userChatModel.findOne({
                    $and: [
                        {
                            myId: {
                                $eq : sellerId
                            }
                        },{
                            myFriendId: {
                                $elemMatch: {
                                    friendId: userId
                                }
                            }
                        }
                    ]
                });

                if(!checkConnection_a){
                    await userChatModel.updateOne({
                        myId: sellerId
                    },{
                        $push: {
                            myFriendId: {
                                friendId: userId,
                                name: user.username,
                                image: user.image //TODO: IMAGE DISPLAY
                            }
                        }
                    })
                }else{
                    console.log('These two user Already connected');
                }
                const message = await messageModel.find({
                    $or: [
                        {
                           $and: [
                               {receiverId: {$eq:sellerId}},
                               {senderId: {$eq:userId}}
                           ]
                        },
                        {
                            $and: [
                                {receiverId: {$eq:userId}},
                                {senderId: {$eq:sellerId}}
                            ]
                        }
                    ]
                })

                const myFriend = await userChatModel.findOne({
                    myId: userId
                })
                const currentFriend = myFriend.myFriendId.find(friend => friend.friendId === sellerId)

                responseReturn(res, 200, {
                    myFriends: myFriend.myFriendId,
                    currentFriend,
                    message
                })
            }else{
                const myFriend = await userChatModel.findOne({
                    myId: userId
                })
                responseReturn(res, 200, {
                    myFriends: myFriend.myFriendId
                })
            }
        }catch(err){
            console.log(err);
        }
    }
    // END

    send_message = async (req, res) => {

        const {userId,sellerId,content} = req.body;

        //get io and allCustomer from req
        const io = req.io;
        const allCustomer = req.allCustomer;

        try{
            //Store chat into Mango DB
            const message = await messageModel.create({
                senderId: userId,
                receiverId: sellerId,
                message: content
            })

            // update priority - actively
            const data = await userChatModel.findOne({
                myId: userId
            })
            let myFriends = data.myFriendId;
            let index = myFriends.findIndex(friend => friend.friendId === sellerId)
            while( index >0 ){
                let temp = myFriends[index];
                myFriends[index] = myFriends[index-1];
                myFriends[index-1] = temp;
                index--;
            }
            await userChatModel.updateOne({
                myId: userId
            },{
                myFriendId: myFriends
            })

            //receiver update the priority
            const data1 = await userChatModel.findOne({
                myId: userId
            })
            let myFriends1 = data1.myFriendId;
            let index1 = myFriends1.findIndex(friend => friend.friendId === sellerId)
            while( index1 >0 ){
                let temp1 = myFriends1[index1];
                myFriends1[index1] = myFriends[index1-1];
                myFriends1[index1-1] = temp1;
                index1--;
            }
            await userChatModel.updateOne({
                myId: sellerId
            },{
                myFriendId: myFriends1
            })

            // broadcast to all online receiver
            // find receiver ID from allCustomer
            const recipient = allCustomer.find(item => item.customerId === sellerId);
            if (recipient) {
                io.to(recipient.socketId).emit("receive_message", {
                    messageId: message._id,
                    senderId: userId,
                    receiverId: sellerId,
                    content: message.message,
                    createdAt: message.createdAt
                });
            }
            //Return HTTP Response
            responseReturn(res, 201, {message})
        }
        catch (e) {
            console.error("send_message error:", e);
            responseReturn(res, 500, { error: "Failed to send message" });
        }
    }

    //fetch historical messages
    fetch_messages = async (req, res) => {
        const { userId, friendId } = req.body;
        try {
            const messages = await messageModel.find({
                $or: [
                    { senderId: userId,   receiverId: friendId },
                    { senderId: friendId, receiverId: userId   }
                ]
            }).sort({ createdAt: 1 });  // 按时间升序

            responseReturn(res, 200, { messages });
        } catch (err) {
            console.error(err);
            responseReturn(res, 500, { error: 'Failed to fetch messages' });
        }
    }
}

module.exports = new ChatController();