// a simple utility to create references to Firebase paths
flApp.factory('firebaseRef', function($firebase, FBURL) {
  'use strict';
  function pathRef(args) {
    for(var i=0; i < args.length; i++) {
      if( typeof(args[i]) === 'object' ) {
        args[i] = pathRef(args[i]);
      }
    }
    return args.join('/');
  }
  /**
   * @function
   * @name firebaseRef
   * @param {String|Array...} path
   * @return a Firebase instance
   */
  return function(path) {
    return new Firebase(pathRef([FBURL].concat(Array.prototype.slice.call(arguments))));
  };
})
// a simple utility to create $firebase objects from angularFire
.service('syncData', function($firebase, firebaseRef) {
  'use strict';
  /**
   * @function
   * @name syncData
   * @param {String|Array...} path
   * @param {int} [limit]
   * @return a Firebase instance
   */
  return function(path, limit) {
    var ref = firebaseRef(path);
    limit && (ref = ref.limit(limit));
    return $firebase(ref);
  };
})
.service('loginService', ['leagueService', '$rootScope', function(leagueService, $rootScope){
  'use strict';

  return {
    handleConnection: function(uid) {
      // stores the timestamp of my last disconnect (the last time I was seen online)
      var lastOnlineRef = leagueService.res.user.lastOnline.ref(uid);
      lastOnlineRef.once('value', function(snap) {
        $rootScope.userLastOnline = snap.val();
      })

      var connectedRef = leagueService.res._info.connected();

      connectedRef.on('value', function(snap) {
        if (snap.val() === true) {
          // when I disconnect, update the last time I was seen online
          lastOnlineRef.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);
        }
      });
    }
  };
}]);