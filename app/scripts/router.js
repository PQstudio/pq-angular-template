app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', 'uiGmapGoogleMapApiProvider', 'RestangularProvider', 'apiRoot',
    function($stateProvider, $urlRouterProvider, $locationProvider, GoogleMapApi, RestangularProvider, apiRoot) {
        'use strict';
        
        RestangularProvider.setBaseUrl(apiRoot);

        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        }).hashPrefix('!');


    }
]);