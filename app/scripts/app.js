var app = angular.module('app', ['ui.router', 'ngCookies', 'restangular'])
    .run(function($rootScope, $state, $location, $anchorScroll, $window, analyticsId) {

        'use strict';

        $rootScope.$state = $state;

        $rootScope.analyticsId = analyticsId;
        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            if (toState.name === '') {
                $rootScope.title = '';
                $rootScope.metaDescription = '';
            }

            $window.ga('send', 'pageview', {
                page: $location.path()
            });

        });

    });