var app = angular.module('eurovision', []);

app.controller('AppCtrl', [
  '$scope',
  'youtubeService',
  'lastfmService',
  function ($scope, youtubeService, lastfmService) {
  'use strict';
  $scope.loadingVideos = true;
  $scope.loadingVideosError = false;

  // When last.fm songs have loaded
  lastfmService.getSongs().then(function(responses){
    var songs = lastfmService.parseResponses(responses);
    $scope.chartByPlaycount = lastfmService.getChartByPlaycount(songs);

    $scope.loadingVideos = false;
  });

  // when youtube videos have loaded
  youtubeService.getVideos().then(function(responses){
    var videos = youtubeService.parseResponses(responses);
    youtubeService.setTotals(videos);

    $scope.loadingVideos = false;

    $scope.top10 = youtubeService.getTop10(videos);

    $scope.chartByScore = youtubeService.getChartByScore(videos);
    $scope.chartByViews = youtubeService.getChartByViews(videos);
    $scope.chartByLikes = youtubeService.getChartByLikes(videos);
    $scope.chartByComments = youtubeService.getChartByComments(videos);

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

app.factory('countriesService', [function(){
  'use strict';

  var countries = [
    {
      name: 'Sweden',
      video: 'XdXXnX5BvGY',
      artist: 'Sanna Nielsen',
      track: 'Undo - Eurovision 2014 - Sweden'
    },
    {
      name: 'Armenia',
      video: 'ChkJpnOgIwQ',
      artist: 'Aram MP3',
      track: 'Not Alone - Eurovision 2014 - Armenia'
    },
    {
      name: 'United Kingdom',
      video: 'fFqYbibLh8k',
      artist: 'Molly',
      track: 'Children Of The Universe - Eurovision 2014 - United Kingdom'
    },
    {
      name: 'Hungary',
      video: 'QzfRDZmuFUI',
      artist: 'András Kállay-Saunders',
      track: 'Running (Eurovision 2014 - Hungary)'
    },
    {
      name: 'Ukraine',
      video: 'sdAf2EjhRiE',
      artist: 'Maria Yaremchuk',
      track: 'Tick-Tock (Ukraine) 2014 Eurovision Song Contest'
    },
    {
      name: 'Netherlands',
      video: 'hkrF8uC92O4',
      artist: 'The Common Linnets',
      track: 'Calm After The Storm - Eurovision 2014 - The Netherlands'
    },
    {
      name: 'Denmark',
      video: 'fn8DzOcpQas',
      artist: 'Basim',
      track: 'Cliché Love Song - Eurovision 2014 - Denmark'
    },
    {
      name: 'Austria',
      video: 'ToqNa0rqUtY',
      artist: 'Conchita Wurst',
      track: 'Rise Like A Phoenix - Eurovision 2014 - Austria'
    },
    {
      name: 'Norway',
      video: '2LBOjxBty8U',
      artist: 'Carl Espen',
      track: 'Silent Storm - Eurovision 2014 - Norway'
    },
    {
      name: 'Azerbaijan',
      video: 'ipQswujA5gw',
      artist: 'Dilara Kazimova',
      track: 'Start A Fire - Eurovision 2014 - Azerbaijan'
    },
    {
      name: 'Israel',
      video: '_uB4JMw4ctc',
      artist: 'Mei Finegold',
      track: 'Same Heart - Eurovision 2014 - Israel'

    },
    {
      name: 'Spain',
      video: 'P9R96ZoWJBU',
      artist: 'Ruth Lorenzo',
      track: 'Dancing In The Rain - Eurovision 2014 - Spain'
    },
    {
      name: 'Greece',
      video: 'z8QIbL9i2MU',
      artist: 'Freaky Fortune',
      track: 'Rise Up - Eurovision 2014 - Greece'
    },
    {
      name: 'Finland',
      video: 'a-NSVFBKU-4',
      artist: 'Softengine',
      track: 'Something Better - Eurovision 2014 - Finland'
    },
    {
      name: 'Russia',
      video: 'MPI7AnD_QS8',
      artist: 'Tolmachevy Sisters',
      track: 'Shine - Eurovision 2014 - Russia'
    },
    {
      name: 'Malta',
      video: 'Qxi5C-lGX2Y',
      artist: 'Firelight',
      track: 'Coming Home - Eurovision 2014 - Malta'
    },
    {
      name: 'Italy',
      video: 'Si9K0ChHzDI',
      artist: 'Emma Marrone',
      track: 'La Mia Città - Eurovision 2014 - Italy'
    },
    {
      name: 'Germany',
      video: 'mTC-4YO_5eE',
      artist: 'Elaiza',
      track: 'Is It Right - Eurovision 2014 - Germany'
    },
    {
      name: 'France',
      video: 'hWJFfnHNOWI',
      artist: 'Twin Twin',
      track: 'Moustache - Eurovision 2014 - France'
    },
    {
      name: 'Montenegro',
      video: 'Xym7CQFFTOU',
      artist: 'Sergej Ćetković',
      track: 'Moj Svijet (Montenegro) 2014 Eurovision Song Contest'
    }
  ];

  return {
    countries: countries
  };

  // countries = countries.slice(0,10);
}]);

app.factory('helpersService', [
  function(){
  'use strict';

  return {
    sortBy: function(column, videos) {
      videos.sort(function(x,y) {
        return y[column] - x[column];
      });
    }
  };
}]);

app.factory('lastfmService', [
  '$q',
  '$http',
  'countriesService',
  'helpersService',
  function($q, $http, countriesService, helpersService){
  'use strict';

  var getSongs = function(){
    var promises = [];
    angular.forEach(countriesService.countries, function(country){
      var promise = $http.get('http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=d36f7d6c194451df9033409d290b8e49&artist=' + country.artist + '&track=' + country.track + '&format=json');
      promises.push(promise);
    });

    return $q.all(promises);
  };

  var parseResponses = function(responses) {
    var songs = [];

    angular.forEach(responses, function(response, i){
      if(response.data.track === undefined) debugger;

      songs.push({
        country: countriesService.countries[i].name,
        listeners: response.data.track.listeners,
        playcount: response.data.track.playcount
      });
    });

    return songs;

  };

  var getFormattedSongs = function(songs) {
    var formattedSongs = {
      countries: [],
      listeners: [],
      playcounts: []
    };

    // change data structure
    angular.forEach(songs, function(song){
      formattedSongs.countries.push(song.country);
      formattedSongs.listeners.push(parseInt(song.listeners, 10));
      formattedSongs.playcounts.push(parseInt(song.playcount, 10));
    });

    return formattedSongs;
  };

  var getChartByPlaycount = function(songs) {
    // sort by playcounts
    helpersService.sortBy('playcount', songs);

    // Limit to top 15
    songs = songs.slice(0,15);

    // Format songs
    songs = getFormattedSongs(songs);

    var chart = {
      type: 'column',
      title: {
        text: 'Playcounts and listeners (live updating)'
      },
      subtitle: {
          text: 'Ordered by playcounts'
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Playcounts'
        }
      },
      xAxis: {
        categories: songs.countries
      },
      series: [{
        color: '#7cb5ec',
        name: 'Playcounts',
        data: songs.playcounts
      },
      {
        color: '#434348',
        name: 'Listeners',
        data: songs.listeners
      }]
    };

    return chart;
  };

  return {
    getChartByPlaycount: getChartByPlaycount,
    getSongs: getSongs,
    parseResponses: parseResponses
  };
}]);

app.factory('youtubeService', [
  '$q',
  '$http',
  'countriesService',
  'helpersService',
  function($q, $http, countriesService, helpersService){
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


  var getChartByViews = function(videos) {
    // Sort by views
    helpersService.sortBy('views', videos);

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
    helpersService.sortBy('score', videos);

    // Limit to top 10
    videos = videos.slice(0,10);

    return videos;
  };

  var getChartByScore = function(videos) {
    videos = getScore(videos);

    // sort by score
    helpersService.sortBy('score', videos);

    // Limit to top 15
    videos = videos.slice(0,15);

    // Format videos
    videos = getFormattedVideos(videos);

    var chart = {
      type: 'column',
      title: {
        text: 'Fancy Eurovision Score (live updating)'
      },
      subtitle: {
          text: 'Ordered by "Eurovision Score"'
      },
      yAxis: [{
        min: 0,
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
    helpersService.sortBy('likes', videos);

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
    helpersService.sortBy('comments', videos);

    // Limit to top 15
    videos = videos.slice(0,15);

    // Format videos
    videos = getFormattedVideos(videos);

    var chart = {
      type: 'column',
      title: {
        text: 'Comments (live updating)'
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

  var getVideos = function() {
    var videoPromises = [];

    // load videos
    angular.forEach(countriesService.countries, function(country){
      var videoPromise = $http({
        method: 'JSONP',
        url: 'https://gdata.youtube.com/feeds/api/videos/' + country.video + '?&v=2&alt=json-in-script&callback=JSON_CALLBACK&fields=yt:rating,yt:statistics,gd:comments(gd:feedLink(@countHint)),title'
      });

      videoPromises.push(videoPromise);
    });

    return $q.all(videoPromises);
  };

  var parseResponses = function(responses) {
    var videos = [];

    angular.forEach(responses, function(response, i){
      var country = countriesService.countries[i].name;
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
