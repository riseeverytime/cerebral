var utils = require('../src/utils')

module.exports = function (context, execution) {
  var action = execution.action
  var signal = execution.signal
  var inputs = [
    {},
    execution.payload,
    action.options.defaultInput ? action.options.defaultInput : {}
  ]
  context.input = utils.merge.apply(null, inputs)

  if (utils.isDeveloping() && action.options.input) {
    try {
      JSON.stringify(context.input)
    } catch (e) {
      console.log('Not serializable', context.input)
      throw new Error('Cerebral - Could not serialize input to signal. Please check signal ' + signal.name)
    }
  }

  return context
}
