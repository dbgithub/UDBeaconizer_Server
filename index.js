var server = require("./server");
var db_manager = require("./database");
var db_domain = "localhost"; // database domain
var db_port =  "5984" // database port
var server_port = "8888"; // Node.js server port
db_manager.initialize(db_domain, db_port);
server.start(server_port);
