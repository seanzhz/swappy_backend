const sellerModel = require("../models/sellerModel");
const sellerCustomerModel = require("../models/sellerCustomerModel");
const messageModel = require("../models/messageModel");
const {responseReturn} = require("../utilities/response");


class ChatController {
    add_customer_friend = async (req, res) => {
        const {sellerId, userId} = req.body; //userID = me

        try{
            if(sellerId !== ''){
                const seller = await sellerModel.findById(sellerId);
                const user = await sellerModel.findById(userId);
                const checkConnection = await sellerCustomerModel.findOne({
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
                    await sellerCustomerModel.updateOne({
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
                const checkConnection_a = await sellerCustomerModel.findOne({
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
                    await sellerCustomerModel.updateOne({
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

                const myFriend = await sellerCustomerModel.findOne({
                    myId: userId
                })
                const currentFriend = myFriend.myFriendId.find(friend => friend.friendId === sellerId)

                responseReturn(res, 200, {
                    myFriends: myFriend.myFriendId,
                    currentFriend,
                    message
                })
            }else{
                const myFriend = await sellerCustomerModel.findOne({
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
        //console.log(req.body);
        const {userId,sellerId,content} = req.body;

        try{
            const message = await messageModel.create({
                senderId: userId,
                receiverId: sellerId,
                message: content
            })
            //responseReturn(res, 200, {message})
            //Set new priority - actively
            const data = await sellerCustomerModel.findOne({
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
            await sellerCustomerModel.updateOne({
                myId: userId
            },{
                myFriendId: myFriends
            })

            //passive update the priority
            const data1 = await sellerCustomerModel.findOne({
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
            await sellerCustomerModel.updateOne({
                myId: sellerId
            },{
                myFriendId: myFriends1
            })

            responseReturn(res, 201, {message})
        }
        catch (e) {

        }

    }

    // 新增：拉取历史消息
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