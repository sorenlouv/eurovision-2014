var app = angular.module('eurovision', []);

app.controller('AppCtrl', ['$scope', 'videoService', function ($scope, videoService) {
  'use strict';
  $scope.loadingVideos = true;
  $scope.loadingVideosError = false;

  // when all videos have loaded
  var videosPromise = videoService.getVideos();
  videosPromise.then(function(videoResponses){
    var videos = videoService.parseResponses(videoResponses);

    $scope.loadingVideos = false;

    $scope.chartByScore = videoService.getChartByScore(videos);
    $scope.chartByViews = videoService.getChartByViews(videos);
    $scope.chartByLikes = videoService.getChartByLikes(videos);
    $scope.chartByComments = videoService.getChartByComments(videos);

  },function(){
    $scope.loadingVideos = false;
    $scope.loadingVideosError = true;
  });

}]);