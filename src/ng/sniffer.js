'use strict';

/**
 * !!! This is an undocumented "private" service !!!
 *
 * @name ng.$sniffer
 * @requires $window
 *
 * @property {boolean} history Does the browser support html5 history api ?
 * @property {boolean} hashchange Does the browser support hashchange event ?
 *
 * @description
 * This is very simple implementation of testing browser's features.
 */
function $SnifferProvider() {
  var historyPushStateUpdatesURL;

  this.$get = ['$window', function($window) {
    var eventSupport = {};

    // Android has history.pushState, but it does not update location correctly
    // so let's not use the history API at all.
    // http://code.google.com/p/android/issues/detail?id=17471
    // https://github.com/angular/angular.js/issues/904
    //
    // Detect this issue by checking whether browser history.pushState changes URL
    // rather then relying on browser userAgent string.
    if(historyPushStateUpdatesURL === undefined){
      historyPushStateUpdatesURL = !!($window.history && $window.history.pushState);

      if(historyPushStateUpdatesURL){
        var urlToken = '__ANGULARJS__';
        var originalHref = $window.location.href;
        var originalTitle = $window.document.title;

        $window.history.pushState(null, '', urlToken);
        historyPushStateUpdatesURL = $window.location.href.indexOf(urlToken) > -1;

        if (historyPushStateUpdatesURL)
        {
          $window.history.replaceState(null, originalTitle, originalHref);
        }
      }
    }

    return {
      history: !!historyPushStateUpdatesURL,
      hashchange: 'onhashchange' in $window &&
                  // IE8 compatible mode lies
                  (!$window.document.documentMode || $window.document.documentMode > 7),
      hasEvent: function(event) {
        // IE9 implements 'input' event it's so fubared that we rather pretend that it doesn't have
        // it. In particular the event is not fired when backspace or delete key are pressed or
        // when cut operation is performed.
        if (event == 'input' && msie == 9) return false;

        if (isUndefined(eventSupport[event])) {
          var divElm = $window.document.createElement('div');
          eventSupport[event] = 'on' + event in divElm;
        }

        return eventSupport[event];
      },
      // TODO(i): currently there is no way to feature detect CSP without triggering alerts
      csp: false
    };
  }];
}
