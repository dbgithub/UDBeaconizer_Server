var PouchDB = require('pouchdb'); // PouchDB module. It allows us to work with PouchDB databases
var fs = require('fs'); // file system module. It allows us to work with local directories
// GLOBAL VARIABLES:
var _db_domain; // database domain
var _db_port; // // database port
var _dbstaff; // database for staff
var _dbrooms; // database for rooms
var _dbbeacons; // database for beacons
var _tuples; // text lines read from stafflist '.txt' file
var _jsondata; // json documents read from a '.json' file
// A tip about gloval variables. More info about global variables: http://www.hacksparrow.com/global-variables-in-node-js.html

function initialize(domain, port) {
    _db_domain = domain;
    _db_port = port;
    // Fetching the databases or creatin them for the first time:
    createDB("staff"); // This call creates the database for the firt time, reads staff list and loads the data into the database
                       // If it is not the first time, the database is just fetched
    createDB("rooms"); // This call creates the database for the firt time, reads staff list and loads the data into the database
                       // If it is not the first time, the database is just fetched
    createDB("beacons"); // This call creates the database for the firt time, reads staff list and loads the data into the database
                        // If it is not the first time, the database is just fetched
    // DBinfo(_dbstaff);
    // DBinfo(_dbrooms);
    // DBinfo(_dbbeacons);
    // deleteDB("staffdb");
    // deleteDB("roomsdb");
    // deleteDB("beaconsdb");
}

// FUNCTIONS:

// This function creates/fetches databases.
// There exists a local document within the database that says the sequence number of the database (the version), that is, the amount of changes done in the database.
function createDB(whichDB) {
    if (whichDB === "staff") {
        _dbstaff = new PouchDB('http://'+_db_domain+':'+_db_port+'/staffdb'); // Fetching or creating the database for staff.
        _dbstaff.info().then(function (result) {
            // handle result
            if (result.doc_count == 0) {readStaffFile("data/stafflist.txt", loadStaff);} // Now, we want to read the data from local, so taht we can load it to the database afterwards. We are passing 'loadBeacons' as a callback function to ensure synchronous operations
        }).catch(function (err) {
            console.log("error getting info about database:");
            console.log(err);
        });
    } else if (whichDB === "rooms") {
        _dbrooms = new PouchDB('http://'+_db_domain+':'+_db_port+'/roomsdb'); // Fetching or creating the database for rooms.
        _dbrooms.info().then(function (result) {
            // handle result
            if (result.doc_count == 0) {readJsonFile("data/rooms.json", loadRooms);} // Now, we want to read the data from local, so taht we can load it to the database afterwards. We are passing 'loadBeacons' as a callback function to ensure synchronous operations
        }).catch(function (err) {
            console.log("error getting info about database:");
            console.log(err);
        });
    } else if (whichDB === "beacons") {
        _dbbeacons = new PouchDB('http://'+_db_domain+':'+_db_port+'/beaconsdb'); // Fetching or creating the database for beacons.
        _dbbeacons.info().then(function (result) {
            // handle result
            if (result.doc_count == 0) {readJsonFile("data/beacons.json", loadBeacons);} // Now, we want to read the data from local, so taht we can load it to the database afterwards. We are passing 'loadBeacons' as a callback function to ensure synchronous operations
        }).catch(function (err) {
            console.log("error getting info about database:");
            console.log(err);
        });
    }
}

// Deletes the database given as an argument (in principle, just for developers)
function deleteDB(dbname) {
    dbase = new PouchDB('http://'+_db_domain+':'+_db_port+'/'+dbname+'');

    dbase.destroy().then(function (response) {
        // success
        console.log("Database deleted/removed successfully");
    }).catch(function (err) {
        console.log("error deleting the database:");
        console.log(err);
    });
}

// This function reads a txt file from local files:
function readStaffFile(file, loadStaff) {
    fs.readFile('./'+file, 'utf16le', function (err,data) { // list of encoding type: http://stackoverflow.com/questions/14551608/list-of-encodings-that-node-js-supports
        if (err) {
            console.log("error reading staff file:");
            return console.log(err);
        }
        _tuples = data.split("\n"); // It parses the text according to the given pattern returning an array. More info at: http://www.w3schools.com/jsref/jsref_split.asp
        // Heads up, the values you can store with JSON can be any of these: http://www.w3schools.com/json/json_syntax.asp
        loadStaff(); // Now we load the data into the database
    });
}

