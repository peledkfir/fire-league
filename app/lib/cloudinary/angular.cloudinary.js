(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define(['jquery.cloudinary'], factory);
    } else {
        // Browser globals:
        factory();
    }
}(function () {
    'use strict';

    angular.module('cloudinary', [])
    /**
     *
     * HTML:
     *
     * <img cl-image class="..." id="..."  height="..." data-crop="fit" public-id="cloudinaryPublicId"/>
     *
     */
    .directive('clImage', function($document) {
        return {
            restrict : 'EA',
            replace : true,
            transclude : false,
            scope : {
                publicId : '='
            },
            // The linking function will add behavior to the template
            link : function(scope, element, attrs) {
                var loader = null;
                
                if (angular.isDefined(attrs.rnLazyLoader)) {
                    loader = angular.element($document[0].querySelector(attrs.rnLazyLoader)).clone();
                }

                function setLoading(elm) {
                    if (loader) {
                        elm.html('');
                        elm.after(loader);
                        elm.attr({
                            'src': null
                        });
                    }
                }

                scope.$watch('publicId', function(value) {
                    if (value) {
                        setLoading(element);

                        var img = $document[0].createElement('img');
                        var $img = $(img);
                        $img.data(element.data());
                        
                        img.onload = function() {
                            if (loader) {
                                loader.remove();
                            }

                            element.attr({ 'src': this.src });
                        };

                        $img.webpify({'src' : value + '.jpg'});
                    }
                });
            }
        };
    })
    .config(['CLOUDINARY_CONFIG', function(CLOUDINARY_CONFIG) {
        $.cloudinary.config(CLOUDINARY_CONFIG);
    }]);
}));
