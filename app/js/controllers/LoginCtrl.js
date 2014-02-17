'use strict';

fApp.controller('LoginCtrl', function LoginCtrl($scope, $rootScope, $modal, Facebook) {
	$scope.openLoginModal = function () {
	    $modal.open({
	    	templateUrl: 'LoginModal.html',
	    	resolve: {
	    		$loginCtrlScope: function() {
	    			return $scope;
	    		}
	    	},
	    	controller: function ($scope, $modalInstance, leagueService, $loginCtrlScope) {
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
							   	leagueService.res.user.set(user.uid, { id: user.id, name: user.name });
							},
							function(error) {
								$loginCtrlScope.loading = false;
								console.error('Login failed: ', error);
							});
						} else {
						   console.error('Login failed: ', response.status);
						}
					},
					{scope: 'user_groups,user_friends'});
				};

				$scope.cancel = function () {
					$modalInstance.close();
				};
			}
	    });
	};

	$scope.logout = function() {
		$rootScope.auth.$logout();
	};

	$scope.loading = false;
});