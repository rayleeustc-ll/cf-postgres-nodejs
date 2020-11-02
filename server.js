"use strict";
const express = require("express");
const app = express();
const fs = require("fs");

console.log("**************************");
console.log("* Test postgresl backend *");
console.log("**************************");

let port = process.env.PORT || 8080;
const pg = require("pg");
let cfenv = require('cfenv');

var uri
var serviceName
var credentials
if(process.env.VCAP_SERVICES) {
  // VCAP_SERVICES environment variable
  var env = JSON.parse(process.env.VCAP_SERVICES);
  for (var key in env){
    if( key.indexOf( "postgres" ) > -1){
        console.log("'" + key + "' has been found in VCAP_SERVICES, we use it!")
        serviceName=key
    }
  }
  credentials = env[serviceName][0]['credentials'];
  console.log('uri of ' + serviceName + ' : ' + credentials)
}else{
        console.error("It's not a CF app")
}

var connectionString = credentials.uri;
var userpass = connectionString.split("/")[2].split("@")[0];

let config = {
    port: connectionString.split("/")[2].split("@")[1].split(",")[0].split(":")[1],
    host: connectionString.split("/")[2].split("@")[1].split(",")[0].split(":")[0],
    database: connectionString.split("/")[3],
    user: userpass.split(":")[0],
    password: userpass.split(":")[1]
}

console.log(config)

const client = new pg.Client(config);
 client.connect(function(err) {
    if (err) {
        console.error(err);
        process.exit(1);
    } else {
	console.log("Connection successful");
    }
 });

function testBackendService(type, res){

	var error = false; 
        client.query(
            "DROP TABLE IF EXISTS words",
            function(err, result) {
                if (err) {
                    console.error(err);
		    main(type, true, res);
                }
		console.log("DROP TABLE OK");
            }
        );
        client.query(
            "CREATE TABLE IF NOT EXISTS words (word varchar(256) NOT NULL, definition varchar(256) NOT NULL)",
            function(err, result) {
                if (err) {
                    console.error(err);
		    main(type, true, res);
                }
		console.log("CREATE TABLE OK");
            }
        );
	let queryText = "INSERT INTO words(word,definition) VALUES($1, $2)";
        client.query(
            queryText, ["TestPostgres", "definitions"],
            function(err, result) {
                if (err) {
		    console.error(err);
		    main(type, true, res);
                }
		console.log("INSERT OK"); 
            }
        );
        client.query('SELECT * FROM words ORDER BY word ASC' ,function(err,result) {
           if(err){
               console.error(err);
	       main(type, true, res);
           }else{
             console.log("SELECT OK : " + result.rows[0].word);
             res.send("SELECT words table OK. "+"value of column word: "+ result.rows[0].word + " and value of column definition: "+ result.rows[0].definition);
        	   if ( result.rows[0].word != "TestPostgres" ){
	                console.error("Word TestPostgres not found => Exit");
			main(type, true, res);
	           }
		   main(type, false, res);
	   }
        });
}

//testBackendService("starting", null);
function main(type, error, res) {
  if ( type == "starting") {
	if (error) {
		console.log("Error during startup !");
		process.exit(1);
	}
  }else{
	if (error) {
		console.error("Error during http get !");
		res.status(404).send('Start unsuccessful service not available');
	}else{
	        console.log("Ok, service available");
	        res.send('This is a test app for postgres-docker');
	}
  }
}

app.get('/', function (req, res) {
   testBackendService("web", res);  
});
app.listen(process.env.PORT || 5000);

module.exports = app;

