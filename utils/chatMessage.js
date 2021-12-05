	// const moment = require('moment');

	const formatMessage = (data) => {
		msg = {
			from:data.fromUser,
			to:data.toUser,
			chatTopic: data.chatTopic,
			chatHistoryUniqueStr: data.chatHistoryUniqueStr,
			message:data.msg,
			// date: moment().format("YYYY-MM-DD"),
			// time: moment().format("hh:mm a")
		};
		return msg;
	};

	module.exports=formatMessage;


//////////////////////////// Utility Functions (start) /////////////////////////////////////////////////////////////
	function randomIntFromInterval(min, max) { // min and max included 
		return Math.floor(Math.random() * (max - min + 1) + min);
	}


		//////////////////////////// Utility Functions (end) ///////////////////////////////////////////////////////////////