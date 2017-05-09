import Tag from '../tags/Tag'

const HELP_URL = 'http://cerebraljs.com/docs/api/operators.html#when'

function whenFactory (...args) {
  const whenFunc = args.length > 1 ? args[args.length - 1] : null
  const valueTemplates = args.length > 1 ? args.slice(0, -1) : args
  function when ({state, path, resolve}) {
    if (valueTemplates.length > 0 && !(valueTemplates[0] instanceof Tag)) {
      throw new Error(`Cerebral operator.when: You have to use the STATE or PROPS TAG as values, see: ${HELP_URL}`)
    }
    if (!path || !path.true || !path.false) {
      throw new Error('Cerebral operator.when: true/false paths need to be provided, see: http://cerebraljs.com/docs/api/operators.html#when')
    }
    const values = valueTemplates.map(value => resolve.value(value))
    const isTrue = Boolean(whenFunc ? whenFunc(...values) : values[0])

    return isTrue ? path.true() : path.false()
  }

  when.displayName = `operator.when(${args.filter((arg) => {
    return typeof arg !== 'function'
  }).map((arg) => {
    return String(arg)
  }).join(',')})`

  return when
}

export default whenFactory
