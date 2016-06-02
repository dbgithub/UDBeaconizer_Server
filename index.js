var server = require("./server");
var db_manager = require("./database");
var db_domain = "localhost"; // database domain. IMPORTANT!: even though you the pouchdb server is started/run with host 0.0.0.0, the internal queries and access to database has to be through 'localhost'
var db_port =  "5984" // database port
var server_port = "8888"; // Node.js server port
db_manager.initialize(db_domain, db_port);
server.start(server_port);
