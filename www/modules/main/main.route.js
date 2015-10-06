(function() {
    'use strict';
    angular
        .module('happyhours.main')
        .run(appRun);

    appRun.$inject = ['routerHelper'];

    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'main',
                config: {
                    url: '/main',
                    abstract: true,
                    templateUrl: 'modules/main/main.html',
                    controller: 'Main',
                    controllerAs: 'vm',
                    title: 'main'
                }
            },
            {
                state: 'main.map',
                config: {
                    url: '/map',
                    title: 'Map',
                    views: {
                        'mainContent': {
                            templateUrl: 'modules/main/main.map.html',
                            controller: 'Map',
                            controllerAs: 'vm'
                        }
                    },
                    data: {
                        historyLevel: 0
                    }
                }
            },
            {
                state: 'main.list',
                config: {
                    url: '/list',
                    title: 'List',
                    views: {
                        'mainContent': {
                            template: '',
                            controller: 'List',
                            controllerAs: 'vm'
                        }
                    },
                    data: {
                        historyLevel: 0
                    }
                }
            },
        ];
    }
})();