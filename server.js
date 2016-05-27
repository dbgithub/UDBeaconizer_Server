var express = require('express');
var PouchDB = require('pouchdb');
var db_manager = require("./database");
var cors = require('cors'); // Esto no parece que influya

function start(port) {
	var app = express();
	app.use(cors({credentials: true, origin: '*'}));
	console.log("Express app created");

	app.get('/', function (req, res) {
		console.log("HelloWorld!");
		res.send('HelloWorld!');
	});

	// localhost:port/rooms?auth=admin
	app.get('/rooms', function(req, res) {
		var auth = req.query.auth; // req.param, req.body, req.query depending on the case, more info at: http://expressjs.com/en/api.html#req.query
		res.send("HelloWorld!");
	});

	// localhost:port/beacons?auth=admin
	app.get('/beacons', function(req, res) {
		var auth = req.query.auth; // req.param, req.body, req.query depending on the case, more info at: http://expressjs.com/en/api.html#req.query
		res.send("HelloWorld!");
	});

	// localhost:8080/staff?auth=admin
	app.get('/staff', function(req, res) {
		var auth = req.query.auth; // req.param, req.body, req.query depending on the case, more info at: http://expressjs.com/en/api.html#req.query
		console.log("Request 'staff' received!");
		if (auth == "admin") {
			ret = new PouchDB('http://'+"localhost"+':'+"5984"+'/staffdb');
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Headers", "X-Requested-With");
			res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

			res.send(ret);
		}
	});

	app.get('/staff/version', function(req, res) {
		var auth = req.query.auth; // req.param, req.body, req.query depending on the case, more info at: http://expressjs.com/en/api.html#req.query
		console.log("Request 'staff/version' received!");
		if (auth == "admin") {
			// var db = new PouchDB('http://'+"localhost"+':'+"5984"+'/staffdb');
			db_manager.getSequenceNumber("staffdb");
			setTimeout(function(){
				console.log("value="+db_manager.update_seq);
				res.send(db_manager.update_seq);
			},10)
		}
	});

	// localhost:port/maps?auth=admin
	app.get('/maps', function(req, res) {
		var auth = req.query.auth; // req.param, req.body, req.query depending on the case, more info at: http://expressjs.com/en/api.html#req.query

		res.send("hello?");
	});

	app.listen(port, function () {
		console.log("Server has started. Example app listening on port "+port+"!");
	});

}
exports.start = start;

//////////////////////////////////////////////
// More info about setting up a node.js server + express module:
// https://nodejs.org/en/about/
// http://expressjs.com/en/starter/hello-world.html
// http://coenraets.org/blog/2012/10/creating-a-rest-api-using-node-js-express-and-mongodb/
// https://scotch.io/tutorials/use-expressjs-to-get-url-and-post-parameters
// https://www.toptal.com/nodejs/why-the-hell-would-i-use-node-js
// http://www.programmableweb.com/news/how-to-create-restful-api-node.js/how-to/2014/06/11
// http://www.hongkiat.com/blog/node-js-server-side-javascript/
