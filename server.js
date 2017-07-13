var express = require('express');
var PouchDB = require('pouchdb');
var bodyParser = require('body-parser'); // More info about body-parser: https://scotch.io/tutorials/use-expressjs-to-get-url-and-post-parameters
var db_manager = require("./database");
var cors = require('cors'); // More info about configuring CORS: https://www.npmjs.com/package/cors
const https = require('https'); // More info about HTTPS requests (POST, GET) at: https://nodejs.org/api/https.html#https_https_get_options_callback
const _webClientID = '473073684258-jss0qgver3lio3cmjka9g71ratesqckr.apps.googleusercontent.com'; // This is a client ID created in Google's Developer page as a credential. This one is for WEB applications.

// Info about working with buffers:
// https://nodejs.org/api/buffer.html
// https://docs.nodejitsu.com/articles/advanced/buffers/how-to-use-buffers/
// More info about RESPONSE objects:
// http://www.tutorialspoint.com/nodejs/nodejs_response_object.htm
// Don't forget you can also return a reference to a database:
// ret = new PouchDB('http://'+"0.0.0.0"+':'+"5984"+'/staffdb');
// res.send(ret);
function start(port) {
	var app = express();
	app.use(cors({credentials: true, origin: '*'})); // Here, CORS is being configured
	console.log("Express app created");

	app.use(bodyParser.json()); // support json encoded bodies
	app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

	app.use('/maps', express.static('data/img'));
	app.use('/policy', express.static('policy'));

	app.get('/', function (req, res) {
		console.log("HelloWorld!");
		res.send('HelloWorld!');
	});

	// e.g. localhost:8080/staff/version?auth=admin
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

	// e.g. localhost:8080/rooms/version?auth=admin
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

	// e.g. localhost:8080/beacons/version?auth=admin
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

	// e.g. localhost:8080/rooms/mapversion/2?auth=admin
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

	// e.g. localhost:8080/editcontact?auth=admin
	app.post('/editcontact', function(req, res) {
		var auth = req.query.auth; // req.param, req.body, req.query depending on the case, more info at: http://expressjs.com/en/api.html#req.query
		console.log("Request 'editcontact' received!");
		if (auth == "admin") {
			// Firstly, we verify the identity of the user:
			// req.body[0] = this is the ID token of the signed in user.
			authenticateuser(req.body[0], function(signedinuser) {
				// Now, we save the changes done on a contact:
				// req.body[1] = this is the changes dictionary where all the new changes are recorded
				// req.body[2] = this is the data structure representing the contact (name, faculty, email...)
				// In summary, the NEW and the OLD data.
				if(signedinuser != undefined) {
					// This conditional statement means the authentication was successful
					// The parameters we are passing are: IDtoken, the user's Google account (with all details), the changes done in the contact page of the app and finally, the contact's original data in the app.
					db_manager.putEditedContact(signedinuser,req.body[1], req.body[2], function(doc) {
						res.status(200).send(doc); // We send the edited staff to Client side to let it know all operations were succesfuly done.
						// res.sendStatus(200); // equivalent to res.status(200).send('OK')
					});
				}
			}, function(error_status) {
				// Here we assume that the authentication against Google's server failed. Then, we send back the error code.
				res.status(error_status).end();
			});
		}
	});

	app.listen(port, function () {
		console.log("Server has started. Example app listening on port "+port+"!");
	});
}

// This function authenticates the user by means of ID Token. The whole process is explained here:
// https://developers.google.com/identity/sign-in/web/backend-auth
// In short, the ID token is used to authenticate, because is not secure (nor good practise) sending the user ID (in which I'm interested) to the backend.
// The token ID is from the user who has just signed in. This token is intended to navigate Internet without problems, the propper/standard way of doing things is verifying the token agains Google's servers and retrieve User's information on server side.
function authenticateuser(idtoken, callback, errorCallback) {
	var options = {
		hostname: 'www.googleapis.com',
		port: 443,
		path: '/oauth2/v3/tokeninfo?id_token='+idtoken.toString(),
		method: 'POST'
	};
	var status = null;
	// More info about the request at: https://nodejs.org/api/https.html#https_https_get_options_callback
	var req = https.request(options, (res) => {
		// Now, we're checking whether the request was done successfuly or there was an Internet connection problem.
		// If status code is 4xx, then we end the request and send the status code back to the client side.
		console.log('Server side Token authentication status code:', res.statusCode);
		if (res.statusCode.toString().startsWith("4")) {
			errorCallback(res.statusCode);
		} else {
			// console.log('headers:', res.headers);
			res.on('data', (d) => {
				// process.stdout.write(d); // prints the data in the console
				d = JSON.parse(d);
				if (d.aud == _webClientID) {
					// Authentication success
					callback(d);
					// Fields cointained in 'd':
					// - iss, sub, azp, aud, iat, exp
					// And user's information:
					// - email, email_verified, name, picture, given_name, family_name and locale
				}
			});
		}
	});
	req.end();
	req.on('error', (e) => {
		console.log("Error on 'authenticateuser', POST query:");
		console.error(e);
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
