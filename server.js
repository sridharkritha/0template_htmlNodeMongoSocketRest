	const express = require("express");
	const app = express();
	const httpServer = require("http").createServer(app); // explicitly create a 'http' server instead of using express() server

	app.use(express.json()); // for body parsing

	const path = require('path');
	const fs = require('fs');
	const { MongoClient } = require('mongodb');

	const formatMessage = require('./utils/chatMessage');
	const PORT = process.env.PORT || 3000;

	//////////////////////////////////////// SOCKET.IO SETUP ///////////////////////////////////////////////////////////
	const io = require("socket.io")(httpServer);

	// [Server => Client(S)] Notify all the connected clients
	function notifyAllUser(event, data) {
		io.emit(event, data);
	}

	notifyAllUser('SERVER_TO_CLIENT_EVENT', JSON.stringify({ name:'Jay', age: 7 }));


	// Client request for a new connection
	io.on('connection', async (socket) => {
		console.log('Server: A new client connected to me !');

		// when client(browser) closed/disconnect from the server
		socket.on('disconnect', function() {
			console.log('A Client has closed / disconnected from the Server !');
		});

		// [Client => Server] Receive data from client to server
		socket.on('CLIENT_TO_SERVER_EVENT', async (data) => {
			const obj = JSON.parse(data);
			console.log(obj);

			notifyAllUser('SERVER_TO_CLIENT_EVENT', JSON.stringify({ name:'Jay', age: 7 }));
		});
	});

	//////////////////////////////////////// REST API SETUP ////////////////////////////////////////////////////////////
	// Lookup is performed in the following order:
	// 	1. req.params
	// 	2. req.body
	// 	3. req.query

	// // https://expressjs.com/en/guide/routing.html
	// 1. param => "/cars/honda"  => returns a list of Honda car models
	// 3. query => "/car/honda?color=blue" => returns a list of Honda car models, but filter by blue Color.
	// 			NOT => "/car/honda/color/blue"

	// Passing parameters by 'body'
	app.post('/api/login', (req, res) => {
		const { username, password } = req.body; // Max.body size allowed is 100kb
		// send the data response to client 
		return res.json({ data: `Server: ${username} got your Post msg - ${password} from Client` });
	});

	// Passing parameters by query [key-value] (req.query):   ?name="sridhar"
	app.get('/api/getUserByQuery', (req, res) => {
		const { query } = req;		 // 'query': It is an in-build property from 'HTTP get' 
		const username = query.name; // http://localhost:3000/api/getUserByQuery?name=Sridhar
		// send the data response to client 
		return res.json({ data: `Server: ${username} got your GET msg from Client` });
	});

	// Passing parameters by "named route"(req.params):    /5ec3c7c
	app.get('/api/getUserIdValue/:someIdValue', (req, res) => {
		// params is an object NOT a string. Bcos Express() by default converts the string to object by decodeUriComponent().
		const { params } = req;				 // 'params': It is an in-build property from 'HTTP get' 
		const username = params.someIdValue; // http://localhost:3000/api/getUserIdValue/5ec3c7c
		// send the data response to client 
		return res.json({ data: `Server: ${username} got your GET msg from Client` });
	});

	app.put('/api/replaceData', (req, res) => {
	//app.put('/api/replaceData/:someIdValue', (req, res) => {
		const { params } = req;				 // 'params': It is an in-build property from 'HTTP get' 
		const username = params.someIdValue; // http://localhost:3000/api/replaceData/3456
		// send the data response to client 
		return res.json({ data: `Server: ${username} got your GET msg from Client` });
	});

	// GET method route
	app.get('/', function (req, res) {
		res.send('GET request to the homepage');
	});


	
	
	
	
	
	
	
	
	
	

	//////////////////////////////////////// FILE API SETUP ////////////////////////////////////////////////////////////
	// Read json file by 'fs' module
	fs.readFile('db/sportsDB.json', 'utf8', function (err, data) {
		if (err) {
			console.error("Unable to read the json file");
			throw err;
		}
		console.log("Read the local json successfully");
		const jsonObject = JSON.parse(data);
		// console.log(jsonObject);
	});
	//////////////////////////////////////// MONGODB CONNECTION SETUP //////////////////////////////////////////////////
	// 1. Mongo: Local database
	// const database = 'mongodb://localhost:27017/';
	// 2. Mongo: Atlas database
	// Connection URI <username>, <password>, and <your-cluster-url>.
	const databaseURI = 'mongodb+srv://sridharkritha:2244@cluster0.02kdt.mongodb.net/';
	const MONGO_DATABASE_NAME = 'chatApp';
	const MONGO_COLLECTION_NAME = 'chats';       // collection to store all chats
	const userCollection = 'onlineUsers'; // collection to maintain list of currently online users
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
	MongoClient.connect(databaseURI, (err,db) => {
		if (err) throw err;

		var onlineUsers = db.db(dbname).collection(userCollection);
		var chat = db.db(dbname).collection(chatCollection);


		(async () => {
			console.log("****** updateOne: push the chat messages ****************");
			// updateOne & { upsert: true }
			// Method 2: All messages are pushed in a single array under 2 user name's unique string

			let dotString = `unreadMsgCount.${dataElement.to}`; // dynamic property name

			let result = await chat.findOneAndUpdate({ "chatHistoryUniqueStr": dataElement.chatHistoryUniqueStr }, {  $inc: { [dotString]: 1 }, $push: { "history": dataElement }}, { upsert: true, returnDocument: "after" } );
			if(result.ok && !result.lastErrorObject.updatedExisting) {
				dataElement.unreadMsgCount = result.value.unreadMsgCount;
				socket.emit('message',dataElement);    // emits message back to the user for display
				console.log("History array has been created!!!...");
			}
			else if(result.ok && result.lastErrorObject.updatedExisting) {
				dataElement.unreadMsgCount = result.value.unreadMsgCount;
				socket.emit('message',dataElement);    // emits message back to the user for display
				console.log("History array updated!!!...");
			}
			else {
				console.error("Error in adding the user message to the History array");
				console.log(result);
			}

			// let result = await chat.updateOne({ "chatHistoryUniqueStr": dataElement.chatHistoryUniqueStr }, { $inc: obj,$push: { "history": dataElement }}, { upsert: true } );
			// let result = await chat.updateOne({ "chatHistoryUniqueStr": dataElement.chatHistoryUniqueStr }, { $push: { "history": dataElement }}, { upsert: true } );

			// if(!result.matchedCount &&result.upsertedCount) {
			// 	socket.emit('message',dataElement);    // emits message back to the user for display
			// 	console.log("History array has been created!!!...");
			// }
			// else if(result.matchedCount && result.modifiedCount) {
			// 	socket.emit('message',dataElement);    // emits message back to the user for display
			// 	console.log("History array updated!!!...");
			// 	console.log(`${result.matchedCount} document(s) matched the query criteria.`);
			// 	console.log(`${result.modifiedCount} document(s) was/were updated.`);
			// }
			// else {
			// 	console.error("Error in adding the user message to the History array");
			// 	console.log(result);
			// }

		////////////////////////////////////////////////////////////////////////////////////////////////////////

		console.log("****** findOne: find the user 'to' address ****************");
		onlineUsers.findOne({"name": data.toUser}, (err,res) => { // checks if the recipient of the message is online
			if(err) throw err;
			if(res != null) // if the recipient is found online, the message is emmitted to him/her
				socket.to(res.ID).emit('message',dataElement);
		});

		db.close();

		})();

	});
