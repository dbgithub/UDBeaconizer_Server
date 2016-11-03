var PouchDB = require('pouchdb'); // PouchDB module. It allows us to work with PouchDB databases
var fs = require('fs'); // file system module. It allows us to work with local directories
var server = require('./server') // a variable to access methods from 'server.js' file
// GLOBAL VARIABLES:
var _db_domain; // database domain
var _db_port; // // database port
var _dbstaff; // database for staff
var _dbrooms; // database for rooms
var _dbbeacons; // database for beacons
var _dbchanges; // database for information changes
var _tuples; // text lines read from stafflist '.txt' file
var _jsondata; // json documents read from a '.json' file
// A tip about gloval variables. More info about global variables: http://www.hacksparrow.com/global-variables-in-node-js.html

function initialize(domain, port) {
    _db_domain = domain;
    _db_port = port;
    // Fetching the databases or creatin them for the first time:
    createDB("staff"); // This call creates the database for the firt time, reads staff list and loads the data into the database
                       // If it is not the first time, the database is just fetched
    createDB("rooms"); // This call creates the database for the firt time, reads rooms list and loads the data into the database
                       // If it is not the first time, the database is just fetched
    createDB("beacons"); // This call creates the database for the firt time, reads beacons JSON document and loads the data into the database
                        // If it is not the first time, the database is just fetched
    createDB("changes"); // This call creates the database for the first time. It does not read anything becasue at the begining of time there
                        // are not changes recorded. As soon as people start chaning or editing content, JSON documents will be added.
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
    } else if (whichDB === "changes") {
        _dbchanges = new PouchDB('http://'+_db_domain+':'+_db_port+'/changesdb'); // Fetching or creating the database for beacons.
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
function readJsonFile(file, callback) {
    fs.readFile('./'+file, 'utf8', function (err,data) {
        if (err) {
            console.log("error reading json file:");
            return console.log(err);
        }
        _jsondata = JSON.parse(data); // Parse means going from JSON to javascript object
        // Heads up, the values you can store with JSON can be any of these: http://www.w3schools.com/json/json_syntax.asp
        callback(); // Now we load the data into the database
    });
}

// This function saves the staff data in the database as JSON documents
function loadStaff() {
    var temp;
    for (i = 0; i < _tuples.length; i++) {
        temp = _tuples[i].split("|");
        _dbstaff.put({
            _id: temp[0].toLowerCase(), // Aqui tendría que sustituir las posibles tildes por caracteres sin tildes.
            name: (temp[0].trim() == "") ? null : temp[0],
            position: (temp[1].trim() == "") ? null : temp[1],
            faculty: (temp[2].trim() == "") ? null : temp[2],
            email: (temp[3].trim() == "") ? null : temp[3],
            extension: (temp[4].trim() == "") ? null : temp[4],
            phone: (temp[5].trim() == "") ? null : temp[5],
            fax: (temp[6].trim() == "") ? null : temp[6],
            office: (temp[7].trim() == "") ? null : temp[7],
            officehours: [
                "09,00,10,00", // This is an example (it means: 9:00 - 10:00), it should be removed and let teachers add it by themselves
                "16,00,18,00" // This is an example (it means: 16:00 - 18:00), it should be removed and let teachers add it by themselves
            ],
            website: "www.example.deusto.es", // This is an example, it should be removed and let teachers add it by themselves
            linkedin: "www.linkedin.deusto.com", // This is an example, it should be removed and let teachers add it by themselves
            notes: "notes...", // This is an example, it should be removed and let teachers add it by themselves
            dtech: temp[8].trim() === "true" // We are saving a pure Boolean instead of a string representing a boolean. '===' checks equality and type, thus, resulting in a real boolean, not a string.
                                                // We use 'trim' because is the last item/word of the sentence and it tends to pick up invisible (unwanted) characters, something that corrupts the JSON file somehow.
        }).then(function (response) {
            console.log("Correctly added STAFF document: " + response.id);
        }).catch(function (err) {
            console.log("error loading staff list (i="+i+"):");
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

// This functions inserts/puts a record in the 'Changes' database regarding a change made on a certain contact.
// The information stored is: name, email and userid of the user who is performing the changes, plus the timestamp and an array of changes
// with the BEFORE and AFTER statements, so that we know what changes have been made. The "_id" is the email of who performed the changes + the date.
//  "changes" Object (changes_dictionary["officehours"] in client side) will have rows with any of the following possible content:
// · Useful information regarding 'officehours', e.g '23','00','14','15'
// · -1 -> This corresponds to the rows that were not changed by the user but were loaded at the begining (info coming from the DB)
// · NULL -> This corresponds to the rows that were intentionally deleted by the user
// Remember that (http://www.w3schools.com/js/js_datatypes.asp):
// null === undefined -> false
// null == null -> true
// null == undefined -> true !!
function putEditedContact(signedInUser, changes, person, callback) {
    var d = new Date();
        var hour = (d.getHours() <10) ? "0"+d.getHours() : ""+d.getHours();
        var minutes = (d.getMinutes() <10) ? "0"+d.getMinutes() : ""+d.getMinutes();
        var secs = (d.getSeconds() <10) ? "0"+d.getSeconds() : ""+d.getSeconds();
    var dstr = d.getDate() + "/" + (d.getMonth()+1) + "/" + d.getFullYear() + "/" + hour+":"+minutes+":"+secs; // e.g. 05/10/2016/11:30:08
    var changesstr = ""; // This is the JSON string part that goes within the main JSON string

    // This for will fill up the 'before' and 'after' array of changes.
    for (prop in changes) {
        if (prop == "officehours") { // prop is the name of the Object's property, it is NOT an index.
            // Now we iterate the array of officehours:
            for (prop2 in changes.officehours) { // prop2 is an index in this context
                // The following two 'if' statements format the JSON value that will be stored. It ensures that real values are printed, for instance: an int as a string is not well formated. The data type should be respected.
                var output1;
        		var output2;
        		if (person.officehours[prop2] == null) {output1 = null;} else if (isNaN(person.officehours[prop2])) {output1 = '"'+person.officehours[prop2] + '"';} else {output1 = parseInt(person.officehours[prop2]);}
        		if (changes.officehours[prop2] == null) {output2 = null;} else if (isNaN(changes.officehours[prop2])) {output2 = '"'+changes.officehours[prop2] + '"';} else {output2 = parseInt(changes.officehours[prop2]);}
                changesstr = changesstr + '{' +
                '"before": {"'+prop+prop2+'":'+output1+'},' + // e.g. "before":{"officehours0":"10,12,13,16"}
                '"after": {"'+prop+prop2+'":'+output2+'}' + // e.g. "after":{"officehours0":"11,13,15,17"}
                '},';
            }
        } else if (prop == "deustotech") { // The purpose of this 'if' clausure is to ensure we save a real boolean value instead of a string
            changesstr = changesstr + '{' +
            '"before": {"'+prop+'":'+ (person[prop] == "true") +'},' + // e.g. "before":{"deustotech":true}
            '"after": {"'+prop+'":'+ (changes[prop] == "true") +'}' + // e.g. "after":{"deustotech":false}
            '},';
        } else { // This clausure (statement) is for the rest of the elements
            changesstr = changesstr + '{' +
            '"before": {"'+prop+'":'+((person[prop] == null) ? null : '"'+person[prop]+'"') +'},' + // e.g. "before":{"email":"hola@prueba.com"}
            '"after": {"'+prop+'":'+((changes[prop] == null) ? null : '"'+changes[prop]+'"')+'}' + // e.g. "after":{"email":"hello@prueba2.com"}
            '},';
        }
    }
    // Just as an aside note, here we show a list of possible values for 'prop' index.
    // The values are directly captured from the DOM of the client side (the properties/attributes within 'changes' object):
    // name, position, faculty, office, email, phone, extension, fax, website, linkedin, deustotech, notes, officehours

    changesstr = changesstr.slice(0, -1); // Here, we are removing the last comma added to the string, it is not necessary because there are not more JSON objects following.

    // This JSON represents the document to add to the database
    var json = '{' +
    '"_id":"'+ signedInUser.email + '__' + dstr + '",' +
    '"name":"'+ signedInUser.name + '",' +
    '"email":"'+ signedInUser.email + '",' +
    '"userid":"'+ signedInUser.sub + '",' +
    '"timestamp":"'+ Date().toString() + '",' + // e.g. Wed Oct 05 2016 11:14:38 GMT+0200 (CEST)
    '"staffid":"'+ person.id + '",' +
    '"changes":['+ changesstr+ ']'+
    '}';

    _dbchanges.put(JSON.parse(json)).then(function (response) {
        console.log("Correctly added EDITED contact document: " + response.id);
        updateStaff(person._id, changes);
        callback();
    }).catch(function (err) {
        console.log("error inserting an edited contact");
        console.log(err);
    });
}

// This function updates a staff member (contact) with the new information provided in the parameters.
//  "changes" Object (changes_dictionary["officehours"] in client side) will have rows with any of the following possible content:
// · Useful information regarding 'officehours', e.g '23','00','14','15'
// · -1 -> This corresponds to the rows that were not changed by the user but were loaded at the begining (info coming from the DB)
// · NULL -> This corresponds to the rows that were intentionally deleted by the user
// Remember that (http://www.w3schools.com/js/js_datatypes.asp):
// null === undefined -> false
// null == null -> true
// null == undefined -> true !!
function updateStaff(staffID, changes) {
    var updatedOfficehours = [];
    var definitive_real_index = 0;

    _dbstaff.get(staffID).then(function(doc) {
        if (changes.officehours != undefined) {
            for (k = 0; k < changes.officehours.length; k++) {
                if (changes.officehours[k] == -1) {
                    updatedOfficehours[definitive_real_index] = doc.officehours[k];
                    definitive_real_index++;
                }
                else if (changes.officehours[k] !== null ) {
                    updatedOfficehours[definitive_real_index] = changes.officehours[k];
                    definitive_real_index++;
                }
            }
        }
        return _dbstaff.put({
            _id: staffID,
            _rev: doc._rev,
            name: (changes.name != undefined) ? changes.name : doc.name,
            position: (changes.position != undefined) ? changes.position : doc.position,
            faculty: (changes.faculty != undefined) ? changes.faculty : doc.faculty,
            email: (changes.email != undefined) ? changes.email : doc.email,
            extension: (changes.extension != undefined) ? changes.extension : doc.extension,
            phone: (changes.phone != undefined) ? changes.phone : doc.phone,
            fax: (changes.fax != undefined) ? changes.fax : doc.fax,
            office: (changes.office != undefined) ? changes.office : doc.office,
            officehours: (changes.officehours != undefined) ? updatedOfficehours : doc.officehours,
            website: (changes.website != undefined) ? changes.website : doc.website,
            linkedin: (changes.linkedin != undefined) ? changes.linkedin : doc.linkedin,
            notes:(changes.notes != undefined) ? changes.notes : doc.notes,
            dtech: (changes.deustotech != undefined) ? (changes.dtech ==="true") : doc.dtech
        });
    }).then(function(response) {
        console.log("Correctly updated STAFF document: " + response.id);
    }).catch(function (err) {
        console.log("error updating staff list (_id="+staffID+"):");
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
exports.putEditedContact = putEditedContact;
