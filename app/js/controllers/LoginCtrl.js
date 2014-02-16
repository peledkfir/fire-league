'use strict';

fApp.controller('LoginCtrl', function LoginCtrl($scope, $state, $rootScope, $firebaseSimpleLogin, Facebook, leagueService) {
	// Here, usually you should watch for when Facebook is ready and loaded
	var $destroyWatch = $scope.$watch(function() {
		return Facebook.isReady(); // This is for convenience, to notify if Facebook is loaded and ready to go.
	}, function(newVal) {
		if (newVal) {
			$destroyWatch();
			$rootScope.facebookReady = true; // You might want to use this to disable/show/hide buttons and else
		}
	});

	$rootScope.$on("$firebaseSimpleLogin:login", function(e, user) {
		console.log("Logged in");
	});

	$scope.login = function() {
		Facebook.login(function(response) {
			$('#loginModal').modal('hide');				

			if (response.status == 'connected') {
				$scope.loading = true;

				$rootScope.auth.$login('facebook', {
					access_token: response.authResponse.accessToken
				})
				.then(function(user) {
				   	console.log('Logged in as: ', user);
					$scope.loading = false;
				   	leagueService.res.user.set(user.uid, { id: user.id, name: user.name });
				},
				function(error) {
					$scope.loading = false;
					console.error('Login failed: ', error);
				});
			} else {
			   console.error('Login failed: ', response.status);
			}
		},
		{scope: 'user_groups,user_friends'});
	};

	$scope.logout = function() {
		$rootScope.auth.$logout();
	};

	var root = leagueService.res.root.ref();
	$rootScope.auth = $firebaseSimpleLogin(root);
	$scope.$state = $state;
	$scope.loading = false;
});