# mandrill-dust

This module does something very specific - it takes a path to a dust template, a model and a list of recipients, and uses the mandrill API to send an HTML e-mail.

As usual, this is a promise-based library.

Initialize by using

	var client = require('mandrill-dust')({
		'API_KEY': 'secret',
		'sender': 'sender@somewhere.com'
	});

then send by using a send request

	client.send({
		'template': 'templates/email.dust',
		'model': {
			'name': 'world'
		},
		'subject': 'How are you?'
		'to': ['someone@somewhere.com'],
		//'cc': ['someone_else@somewhere.com'],
		//'bcc': ['nsa@nsa.com']
	});

Note that `template`, `subject` and one of [`to`, `cc`, `bcc`] is required to send an e-mail.