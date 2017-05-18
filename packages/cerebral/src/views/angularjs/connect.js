function connect (dependencies, extendedCtrl) {
  if (typeof extendedCtrl === 'function') {
    return ['cerebral', '$scope', function (cerebral, $scope) {
      cerebral.connect(this, $scope, dependencies)
      extendedCtrl.call(this)
    }]
  } else if (Array.isArray(extendedCtrl)) {
    const ctrl = extendedCtrl.pop()

    return ['cerebral', '$scope'].concat(extendedCtrl, function (cerebral, $scope, ...services) {
      cerebral.connect(this, $scope, dependencies)
      ctrl.apply(this, services)
    })
  }
  return ['cerebral', '$scope', function (cerebral, $scope) {
    cerebral.connect(this, $scope, dependencies)
  }]
}

export default connect