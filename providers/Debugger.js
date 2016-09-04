module.exports = function (options) {
  options = options || {}
  var colors = options.colors || {}

  if (typeof window === 'undefined' ||
      (
        typeof window.chrome === 'undefined' &&
        !process && !process.versions && !process.versions.electron
      )
    ) {
    throw new Error('The debugger does not work in this environment, load up the Node debugger instead');
  }

  var isConnected = false
  var APP_ID = String(Date.now())
  var VERSION = 'v1'
  var backlog = []

  function send(debuggingData, context, functionDetails, payload) {
    var type = 'execution'
    var data = {
      name: context._instance.name,
      executionId: context._instance.id,
      functionIndex: functionDetails.functionIndex,
      staticTree: context._instance.staticTree,
      payload: payload,
      datetime: context._instance.datetime,
      data: debuggingData
    };

    if (!isConnected) {
      backlog.push(data)
      return
    }
    var detail = {
      type: type,
      app: APP_ID,
      version: VERSION,
      data: data
    }

    var event = new CustomEvent('function-tree.client.message', {
      detail: JSON.stringify(detail)
    })
    window.dispatchEvent(event)
  }

  function sendInitial(type) {
    var event = new CustomEvent('function-tree.client.message', {
      detail: JSON.stringify({
        type: type,
        app: APP_ID,
        version: VERSION,
        data: {
          functionTrees: backlog
        }
      })
    })
    window.dispatchEvent(event)
  }

  window.addEventListener('function-tree.debugger.pong', function () {
    // When debugger already active, send new init cause new messages
    // might have been prepared while it was waiting for pong
    isConnected = true;
    sendInitial('reinit');
  })
  window.addEventListener('function-tree.debugger.ping', function () {
    // When debugger activates
    isConnected = true
    sendInitial('init')
  })

  sendInitial('init')

  return function(context, functionDetails, payload) {
    context.debugger = {
      send: function (data) {
        send(data, context, functionDetails, payload)
      },
      getColor: function (key) {
        return options.colors[key] || '#333';
      }
    }

    send(null, context, functionDetails, payload)

    return context
  }
}
