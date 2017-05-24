export default function (target) {
  function toggle ({state, input, resolve}) {
    if (!resolve.isTag(target, 'state')) {
      throw new Error('Cerebral operator.toggle: You have to use the STATE TAG as first argument')
    }

    const path = resolve.path(target)

    state.toggle(path)
  }

  toggle.displayName = `operator.toggle(${String(target)})`

  return toggle
}