// This function reads a JSON file from local files:
function readJsonFile(file, loadData) {
    fs.readFile('./'+file, 'utf8', function (err,data) {
        if (err) {
            console.log("error reading json file:");
            return console.log(err);
        }
        _jsondata = JSON.parse(data); // Parse means going from JSON to javascript object
        // Heads up, the values you can store with JSON can be any of these: http://www.w3schools.com/json/json_syntax.asp
        loadData(); // Now we load the data into the database
    });
}

// This function saves the staff data in the database as JSON documents
function loadStaff() {
    var temp;
    for (i = 0; i < _tuples.length; i++) {
        temp = _tuples[i].split("|");
        _dbstaff.put({
            _id: temp[0].toLowerCase(), // Aqui tendría que sustituir las posibles tildes por caracteres sin tildes.
            name: temp[0],
            position: temp[1],
            faculty: temp[2],
            email: temp[3],
            extension: temp[4],
            phone: temp[5],
            fax: temp[6],
            office: temp[7],
            officehours: [
                {"start": "10:00", "end":"12:00"}, // This is an example, it should be removed and let teachers add it by themselves
                {"start": "16:00", "end":"18:00"} // This is an example, it should be removed and let teachers add it by themselves
            ],
            website: "www.example.deusto.es", // This is an example, it should be removed and let teachers add it by themselves
            linkedin: "www.linkedin.deusto.com", // This is an example, it should be removed and let teachers add it by themselves
            notes: "notes...", // This is an example, it should be removed and let teachers add it by themselves
            dtech: temp[8] == "true" // We are saving a pure Boolean instead of a string representing a boolean. '===' checks equality and type.
        }).then(function (response) {
            console.log("Correctly added STAFF document: " + response.id);
        }).catch(function (err) {
            console.log("error loading staff list:");
            console.log(err);
        });
    }
}

// This functions loads/saves the rooms document read from a file into the database
function loadRooms() {
    for (eachIndex in _jsondata) {
        _dbrooms.put(_jsondata[eachIndex]).then(function (response) {
            console.log("Correctly added JSON document:" + response.id);
        }).catch(function (err) {
            console.log("error adding json data:");
            console.log(err);
        });
    }
}

// This function loads/saves the beacons document read from a file into the database
function loadBeacons() {
    for (eachIndex in _jsondata) {
        _dbbeacons.put(_jsondata[eachIndex]).then(function (response) {
            console.log("Correctly added JSON document:" + response.id);
        }).catch(function (err) {
            console.log("error adding json data:");
            console.log(err);
        });
    }
}

// This funtion returns the "update_seq" value that corresponds to the version of the last changes of the database.
// "update_seq" indicates the total number of updates and inserts that were performed in the database.
// For each update of any of the documents and if new additions are done, this is represented in the "update_seq" variable.
function getSequenceNumber(dbname, callback) {
    if (dbname == "staff") {
        _dbstaff.info().then(function (result) {
            callback(result.update_seq);
            console.log("update_seq="+result.update_seq);
        }).catch(function (err) {
            console.log("error showing info of the database");
            console.log(err);
        });
    } else if (dbname == "rooms") {
        _dbrooms.info().then(function (result) {
            callback(result.update_seq);
        }).catch(function (err) {
            console.log("error showing info of the database");
            console.log(err);
        });
    } else if (dbname == "beacons") {
        _dbbeacons.info().then(function (result) {
            callback(result.update_seq);
        }).catch(function (err) {
            console.log("error showing info of the database");
            console.log(err);
        });
    }
}

// This function return the version number of the map.
// The purpose is to see whether it is necessary to updated the image in client-side.
// The returned value corresponds to the field in the room.json within the map object.
function getMapVersion(floor, callback) {
    _dbrooms.get("map"+floor).then(function (doc) {
        console.log("doc.version (remote)="+doc.v);
        callback(doc.v);
    }).catch(function (err) {
        console.log("error retrieving version of the map");
        console.log(err);
    });
}

// Shows databse info
function DBinfo(db) {
    db.info().then(function (result) {
        var str =
        "DB name: " + result.db_name + "\n" +
        "doc count: "+ result.doc_count + "\n" +
        "attachment format: " + result.idb_attachment_format + "\n" +
        "adapter: " + result.adapter + "\n" +
        "sqlite plugin: " + result.sqlite_plugin + "\n" +
        "websql encoding: " + result.websql_encoding;
        console.log(str)
    }).catch(function (err) {
        console.log("error showing info of the database");
        console.log(err);
    });
}

exports.initialize = initialize;
exports.getSequenceNumber = getSequenceNumber;
exports.getMapVersion = getMapVersion;
