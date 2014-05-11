'use strict';

var fs = require('fs'),
	Q = require('q');

var read = function(path) {
	var deferred = Q.defer();

	console.log('READ', path);
	fs.readFile(path, 'utf8', function(err, result) {
		
		if (err) {
			deferred.reject(err);
		} else {
			deferred.resolve(result);
		}
	});

	return deferred.promise;
};

var write = function(path, data) {
	var deferred = Q.defer();

	console.log('WRITE', path);
	fs.writeFile(path, data, function(err, result) {
		
		if (err) {
			deferred.reject(err);
		} else {
			deferred.resolve(path);
		}
	});

	return deferred.promise;
};

module.exports = {
	'read': read,
	'write': write
}