////////////////////////////////////

	// Populate the friend you had some chat in the past
	MongoClient.connect(databaseURI, function(err, db) {
			if (err) throw err;

			(async () => {
				console.log("FIND & REGEX -----START");

				// 5. Correct: findOne - return promise in separated form
				var currentCollection = db.db(dbname).collection(chatCollection);
				const str = '##' + data.fromUser + '##'; // "##sridhar##"
				const regexObj = new RegExp(str);        // /##sridhar##/

				let dynObj = {_id: false, chatHistoryUniqueStr : true, unreadMsgCount: true };
				// let cursor = currentCollection.find({ chatHistoryUniqueStr: { $regex: /##sridhar##/} } );
				let cursor = currentCollection.find({ chatHistoryUniqueStr: { $regex: regexObj} } , { projection: dynObj } );  // "##kavitha##sridhar##houseSale"  ==> ##sridhar##
				let res = await cursor.toArray();
				// console.table(res);
				console.table(res);
				socket.emit('populateFriendContact_client', res); // emits the entire chatHistoryUniqueStr which has '##sridhar##'
				console.log("FIND & REGEX -----END");
			})();

			db.close();
	});
//////////////////////////////////////////////////////////

	// checks if a new user has logged in and receives the established chat details

	// https://docs.mongodb.com/drivers/node/current/usage-examples/insertOne/
	// https://stackoverflow.com/questions/60771991/insert-update-and-remove-vs-insertone-updateone-and-deleteone-or-many
	MongoClient.connect(databaseURI, (err,db) => {
		if(err) throw err;

		var onlineUser = { // forms JSON object for the user details
			"ID":socket.id,
			"name":data.fromUser
		};
		var currentCollection = db.db(dbname).collection(chatCollection);
		var online = db.db(dbname).collection(userCollection);

		// Method 1: Append the existing user with new socket id (Wrong approach - same user will have different socket id's)
		// online.insertOne(onlineUser,(err,res) => { // inserts the logged in user to the collection of online users
		// 	if(err) throw err;
		// 	console.log(onlineUser.name + " is online...");
		// });
		////////////////////////////////////////////////////////////////////////////////////////////////////////

		(async () => {
			console.log("****** updateOne: update the online user socket id ****************");
			// Method 2: updateOne & { upsert: true }
			// 1. f user is already exist then UPDATE the user with old 'socket.id' by new 'socket.id' 
			// 2. f user is NOT exist then INSERT both 1. { "name": data.fromUser } and 2. { "ID":socket.id }.  
			// let result = await online.updateOne({ "name": data.fromUser }, { $set: onlineUser }, { upsert: true });
			let result = await online.updateOne({ "name": data.fromUser }, { $set: {"ID":socket.id}  }, { upsert: true });

			if(!result.matchedCount &&result.upsertedCount) console.log(onlineUser.name + " is online...");
			else if(result.matchedCount && result.modifiedCount) {
				console.log(onlineUser.name + " is online...");
				console.log(`${result.matchedCount} document(s) matched the query criteria.`);
				console.log(`${result.modifiedCount} document(s) was/were updated.`);
				
			}
			else if(result.matchedCount && !result.modifiedCount) {
				console.log(onlineUser.name + " is online...");
			}
			else {
				console.error("Error in Adding the User");
				console.log(result);
			}

			// console.log("****** find: find all full document which has chat history ****************");
			// const user = currentCollection.find().toArray();
			// console.log(data.chatHistoryUniqueStr);
			// console.log(user);
		})();
		////////////////////////////////////////////////////////////////////////////////////////////////////////

		// db:
		// {
		// 	"from":"sridhar",
		// 	"to":"kavitha",
		// 	"message":"Sridhar is my name",
		// 	"date":"2021-11-23",
		// 	"time":"03:23 pm"
		// },
		// {....}

		// // finds the entire chat history between the two people
		// currentCollection.find({ 
		// 	"from" : { "$in": [data.fromUser, data.toUser] },
		// 	"to" : { "$in": [data.fromUser, data.toUser] }
		// },{projection: {_id:0}}).toArray((err,res) => {             // Convert the "array of docs" to JS "array of objects"
		// 	if(err)
		// 		throw err;
		// 	else {
		// 		//console.log(res);
		// 		socket.emit('output',res); // emits the entire chat history to client
		// 	}
		// });


		// currentCollection.find({ "chatHistoryUniqueStr": data.chatHistoryUniqueStr}).history.toArray((err,res) => {             // Convert the "array of docs" to JS "array of objects"
		// 	if(err)
		// 		throw err;
		// 	else {
		// 		console.log("sriiiiiii"+res);
		// 		socket.emit('output',res); // emits the entire chat history to client
		// 	}
		// });

		(async () => {
			console.log("FETCH-----START");

			// 1. WRONG: find() return 'cursor' NOT promise so do NOT use await here.
			// MongoError: pool is draining, new operations prohibited
			// let res = await currentCollection.find({ "chatHistoryUniqueStr": data.chatHistoryUniqueStr});

			// 2. Correct: toArray() return 'promise' so use promise
			// let res = await currentCollection.find({ "chatHistoryUniqueStr": data.chatHistoryUniqueStr}).toArray();
			// 3. Correct - separated form
			// let cursor = currentCollection.find({ "chatHistoryUniqueStr": data.chatHistoryUniqueStr});
			// res = await cursor.toArray();
			// console.table(res);

			// 4. Wrong: findOne - return promise but history is NOT return promise so you should write in separated form
			// let res = await currentCollection.findOne({ "chatHistoryUniqueStr": data.chatHistoryUniqueStr}).history;

			// 5. Correct: findOne - return promise in separated form
			let res = await currentCollection.findOne({"chatHistoryUniqueStr": data.chatHistoryUniqueStr});
			if(res && res.history) {
				console.table(res.history);
				socket.emit('output', res.history); // emits the entire chat history to client
			}
			else {
				console.log("There is NO chat history between the users: " + data.fromUser + " / "+ data.toUser);
			}


			// var cursor = coll.find();
			// cursor.nextObject(function(err, first_match) {});
			// cursor.each(function(err, document) {});
			// cursor.toArray(function(err, all_documents) {});

			// var stream = collection.find().streamRecords();
			// stream.on("data", function(document) {});     // why  data   and not  readable ? See text!
			// stream.on("end", function() {});
		})();

		db.close();
	});
