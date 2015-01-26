app.directive('meta', function() {
    'use strict';
    return {
        restrict: 'E',
        link: function(scope, element, attrs) {
            if (attrs.name === 'description') {
                scope.$watch('metaDescription', function(newValue, oldValue) {
                    if (oldValue !== newValue) {
                        element[0].content = newValue;
                    }
                });
            }

        }
    };
});