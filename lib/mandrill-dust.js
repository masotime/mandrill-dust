'use strict';

var mandrill = require('mandrill-api'),
	fs = require('./qfs'),
	dustr = require('dustr'),
	Q = require('q');

var required = function(obj, property, message) {
	if (!obj.hasOwnProperty(property) || obj[property] === undefined) {
		throw new Error(message);
	}
};

var Factory = function(spec) {

	required(spec, 'API_KEY', 'spec must have API_KEY');
	required(spec, 'sender', 'spec must have sender');

	var client = new mandrill.Mandrill(spec.API_KEY),
		sender = spec.sender;

	var sendMail = function(messageRequest) {

		var deferred = Q.defer();

		client.messages.send(messageRequest, function(result) {
			// because mandrill's shitty API doesn't follow
			// NodeJS conventions...
			var errors = [],
				successes = [];

			result.forEach(function(emailSent) {
				emailSent.reject_reason && errors.push(emailSent.reject_reason);
				emailSent.status === 'sent' && successes.push(emailSent._id);
			});

			if (errors.length > 0) {
				deferred.reject(new Error(errors));
			} else {
				deferred.resolve(successes);
			}

		});

		return deferred.promise;
	};

	var sendFunction = function(request) {

		var deferred = Q.defer(),
			request = request || {},
			hasAtLeastOneOf = ['to', 'cc', 'bcc'].some(function(propName) { return request.hasOwnProperty(propName); }),
			subject, template, model, promise;

		if (!request.template) {
			deferred.reject(new Error("request must have template"));
		} else if (!request.subject) {
			deferred.reject(new Error("request must have subject"));
		} else if (!hasAtLeastOneOf) {
			deferred.reject(new Error("request must have either to, cc or bcc"));
		} else {
			model = request.model || {};
			template = fs.read(request.template);
			subject = request.subject;

			promise = Q.all([template, model])
				.spread(function(template, model) {
					return dustr().render(template,model);
				}).then(function(result) {
					// form the message request
					var messageRequest = {
						'message': {
							'html': result,
							'subject': subject,
							'from_email': sender
						},
						'async': false
					};

					// we need to add the recipients
					messageRequest.message.to = [];

					['to', 'cc', 'bcc'].forEach(function(type) {
						var targets = request[type];

						// append each type to the request, converting the
						// supplied email for a type to an array for convenience
						// (if it isn't already an array)
						if (targets) {
							!Array.isArray(targets) && (targets = [targets]);

							targets.forEach(function(email) {
								messageRequest.message.to.push({
									'email': email,
									'type': type
								});
							});
						}
					});

					return sendMail(messageRequest);

				});

			deferred.resolve(promise);
		};

		return deferred.promise;

	};

	return {
		'send': sendFunction
	};

};

module.exports = Factory;