var express = require('express');
var PouchDB = require('pouchdb');
var bodyParser = require('body-parser');
var db_manager = require("./database");
var db_manager = require("./database");
var cors = require('cors'); // More info about configuring CORS: https://www.npmjs.com/package/cors

function start(port) {
	var app = express();
	app.use(cors({credentials: true, origin: '*'})); // Here, CORS is being configured
	console.log("Express app created");

	app.use(bodyParser.json()); // support json encoded bodies
	app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

	app.use('/maps', express.static('data/img'));
	// Extra code. Old code to possibly read images:
	// 'data' is what has been read from 'fs.readFile()'
	// res.writeHead(200, {'Content-Type': 'image/png'}); // Esto no lo llegue nunca a utilizar podria ser una posibilidad.
	// buf_str = new Buffer.from(data).toString('base64');
	// res.end(buf_str, "base64"); // Send the image file back to client-side.
	// More info about working with buffers:
	// https://nodejs.org/api/buffer.html
	// https://docs.nodejitsu.com/articles/advanced/buffers/how-to-use-buffers/
	// More info about RESPONSE objects:
	// http://www.tutorialspoint.com/nodejs/nodejs_response_object.htm

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
			ret = new PouchDB('http://'+"0.0.0.0"+':'+"5984"+'/staffdb');
			res.send(ret);
		}
	});

	// localhost:8080/staff/version?auth=admin
	app.get('/staff/version', function(req, res) {
		var auth = req.query.auth; // req.param, req.body, req.query depending on the case, more info at: http://expressjs.com/en/api.html#req.query
		console.log("Request 'staff/version' received!");
		if (auth == "admin") {
			db_manager.getSequenceNumber("staff", function (value) {
				console.log("value="+value); // More info about global variables: http://www.hacksparrow.com/global-variables-in-node-js.html
				res.send(value.toString());
			});
		}
	});

	// localhost:8080/rooms/version?auth=admin
	app.get('/rooms/version', function(req, res) {
		var auth = req.query.auth; // req.param, req.body, req.query depending on the case, more info at: http://expressjs.com/en/api.html#req.query
		console.log("Request 'rooms/version' received!");
		if (auth == "admin") {
			db_manager.getSequenceNumber("rooms", function (value) {
				console.log("value="+value); // More info about global variables: http://www.hacksparrow.com/global-variables-in-node-js.html
				res.send(value.toString());
			});
		}
	});

	// localhost:8080/beacons/version?auth=admin
	app.get('/beacons/version', function(req, res) {
		var auth = req.query.auth; // req.param, req.body, req.query depending on the case, more info at: http://expressjs.com/en/api.html#req.query
		console.log("Request 'beacons/version' received!");
		if (auth == "admin") {
			db_manager.getSequenceNumber("beacons", function (value) {
				console.log("value="+value); // More info about global variables: http://www.hacksparrow.com/global-variables-in-node-js.html
				res.send(value.toString());
			});
		}
	});

	// localhost:8080/rooms/mapversion/2?auth=admin
	app.get('/rooms/mapversion/:v', function(req, res) {
		var auth = req.query.auth; // req.param, req.body, req.query depending on the case, more info at: http://expressjs.com/en/api.html#req.query
		console.log("Request 'rooms/mapversion' received!");
		if (auth == "admin") {
			var floor = req.params.v;
			db_manager.getMapVersion(floor.toString(), function (value) {
				console.log("value="+value); // More info about global variables: http://www.hacksparrow.com/global-variables-in-node-js.html
				res.send(value.toString());
			});
		}
	});

	// localhost:8080/editcontact?auth=admin
	// localhost:8080/editcontact
	app.post('/editcontact', function(req, res) {
		// var auth = req.query.auth; // req.param, req.body, req.query depending on the case, more info at: http://expressjs.com/en/api.html#req.query
		console.log("Request 'editcontact' received!");
		// if (auth == "admin") {
			// db_manager.getSequenceNumber("beacons", function (value) {
			// 	console.log("value="+value); // More info about global variables: http://www.hacksparrow.com/global-variables-in-node-js.html
			res.send("mensaje recibido:"+req.body);
			// });
		// }
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
