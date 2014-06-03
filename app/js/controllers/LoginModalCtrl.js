flApp.controller('LoginModalCtrl',
	function LoginModalCtrl ($scope, $rootScope, $modalInstance, Facebook, leagueService, $loginCtrlScope) {
		'use strict';

		$scope.login = function() {
			Facebook.login(function(response) {
				$modalInstance.close();

				if (response.status == 'connected') {
					$loginCtrlScope.loading = true;

					$rootScope.auth.$login('facebook', {
							access_token: response.authResponse.accessToken
						})
					.then(function(user) {
							console.log('Logged in as: ', user);
							$loginCtrlScope.loading = false;
							leagueService.res.user.set(user.uid, { id: user.id, name: user.displayName });
						}, function(error) {
							$loginCtrlScope.loading = false;
							console.error('Login failed: ', error);
						});
				} else {
					console.error('Login failed: ', response.status);
				}
			}, { scope: 'user_groups,user_friends' });
		};

		$scope.cancel = function () {
			$modalInstance.close();
		};
	});