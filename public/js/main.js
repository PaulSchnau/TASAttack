var myApp = angular.module('myApp', ['youtube-embed']);

myApp.constant('YT_event', {
    STOP:            0, 
    PLAY:            1,
    PAUSE:           2,
    STATUS_CHANGE:   3
});

myApp.controller('MainCtrl', ['$scope', '$interval', '$window', function($scope, $interval, $window, youtubeEmbedUtils) {
    $scope.videoHeight = function(){
        return $window.innerHeight / 10 * 8
    }

    $scope.videoHeightNoChat = function(){
        return $window.innerHeight
    }

    $scope.$on('youtube.player.ready', function ($event, player) {
        $scope.position = Math.floor(($scope.currentPoll.currentRun.realTime - $scope.timeLeft )/1000);
        $scope.videoPlayer.seekTo($scope.position, true);
        $scope.videoPlayer.cc_load_policy = 1;
    });

    $scope.$on('youtube.player.playing', function ($event, player) {
        $scope.position = Math.floor(($scope.currentPoll.currentRun.realTime - $scope.timeLeft )/1000);
        $scope.videoPlayer.seekTo($scope.position, true);
    });

    $scope.videoVars = {
        autoplay : 1,
        showinfo : 0,
        controls : 1,
        theme: 'light',
        modestbranding : 1,
        autohide : 1
    }
    var updateTimer = function () {  
        if(typeof $scope.currentPoll != "undefined"){
            $scope.timeLeft = Date.parse(($scope.currentPoll.endsAt)) - Date.now();
        }
    }
    var updateTimerinterval = $interval(updateTimer,1000);

    var host = location.origin.replace(/^http/, 'ws');
    var ws = new ReconnectingWebSocket(host);
    ws.onmessage = function (event) {
        if ($scope.currentPoll != JSON.parse(event.data)){
            $scope.currentPoll = JSON.parse(event.data);
        }

        $scope.videoid = $scope.currentPoll.currentRun.youtubeURL.substr($scope.currentPoll.currentRun.youtubeURL.length - 11);
        $scope.timeLeft = Date.parse(($scope.currentPoll.endsAt)) - Date.now();
        $scope.position = Math.floor(($scope.currentPoll.currentRun.realTime - $scope.timeLeft )/1000);

        //$scope.videoPlayer.skipTo($scope.position);
    };

    $scope.chatStyle = function() {
        return {
            height: $window.innerHeight,
        };
    };

}]);

