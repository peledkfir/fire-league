
fApp
.config(['fileUploadProvider',function(fileUploadProvider) {
	'use strict';

	angular.extend(fileUploadProvider.defaults, {
		maxFileSize: 20000000,
		dataType: 'json',
		headers: {'X-Requested-With': 'XMLHttpRequest'}
	});
}])
.factory('UploadPhotosService', ['$timeout', function($timeout){
	'use strict';

	return function UploadPhotosService(images){
		// list of current images ids
		this.images = _.map(images || [], function(id) { return {id: id}; });

		this.setScope = function(scope) {
			if (!this.$scope) {
				this.$scope = scope;
				scope.queue.push.apply(scope.queue, this.images);

				this.progress = scope.progress;
				this.active = scope.active;
			}
		};

		this.pendingUploads = function() {
			return _.filter(this.$scope.queue, function(file) { return file instanceof Blob; }).length;
		};

		this.submit = function(callback) {
			// Checks if there files to upload
			if (this.pendingUploads() > 0) {
				var self = this;

				this.$scope.$on('fileuploadalways', function(ev, data) {
					if (self.pendingUploads() == 0) {
						$timeout(function() {
							callback(_.filter(self.$scope.queue, function(f) { return !f.isDeleted; }));
						});
					}
				});
				this.$scope.submit();
			} else {
				callback(_.filter(this.$scope.queue, function(f) { return !f.isDeleted; }));
			}
		};
	};
}])
.directive('uploadPhotos', function() {
	'use strict';

	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'templates/directives/UploadPhotos.html',
		scope: true,
		link: function($scope, $element, $attrs) {
			$element.find('button').bind('click', function() {
				$element.find('input[type="file"]').click();
			});

			$scope.$watch(
				$attrs.service,
                function (newService) {
					if (newService) {
						newService.setScope($scope);
					}
				}
            );
		},
		controller: function($scope, $attrs, $rootScope, leagueService, cloudinaryHelper, $document, notificationService, $timeout) {
			// Prevent the default action when a file is dropped on the window
			$document.on('drop dragover', function (e) {
				e.preventDefault();
			});

			function thumbnailUrl(url) {
				var lastIdx = url.lastIndexOf('/image/upload') + '/image/upload'.length;
				return url.slice(0, lastIdx) + '/t_media_lib_thumb' + url.slice(lastIdx, url.length);
			}

			// parse cloudinary response to jquery-file-upload format
			$scope.$on('fileuploaddone', function(ev, data) {
				data.result = {
					url: data.result.secure_url,
					size: data.result.bytes,
					name: data.originalFiles[0].name,
					id: data.result.public_id,
					thumbnailUrl: thumbnailUrl(data.result.secure_url)
				};
				
				var result = { files: [ data.result ] };
				data.result = data._response.result = result;
			});

			$scope.toggleFileDeleted = function(file) {
				file.isDeleted = !file.isDeleted;
			};

			$scope.deleteAlert = function() {
				delete $scope.error;
			};

			$scope.$on('fileuploadprocessfail', function(ev, data) {
				var file = data.files[data.index];
				$scope.error = file.error;
				$timeout($scope.deleteAlert, 6000);

				file.$cancel();
			});

			$scope.$on('$destroy', function() {
				$document.off('drop dragover');
			});

			var params = {
				timestamp: new Date().getTime(),
				folder: $scope.$eval($attrs.folder),
				eager: 't_media_lib_thumb'
			};

			var options = {
				dropZone: $('#photosDropZone'),
				url: cloudinaryHelper.url,
				// Enable image resizing, except for Android and Opera,
				// which actually support image resizing, but fail to
				// send Blob objects via XHR requests:
				disableImageResize: /Android(?!.*Chrome)|Opera/.test(window.navigator && navigator.userAgent),
				imageMaxWidth: 800,
				imageMaxHeight: 600,
				previewMaxWidth: 200,
				previewMaxHeight: 200,
				acceptFileTypes: /(\.|\/)(gif|jpe?g|png|bmp)$/i,
				autoUpload: false,
				formData: params
			};

			var uid = $rootScope.auth.user.uid;
			cloudinaryHelper.sign(uid, params, function() {
				$scope.options = options;
				$scope.signed = true;
			});
		}
	};
});