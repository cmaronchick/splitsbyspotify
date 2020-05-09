import * as actions from '../redux/actions/spotifyActions'
import * as types from '../redux/types'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'

import firebase from '../constants/firebase'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('async actions', () => {
  afterEach(() => {
    fetchMock.restore()
  })

  it('creates FETCH_TODOS_SUCCESS when fetching todos has been done', () => {
    fetchMock.get('http://localhost:5001/splitsbyspotify/us-central1/api/user/chupathing', {
      body: { todos: ['do something'] },
      headers: { 'content-type': 'application/json' }
    })

    const expectedActions = [
      { type: types.LOADING_PLAYLISTS_ALL },
      { type: types.FETCH_TODOS_SUCCESS, body: { todos: ['do something'] } }
    ]
    const store = mockStore({ todos: [] })

    return store.dispatch(actions.getAllPlaylists()).then(data => {
      // return of async actions
      console.log('data', data)
      expect(store.getActions()).toEqual(expectedActions)
    })
  })
})