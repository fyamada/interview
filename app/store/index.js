const axios = require('axios')
const moment = require('moment')
const Vue = require('vue')
const Vuex = require('vuex')
const state = require('./powerball-state')
const logger = require('../logger.js')
const { PowerballDraw } = require('../types')

Vue.use(Vuex)

/**
 * Helper API to reference Vuex store exposed features.
 * What is not listed in this API is not expected to be
 * accessed from outside the store.
 */
const STORE_API = {
  ACTIONS: {
    INIT: 'init',
    FETCH_DRAWS: 'fetchDraws'
  },
  GETTERS: {
    GET_DRAW_BY_DATE: 'getDrawByDate',
    GET_DRAWS_STATS: 'getDrawsStats'
  },
  MUTATIONS: {
    INCREMET: 'increment',
    DRAW_ENDPOINT: 'setDrawEndpoint',
    DRAWS: 'setDraws'
  },
  STATE: {
    COUNT: 'count',
    DRAWS_FETCH_TIME: 'drawsFetchTime',
    DRAWS_LOADED: 'drawsLoaded'
  }
}

const store = new Vuex.Store({
  state,
  actions: {
    async init({ dispatch }) {
      logger.info('Initializing vuex store')
      dispatch(STORE_API.ACTIONS.FETCH_DRAWS, 0) // fetch draws immediately timeout = 0
    },
    async fetchDraws({ dispatch, state, commit}, timeout=60*60*1000 ) {
      setTimeout(() =>{
          logger.info('Fetching draws from ' + state.drawEndpoint)
          axios.get(state.drawEndpoint)
            .then(function (response) {
              logger.info(response.data.length + ' draws fetch')
              commit(STORE_API.MUTATIONS.DRAWS, response.data)
              dispatch(STORE_API.ACTIONS.FETCH_DRAWS) // schedule to re fetch on default timeout
              return
            })
            .catch(function (error) {
              logger.error(`Fecthing draws error: ${error.message}`)
              dispatch(STORE_API.ACTIONS.FETCH_DRAWS, 5*60*1000) // try again in 5min
            })
      }, timeout)
    },
  },
  getters: {
    getDrawByDate: (state) => (draw_date) => {
      try {
        return state.draws[draw_date]
      } catch(error) {
        logger.warn(`Draw date ${draw_date} not found. Error message: ${error.message}`)
        return {}
      }
    },
    getDrawsStats: (state) => {
      let drawsKeys = Object.keys(state.draws)
      let drawDates = drawsKeys.map(drawDate => moment(drawDate))
      let stats = {
        drawsLoaded: drawsKeys.length,
        drawsFetchTime: state.drawsFetchTime,
        minDrawDate: moment.min(drawDates),
        maxDrawDate: moment.max(drawDates)
      }
      return stats
    }
  },
  mutations: {
    increment (state) {
      state.count++
    },
    setDrawEndpoint (state, drawEndpoint) {
      state.drawEndpoint = drawEndpoint
    },
    /**
     * Replace state draws based on new array of draws. Keep existing draws
     * if the new array is empty. Only drawings passing compliance checks are
     * added to state (amount of numbers and number range checks). Draw date
     * is used as key, thus dups are removed and the latest drawing processed
     * for a given date will be kept into state.
     * @param {*} state Default Vuex state injection
     * @param {*} draws News drawings to update state
     */
    setDraws(state, draws) {
      if (typeof(draws) != "undefined" && draws.length > 0) {
        let draws_ = {}
        draws.forEach(draw => {
          try {
            let draw_ = Object.assign(new PowerballDraw(), draw)
            draw_.init() // ensure draw ball's numbers quality
            draws_[draw.draw_date] = draw_
          } catch(error) {
            logger.error(`Error parsing drawing ${JSON.stringify(draw)}`)
          }
        })
        state.draws = draws_
        state.drawsFetchTime = moment().format()
      }
      if(typeof(state.draws) == "undefined" || Object.keys(state.draws).length == 0){
        state.drawsLoaded = false
      } else {
        state.drawsLoaded = true
      }
    },
  }
})

module.exports = {
  store,
  STORE_API
}