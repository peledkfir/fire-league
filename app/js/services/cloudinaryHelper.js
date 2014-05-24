
fApp.service('cloudinaryHelper', ['$timeout', 'leagueService', 'CLOUDINARY_CONFIG', function($timeout, leagueService, CLOUDINARY_CONFIG) {
	return {
		url: CLOUDINARY_CONFIG.url,
		sign: function(uid, params, callback) {
			leagueService.res.cloudinary_hash.requests.set(uid, params);
			params.api_key = CLOUDINARY_CONFIG.api_key;

			var resultRef = leagueService.res.cloudinary_hash.results.ref(uid);
			resultRef.on('value', function(snap) {
				if (snap.val()) {
					params.signature = snap.val();
					resultRef.off('value');
					resultRef.remove();

					$timeout(function() {
						callback();
					});
				}
			});			
		}
	};
}])