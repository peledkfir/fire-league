var Firebase = require('firebase');
var FirebaseTokenGenerator = require('firebase-token-generator');
var cloudinary = require('cloudinary');
var WorkQueue = require('./workqueue.js');
var config = require('./config.js');

// config
cloudinary.config({
  cloud_name: config.CLDNRY_NAME,
  api_key: config.CLDNRY_API,
  api_secret: config.CLDNRY_SECRET
});

function print(env, lvl, message) {
	console[lvl](new Date() + ': ' + env.id + ' ' + message);
}

/**
 * Starts work queue
 */
function start(env) {
	if (!env.listening) {
		print(env, 'log', 'Creates new work queue');

		env.queue = new WorkQueue(env.firebase, function(data, uid, whenFinished) {
			print(env, 'log', 'Signing ' + uid);

			var params = cloudinary.utils.sign_request(data, {});
			var result = new Firebase(env.url + '/cloudinary_hash/results/' + uid);
			
			result.set(params.signature, function(error) {
				if (error) {
					print(env, 'error', 'Failes to save signature: ');
					print(env, 'error', error);
				}

				whenFinished();
			});
		});

		env.listening = true;
	} else {
		print(env, 'log', 'Ignoring start');
	}
}

function authenticate(env) {
	var token = env.tokenGenerator.createToken({ uid: 'heroku_server' });

	env.firebase.auth(token, function(error, authInfo) {
		if(error) {
			print(env, 'log', 'Login Failed! ' + error);
		} else {
			print(env, 'log', 'Login Succeeded!');
			start(env);
		}
	}, function(error) {
		print(env, 'error', error);
		authenticate();
	});
}

for (var i = config.ENVIRONMENTS.length - 1; i >= 0; i--) {
	var env = config.ENVIRONMENTS[i];
	
	console.log(env);
	env.tokenGenerator = new FirebaseTokenGenerator(env.fb_secret);
	env.listening = false;

	// authenticate
	env.firebase = new Firebase(env.url + '/cloudinary_hash/requests');

	authenticate(env);
}