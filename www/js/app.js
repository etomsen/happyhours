(function(){
    'use strict';
    angular
        .module('happyhours', ['ionic', 'ionic.service.core', 'ionic.service.deploy', 'pascalprecht.translate',
            'ngCordova', 'me.tomsen.ionicTopMenu',
            'happyhours.intro', 'happyhours.main'])
        .run(run)
        .config(configure);

    run.$inject = ['$rootScope', '$window', '$state', '$ionicPlatform'];
    function run($rootScope, $window, $state, $ionicPlatform) {

        $ionicPlatform.ready(function() {
            if (window.StatusBar) {
                window.StatusBar.styleDefault();
            }
        });

        $ionicPlatform.registerBackButtonAction(function(e){
            e.preventDefault();
            return false;
        }, 101);

        $state.go('intro');
    }


    configure.$inject = ['$compileProvider', '$ionicAppProvider', '$urlRouterProvider', '$ionicConfigProvider', '$translateProvider'];
    function configure($compileProvider, $ionicAppProvider, $urlRouterProvider, $ionicConfigProvider, $translateProvider) {

        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob):|data:image\//);
        $ionicAppProvider.identify({
            app_id: 'c8a41aaa',
            api_key: '47de2b8f979a3b5123822e2ede88ec9b16b79c8bb04f209f'
        });
        $ionicConfigProvider.backButton.previousTitleText(false).text('');

        $translateProvider.useStaticFilesLoader({
            prefix: './lang/',
            suffix: '.json'
        });
        $translateProvider.useSanitizeValueStrategy('sanitize');
        $translateProvider.preferredLanguage('ru');

        $urlRouterProvider.otherwise(function ($injector) {
            var $state = $injector.get('$state');
            $state.go('intro');
        });
    }
}());
