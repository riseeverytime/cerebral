/* eslint-env mocha */
'use strict'

import {Controller} from 'cerebral'
import shortcuts from './'
const jsdom = require('jsdom')

global.document = jsdom.jsdom('<!doctype html><html><body></body></html>')
global.window = document.defaultView

describe('Shortcuts module', () => {
  it('should trigger signal upon keypress of letter "z"', (done) => {
    Controller({
      signals: {
        test: function () {
          done()
        }
      },
      modules: {
        shortcuts: shortcuts({
          'z': 'test'
        })
      }
    })
    document.dispatchEvent(new window.KeyboardEvent('keyup', {key: 'z', char: 'z', keyCode: 90}))
  })
})
