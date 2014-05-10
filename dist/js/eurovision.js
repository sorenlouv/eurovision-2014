var app = angular.module('eurovision', []);

app.controller('AppCtrl', ['$scope', 'videoService', function ($scope, videoService) {
  'use strict';
  $scope.loadingVideos = true;
  $scope.loadingVideosError = false;

  // when all videos have loaded
  var videosPromise = videoService.getVideos();
  videosPromise.then(function(videoResponses){
    var videos = videoService.parseResponses(videoResponses);
    videoService.setTotals(videos);

    $scope.loadingVideos = false;

    $scope.top10 = videoService.getTop10(videos);

    $scope.chartByScore = videoService.getChartByScore(videos);
    $scope.chartByViews = videoService.getChartByViews(videos);
    $scope.chartByLikes = videoService.getChartByLikes(videos);
    $scope.chartByComments = videoService.getChartByComments(videos);

  },function(){
    $scope.loadingVideos = false;
    $scope.loadingVideosError = true;
  });

}]);

app.directive('displayBreakPoints', [
  '$window',
  '$rootScope',
  function($window, $rootScope) {
    'use strict';

    return {
      restrict: 'A',
      link: function(scope, element, attr) {
        scope.breakpoint = {
          'class': '',
          windowSize: $window.innerWidth
        }; // Initialise Values

        var breakpoints = (scope.$eval(attr.displayBreakPoints));
        var firstTime = true;

        angular.element($window).bind('resize', setWindowSize);

        scope.$watch('breakpoint.windowSize', function(windowWidth, oldValue) {
          setClass(windowWidth);
        });

        scope.$watch('breakpoint.class', function(newClass, oldClass) {
          if (newClass != oldClass || firstTime) {
            firstTime = false;
          }
        });

        function setWindowSize() {
          scope.breakpoint.windowSize = $window.innerWidth;
          if (!scope.$$phase) scope.$apply();
        }

        function setClass(windowWidth) {
          var breakpointClass = breakpoints[Object.keys(breakpoints)[0]];
          for (var breakpoint in breakpoints) {
            if (breakpoints.hasOwnProperty(breakpoint)) {
              if (breakpoint < windowWidth) breakpointClass = breakpoints[breakpoint];
              element.removeClass(breakpoints[breakpoint]);
            }
          }
          element.addClass(breakpointClass);
          scope.breakpoint['class'] = breakpointClass;

          if (!scope.$$phase) scope.$apply();
        }
      }
    };
  }
]);

app.directive('chart', function() {
  'use strict';
  return {
    restrict: 'E',
    template: '<div></div>',
    scope: {
      chartData: '=value',
      chartObj: '=?'
    },
    transclude: true,
    replace: true,
    link: function($scope, $element, $attrs) {
      var chartsDefaults = {
        chart: {
          renderTo: $element[0],
          type: $attrs.type || null,
          height: $attrs.height || null,
          width: $attrs.width || null
        }
      };

      //Update when charts data changes
      $scope.$watch('chartData', function(value) {
        if (!value) return;

        var newSettings = {};
        angular.extend(newSettings, chartsDefaults, $scope.chartData);
        new Highcharts.Chart(newSettings);
      });
    }
  };

});

