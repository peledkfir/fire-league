
fApp.controller('LoginCtrl', function LoginCtrl($scope, $rootScope, $modal, leagueService) {
	'use strict';
	
	$scope.openLoginModal = function () {
		$modal.open({
			templateUrl: 'templates/LoginModal.html',
			resolve: {
				$loginCtrlScope: function() {
					return $scope;
				}
			},
			controller: 'LoginModalCtrl'
		});
	};

	$scope.logout = function() {
		$rootScope.auth.$logout();
	};

	$scope.loading = false;

	$rootScope.$on('$firebaseSimpleLogin:login', function(e, user) {
		$scope.favorites = leagueService.res.favorites.sync(user.uid);
	});

	$rootScope.$on('$firebaseSimpleLogin:logout', function() {
		$scope.favorites = null;
	});
});