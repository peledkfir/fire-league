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

function print(env, lvl, message, obj) {
	if (obj) {
		console[lvl](new Date() + ': ' + env.id + ' ' + message, obj);
	} else {
		console[lvl](new Date() + ': ' + env.id + ' ' + message);
	}
}

/**
 * Starts work queue
 */
function start(env) {
	if (!env.listening) {
		clearOrphanImages(env);
		env.intervalId = setInterval(clearOrphanImages, 1000 * 60 * 60 /* 1 hour */, env);
		
		print(env, 'log', 'Creates new work queue');

		env.queue = new WorkQueue(new Firebase(env.url + '/cloudinary_hash/requests'), function(data, uid, whenFinished) {
			print(env, 'log', 'Signing ' + uid);

			var params = cloudinary.utils.sign_request(data, {});
			var result = new Firebase(env.url + '/cloudinary_hash/results/' + uid);
			
			result.set(params.signature, function(error) {
				if (error) {
					print(env, 'error', 'Failes to save signature: ', error);
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
			print(env, 'log', 'Login Failed! ', error);
		} else {
			print(env, 'log', 'Login Succeeded!');
			start(env);
		}
	}, function(error) {
		print(env, 'error', 'Auth error', error);
		authenticate();
	});
}

function checkPublicId (env, publicId) {
	print(env, 'log', 'Checking: ' + publicId);
	var split = publicId.split('/');
	var startIdx = 0;

	if (env.id) {
		startIdx = 1;
	}

	var league = split[startIdx];
	var season = split[startIdx + 1];
	var round = split[startIdx + 2] - 1;
	var match = split[startIdx + 3] - 1;

	new Firebase(env.url + '/season_matches/' + league + '/' + season + '/rounds/' + round + '/matches/' + match + '/images')
	.once('value', 
		function(val) {
			var images = val.val();
			var inUse = false;

			if (images instanceof Array) {
				for (var i = images.length - 1; i >= 0; i--) {
					var image = images[i];

					if (image == publicId) {
						inUse = true;
						break;
					}
				}
			} else {
				inUse = image == publicId;
			}

			if (!inUse) {
				print(env, 'log', 'Deleting: ' + publicId);
				cloudinary.api.delete_resources([publicId], function(result) {
					print(env, 'log', 'Deleted: ' + publicId, result);
				});
			}
		}, 
		function(error) {
			var prefix = env.id ? env.id + '/' : '';
			prefix = prefix + league + '/' + season + '/' + (round + 1) + '/' + (match + 1);
			print(env, 'log', 'Deleting prefix: ' + prefix);
	});
}

function clearOrphanImages(env) {
	print(env, 'log', 'Starts to clear orphan images');

	cloudinary.api.resources(function(result) {
		for (var i = result.resources.length - 1; i >= 0; i--) {
			var img = result.resources[i];
			var publicId = img.public_id;
			
			checkPublicId(env, publicId);
		};

		if (result.next_cursor) {
			env.next_cursor = result.next_cursor;
			clearOrphanImages(env);
		} else {
			delete env.next_cursor;
		}
	}, { type: 'upload', prefix: env.id, max_results: 500, next_cursor: env.next_cursor });
}

for (var i = config.ENVIRONMENTS.length - 1; i >= 0; i--) {
	var env = config.ENVIRONMENTS[i];
	
	console.log(env);
	env.tokenGenerator = new FirebaseTokenGenerator(env.fb_secret);
	env.listening = false;

	// authenticate
	env.firebase = new Firebase(env.url);

	authenticate(env);
}