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
			if (response.status == 'connected') {
				$rootScope.auth.$login('facebook', {
					access_token: response.authResponse.accessToken
				})
				.then(function(user) {
				   console.log('Logged in as: ', user);
				   leagueService.res.user.set(user.uid, { id: user.id, name: user.name });
				   $('#loginModal').modal('hide');
				},
				function(error) {
				   console.error('Login failed: ', error);
				   $('#loginModal').modal('hide');
				});
			} else {
			   console.error('Login failed: ', response.status);
			   $('#loginModal').modal('hide');				
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
});