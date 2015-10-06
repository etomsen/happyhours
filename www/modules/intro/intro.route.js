(function() {
    'use strict';
    angular
        .module('happyhours.intro')
        .run(appRun);

    appRun.$inject = ['routerHelper'];

    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'intro',
                config: {
                    url: '/intro',
                    templateUrl: 'modules/intro/intro.html',
                    controller: 'Intro',
                    controllerAs: 'vm',
                    title: 'intro'
                }
            }
        ];
    }
})();