///////////////////////////////////////////////////////////

	MongoClient.connect(databaseURI, function(err, db) {
		if (err) throw err;

		console.log("****** deleteOne: Remove the user from DB who went offline ****************");
		var onlineUsers = db.db(dbname).collection(userCollection);
		var myquery = {"ID":userID};
		onlineUsers.deleteOne(myquery, function(err, res) { // if a user has disconnected, he/she is removed from the online users' collection
			if (err) throw err;
			console.log("User " + userID + "went offline...");
			db.close();
		});
	});
*/
	//////////////////////////// SERVER IS LISTENING ////////////////////////////////////////////////////////////

	app.use(express.static(path.join(__dirname,'clientSide')));

	// httpServer.listen(PORT, () => {
	// 	console.log(`Chat Server listening to port ${PORT}...`);
	// });

	// ....................................................................................................................
		// Server listen at the given port number
		httpServer.listen(PORT, async () => {
			console.log("ChallengeBets P2P Betting Server is running on the port : " + httpServer.address().port);
	
			// The Mongo Client you will use to interact with your database
			client = new MongoClient(databaseURI, { useNewUrlParser: true, useUnifiedTopology: true });
	
			try {
					await client.connect();
					console.log("Cluster connection                                      : Success");
	
					DB = client.db(MONGO_DATABASE_NAME);
					if(!DB) {
						console.log(`Database - ${MONGO_DATABASE_NAME} - connection error`);
						return console.error(DB);
					}
					console.log(`Database(${MONGO_DATABASE_NAME}) connection        : Success`);
	
					COLL = DB.collection(MONGO_COLLECTION_NAME);
					if(!COLL) {
						console.log(`Collection - ${MONGO_COLLECTION_NAME} - connection error`);
						return console.error(COLL);
					}
					console.log(`Collection(${MONGO_COLLECTION_NAME}) connection          : Success`);
	
					// drop a collection and upload data from the json
	
	
					// dropAllDocuments(client, MONGO_DATABASE_NAME, MONGO_COLLECTION_NAME);
					// uploadLocalJsonCollectionToDB(client, MONGO_DATABASE_NAME, MONGO_COLLECTION_NAME); // 0. Upload json doc(a set of collection) to db
		
			} catch(e) {
				console.error(e);
			}
			
		});