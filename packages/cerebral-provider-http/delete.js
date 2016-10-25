var convertToGetters = require('./helpers/convertToGetters');
var createFullUrl = require('./helpers/createFullUrl');

function httpDelete(url) {

  var urlGetters = convertToGetters(url);

  function action(args) {
    var http = args.modules['cerebral-module-http'];
    var output = args.output;

    var fullUrl = createFullUrl(urlGetters, args);

    http.services.delete(fullUrl)
      .then(output.success)
      .catch(output.error);
  }

  action.async = true;
  action.displayName = 'http.delete ('  + ([].slice.call(arguments).join(', ')) + ')';

  return action;

}

module.exports = httpDelete;
