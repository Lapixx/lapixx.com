/**
 * Serves the contents of the /static directory
 */

var PORT = 6000;

var connect = require("connect");
var serveStatic = require("serve-static");
connect().use(serveStatic(__dirname + "/static")).listen(PORT);

console.log("Listening at localhost:" + PORT + "...")
