app.directive('title', function() {
    'use strict';
    return {
        restrict: 'E',
        link: function(scope, element, attrs) {
            scope.$watch('title', function(newValue, oldValue) {
                if (oldValue !== newValue) {
                    element[0].innerHTML = newValue;
                }
            });
        }
    };
});