app.factory('videoService', ['$q', '$http', function($q, $http){
  'use strict';

  var totals = {
    views: 0,
    likes: 0,
    dislikes: 0,
    comments: 0
  };

  var setTotals = function(videos){
    videos.map(function(video){
      totals.views += video.views;
      totals.likes += video.likes;
      totals.dislikes += video.dislikes;
      totals.comments += video.comments;
    });
  };

  var getFormattedVideos = function(videos) {
    var formattedVideos = {
      countries: [],
      titles: [],
      views: [],
      comments: [],
      likes: [],
      dislikes: [],
      likeRatios: []
    };

    // change data structure
    angular.forEach(videos, function(video){
      formattedVideos.countries.push(video.country);
      formattedVideos.titles.push(video.title);
      formattedVideos.views.push(video.views);
      formattedVideos.comments.push(video.comments);
      formattedVideos.likes.push(video.likes);
      formattedVideos.dislikes.push(video.dislikes);
      formattedVideos.likeRatios.push(video.likeRatio);
    });

    return formattedVideos;
  };

  var sortVideosBy = function(column, videos) {
    videos.sort(function(x,y) {
      return y[column] - x[column];
    });
  };

  var getChartByViews = function(videos) {
    // Sort by views
    sortVideosBy('views', videos);

    // Limit to top 15
    videos = videos.slice(0,15);

    // Format videos
    videos = getFormattedVideos(videos);

    var chart = {
      type: 'column',
      title: {
        'text': 'Views (live updating)'
      },
      subtitle: {
          text: 'Ordered by views'
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Views'
        }
      },
      xAxis: {
        categories: videos.countries
      },
      tooltip: {},
      series: [{
        color: '#8085e9',
        name: 'Views',
        data: videos.views
      }]
    };

    return chart;
  };

  var getScore = function(videos) {
    videos.map(function(video){
      var nettoLikes = video.likes - (video.dislikes * 0.5);
      var nettoLikesPrView = nettoLikes / video.views;
      var likesPrView = video.likes / video.views;

      // Share
      var viewsShare = video.views / totals.views;
      var likesShare = video.likes / totals.likes;
      var dislikesShare = video.dislikes / totals.dislikes;
      var commentsShare = video.comments / totals.comments;

      video.score = likesShare * viewsShare;
      return video;
    });

    return videos;
  };

  var getTop10 = function(videos){
    videos = getScore(videos);

    // sort by score
    sortVideosBy('score', videos);

    // Limit to top 10
    videos = videos.slice(0,10);

    return videos;
  };

  var getChartByScore = function(videos) {
    videos = getScore(videos);

    // sort by score
    sortVideosBy('score', videos);

    // Limit to top 15
    videos = videos.slice(0,15);

    // Format videos
    videos = getFormattedVideos(videos);

    var chart = {
      type: 'column',
      title: {
        text: 'Fancy Eurovision Score'
      },
      subtitle: {
          text: 'Ordered by "Eurovision Score"'
      },
      yAxis: [{
        min: 0,
        labels: {
          format: '',
          style: {
            color: Highcharts.getOptions().colors[1]
          }
        },
        title: {
          text: 'Number of Likes'
        }
      },{
        opposite: true,
        min: 0,
        title: {
          text: 'Number of views'
        }
      }],
      xAxis: {
        categories: videos.countries
      },
      tooltip: {},
      series: [{
        color: '#7cb5ec',
        name: 'Likes',
        data: videos.likes,
        yAxis: 0
      },
      {
        color: '#8085e9',
        name: 'Views',
        data: videos.views,
        yAxis: 1
      }]
    };

    return chart;
  };


  var getChartByLikes = function(videos) {
    // sort by likes
    sortVideosBy('likes', videos);

    // Limit to top 15
    videos = videos.slice(0,15);

    // Format videos
    videos = getFormattedVideos(videos);

    var chart = {
      type: 'column',
      title: {
        text: 'Likes and dislikes (live updating)'
      },
      subtitle: {
          text: 'Ordered by likes'
      },
      yAxis: {
        min: 0,
        title: {
          text: ''
        }
      },
      xAxis: {
        categories: videos.countries
      },
      tooltip: {},
      series: [{
        color: '#7cb5ec',
        name: 'Likes',
        data: videos.likes
      },
      {
        color: '#434348',
        name: 'Dislikes',
        data: videos.dislikes
      }]
    };

    return chart;
  };

  var getChartByComments = function(videos) {
    // sort by comments
    sortVideosBy('comments', videos);

    // Limit to top 15
    videos = videos.slice(0,15);

    // Format videos
    videos = getFormattedVideos(videos);

    var chart = {
      type: 'column',
      title: {
        text: 'Comments'
      },
      subtitle: {
          text: 'Ordered by comments'
      },
      yAxis: {
        min: 0,
        title: {
          text: ''
        }
      },
      xAxis: {
        categories: videos.countries
      },
      tooltip: {},
      series: [{
        color: '#f7a35c',
        name: 'Comments',
        data: videos.comments,
        visible: true
      }]
    };

    return chart;
  };

  var countries = [
    {
      country: 'Sweden',
      video: 'XdXXnX5BvGY'
    },
    {
      country: 'Armenia',
      video: 'ChkJpnOgIwQ'
    },
    {
      country: 'United Kingdom',
      video: 'fFqYbibLh8k'
    },
    {
      country: 'Hungary',
      video: 'QzfRDZmuFUI'
    },
    {
      country: 'Ukraine',
      video: 'sdAf2EjhRiE'
    },
    {
      country: 'Netherlands',
      video: 'hkrF8uC92O4'
    },
    {
      country: 'Denmark',
      video: 'fn8DzOcpQas'
    },
    {
      country: 'Austria',
      video: 'ToqNa0rqUtY'
    },
    {
      country: 'Norway',
      video: '2LBOjxBty8U'
    },
    {
      country: 'Azerbaijan',
      video: 'ipQswujA5gw'
    },
    {
      country: 'Israel',
      video: '_uB4JMw4ctc'
    },
    {
      country: 'Spain',
      video: 'P9R96ZoWJBU'
    },
    {
      country: 'Greece',
      video: 'z8QIbL9i2MU'
    },
    {
      country: 'Finland',
      video: 'a-NSVFBKU-4'
    },
    {
      country: 'Russia',
      video: 'MPI7AnD_QS8'
    },
    {
      country: 'Romania',
      video: 'RYfyMkwTLPg'
    },
    {
      country: 'Malta',
      video: 'Qxi5C-lGX2Y'
    },
    {
      country: 'Italy',
      video: 'Si9K0ChHzDI'
    },
    {
      country: 'Ireland',
      video: 'Zc14AzCXUgQ'
    },
    {
      country: 'Germany',
      video: 'mTC-4YO_5eE'
    },
    {
      country: 'Poland',
      video: 'syMhJMmGEIc'
    },
    {
      country: 'France',
      video: 'hWJFfnHNOWI'
    },
    {
      country: 'Montenegro',
      video: 'Xym7CQFFTOU'
    },
    {
      country: 'Switzerland',
      video: 'kjWG0oNpWog'
    },
    {
      country: 'Iceland',
      video: 'TwfGKEIn5xw'
    },
    {
      country: 'San Marino',
      video: 'vt_3yms1PcM'
    },
    {
      country: 'Lithuania',
      video: 'PWi0zF6bFto'
    },
    {
      country: 'Slovenia',
      video: 'ZMpNkCOMaGU'
    },
    {
      country: 'Belarus',
      video: '0Qe7YmYgowM'
    },
    {
      country: 'Macedonia',
      video: 'ak73KTgy9nE'
    },
    {
      country: 'Georgia',
      video: 'o9ixkdkbieU'
    }
  ];

  // countries = countries.slice(0,10);

  var getVideos = function() {
    var videoPromises = [];

    // load videos
    angular.forEach(countries, function(videoObject){
      var videoPromise = $http({
        method: 'JSONP',
        url: 'https://gdata.youtube.com/feeds/api/videos/' + videoObject.video + '?&v=2&alt=json-in-script&callback=JSON_CALLBACK&fields=yt:rating,yt:statistics,gd:comments(gd:feedLink(@countHint)),title'
      });

      videoPromises.push(videoPromise);
    });

    return $q.all(videoPromises);
  };

  var parseResponses = function(responses) {
    var videos = [];

    angular.forEach(responses, function(response, i){
      var country = countries[i].country;
      var title = response.data.entry.title.$t;
      var views = parseInt(response.data.entry.yt$statistics.viewCount, 10);
      var comments = response.data.entry.gd$comments ? parseInt(response.data.entry.gd$comments.gd$feedLink.countHint, 10) : 0;
      var likes = parseInt(response.data.entry.yt$rating.numLikes, 10);
      var dislikes = parseInt(response.data.entry.yt$rating.numDislikes, 10);
      var likeRatio = likes/(dislikes + likes) * 100;

      videos.push({
        country: country,
        title: title,
        views: views,
        comments: comments,
        likes: likes,
        dislikes: dislikes,
        likeRatio: likeRatio
      });
    });

    return videos;
  };



  return {
    getTop10: getTop10,
    setTotals: setTotals,
    getVideos: getVideos,
    parseResponses: parseResponses,
    getChartByViews: getChartByViews,
    getChartByComments: getChartByComments,
    getChartByLikes: getChartByLikes,
    getChartByScore: getChartByScore
  };
}]);
