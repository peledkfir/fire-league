
flApp.controller('LeagueDeleteCtrl', ['$scope', '$modalInstance', 'league', function($scope, $modalInstance, league) {
  'use strict';

  $scope.league = league;
  $scope.deleting = false;

  $scope.dismiss = function() {
    if (!$scope.deleting) {
      $modalInstance.dismiss();
    }
  };

  $scope.delete = function() {
    if (!$scope.deleting) {
      $scope.deleting = true;
      $modalInstance.close(true);
    }
  };
}]);