'use strict'

var AttributeFilter = require('../../../lib/config/attribute-filter')
var benchmark = require('../../lib/benchmark')
var copy = require('../../../lib/util/copy')
var EventEmitter = require('events').EventEmitter


var suite = benchmark.createBenchmark({
  name: 'config.filter'
})

var filter = makeFilter({
  attributes: {
    enabled: true,
    include: [
      'request.headers.global-include-exact',
      'request.headers.global-include-other',
      'request.headers.global-include-wild*',
      'request.headers.global-include-other*',
      'request.uri'
    ],
    exclude: [
      'request.headers.global-exclude-exact',
      'request.headers.global-exclude-other',
      'request.headers.global-exclude-wild*',
      'request.headers.global-exclude-other*'
    ]
  },
  transaction_tracer: {
    attributes: {
      enabled: true,
      include: [
        'request.headers.tt-include-exact',
        'request.headers.tt-include-other',
        'request.headers.tt-include-wild*',
        'request.headers.tt-include-other*'
      ],
      exclude: [
        'request.headers.tt-exclude-exact',
        'request.headers.tt-exclude-other',
        'request.headers.tt-exclude-wild*',
        'request.headers.tt-exclude-other*'
      ]
    }
  }
})

var attributes = [
  'request.headers.global-include-exact',
  'request.headers.global-include-wildcard',

  'request.headers.global-exclude-exact',
  'request.headers.global-exclude-wildcard',

  'request.headers.tt-include-exact',
  'request.headers.tt-include-wildcard',

  'request.headers.tt-exclude-exact',
  'request.headers.tt-exclude-wildcard',

  'request.headers.no-rules-match'
]

attributes.forEach(function(attr) {
  suite.add({
    name: attr,
    fn: function() {
      return filter.filter(AttributeFilter.DESTINATIONS.TRANS_TRACE, attr)
    }
  })
})

suite.run()

function makeFilter(opts) {
  var config = new EventEmitter()
  copy.shallow(opts, config)
  config.attributes.filter_cache_limit = 1000
  config.transaction_events = config.error_collector = config.browser_monitoring = {
    attributes: {
      enabled: true,
      include: [],
      exclude: []
    }
  }
  return new AttributeFilter(config)
}
