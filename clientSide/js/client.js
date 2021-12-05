
window.addEventListener('load', function() {

	//////////// SOCKET.IO /////////////////////////////////////////////////////// 

	const socket = io(); // NOTE: you MUST run by http://localhost:3000/index.html

	// [Client => Server] Send the data from client to server 
	function notifyToServer(event, data) {
		socket.emit(event, data);
	}

	notifyToServer('CLIENT_TO_SERVER_EVENT', JSON.stringify({ name:'sridhar', age: 40}));


	// [Client <= Server] Receive data from server to client
	socket.on("SERVER_TO_CLIENT_EVENT", async (data) => {
		const obj = JSON.parse(data);
		console.log(obj);
	});

	///////////////////// REST API /////////////////////////////////////////////////////////////////////////////////////
	////////////// Basic HTTP VERBS //////////////////////////////
	// 1. Get    : Get the data from server
	// 2. Post   : Add some data to server
	///////////// Extended HTTP VERBS /////////////////////
	// 3. Delete : (like Get) Delete the data from the server
	// 4. Put    : (like Post) Replace the existing data object by the new data object in the server.
	// 5. Patch  : (like Post) Make a minor correction/edit inside the object (property alteration) which is in the server
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	

	// 1a. GET(?): get user details by key value pair
	const getUserByName = async (keyValue) => {
		try {
				const response = await fetch('/api/getUserByQuery?' + keyValue); // or from browser: http://localhost:3000/api/getUserByQuery?name=Sridhar
				const data = await response.json();
				// enter you logic when the fetch is successful
				console.log(data);
			} catch(error) {
				// enter your logic for when there is an error (ex. error toast)
				console.log(error);
			}
	};

	getUserByName("name=Sridhar");

	// 1b. GET(/): get user details by user id value
	const getUserByValue = async (value) => {
		try {
				const response = await fetch('/api/getUserIdValue/' + value); // or from browser: http://localhost:3000/api/getUserIdValue/5ec3c7c
				const data = await response.json();
				// enter you logic when the fetch is successful
				console.log(data);
			} catch(error) {
				// enter your logic for when there is an error (ex. error toast)
				console.log(error);
			}
	};

	getUserByValue("5ec3c7c");

	// 2. POST: Add user - login method
	async function login(username, password) {
		// To handle an error in an async function, you MUST use try/catch
		try {
			// fetch() starts a request and returns a promise.
			// Warning: fetch does NOT FAIL even for the incorrect page url request (Page NOT found error) bcos it consider's as successfully HTTP request.
			// It throws error only if there is some network failure(not able to send the request / not able to receive response from the server).
			// Issues like "page not found" in server [eg: serverErrors (500–599),clientErrors (400–499)], you can only find by 'response.ok' and 'response.status' from the successful response msg.
			const response = await fetch('/api/login', {
											method: 'POST',
											headers: { 'Content-Type': 'application/json' },
											body: JSON.stringify({
																	username,
																	password
																 })
											});
			// 'response.ok == true' ONLY if status range 200-299
			if (!response.ok) throw Error(`An error has occured: ${response.status}`);
			// if (response.status < 200 && response.status > 299) throw Error(`An error has occured: ${response.status}`);

			const result = await response.json();
			console.log(result); // msg from Server
		}
		catch(e) {
			console.log(e);
		}
	}

	login("sridhar", "1234");

	// 3. DELETE:
	async function deleteItem(id) {
		try {
			let response = await fetch(`https://url/${id}`, { method: "DELETE" });
		} catch (err) {
		}
	}

	// 3. PUT:
	async function replaceItem(obj) {
		try {
			let response = await fetch(`/api/replaceData`, {
			//let response = await fetch(`/api/replaceData/${obj.myId}`, {
											method: "PUT",
											headers: { "Content-Type": "application/json" },
											body: JSON.stringify(todo)
										});
		} catch (err) {
		}
	}

	replaceItem({myId: 3456})

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	function myFunction() 
	{ 
		var name, age; 
		name = document.getElementById("inputName").value;
		age  = parseInt(document.getElementById("inputAge").value);
		document.getElementById("displayElement").innerHTML = name +" " + age; 
	}
}); // window.addEventListener('load', function() {
