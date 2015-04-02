app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', 'RestangularProvider', 'apiRoot',
    function($stateProvider, $urlRouterProvider, $locationProvider, RestangularProvider, apiRoot) {
        'use strict';
        
        RestangularProvider.setBaseUrl(apiRoot);

        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        }).hashPrefix('!');

    }
]);