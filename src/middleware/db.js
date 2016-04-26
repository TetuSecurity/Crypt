const mysql = require('mysql');
const pool = mysql.createPool(global.config.DB || {host:'localhost', user:'root', password:'admin', database:'crypt'});

mysql.query = function(){
	var sql_args = [];
	var args = [];
	for(var i=0; i<arguments.length; i++){
		args.push(arguments[i]);
	}
	var callback = args[args.length-1]; //last arg is callback
	pool.getConnection(function(err, connection) {
  	if(err) {
			callback(err);
			return;
		}
		if(args.length > 2){
			sql_args = args[1];
		}
    connection.query(args[0], sql_args, function(err, results) {
      connection.release(); // always put connection back in pool after last query
      if(err){
				callback(err);
				return;
			}
      callback(null, results);
    });
	});
};

mysql.getConnection = function(callback){
  pool.getConnection(function(err, connection) {
  	if(err) {
			return callback(err);
		}
    return callback(null, connection);
  });
};

module.exports = mysql;
