import { createStore, combineReducers, applyMiddleware, compose} from 'redux'
//import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk'

import userReducer from './reducers/userReducer'
import spotifyReducer from './reducers/spotifyReducer'
import splitsReducer from './reducers/splitsReducer'
import uiReducer from './reducers/uiReducer'

const initialState = {};

const middleware = [thunk];

const reducers = combineReducers({
    user: userReducer,
    spotify: spotifyReducer,
    splits: splitsReducer,
    UI: uiReducer
})
// console.log('window.__REDUX_DEVTOOLS_EXTENSION__', window.__REDUX_DEVTOOLS_EXTENSION__)
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__() || compose
const store = createStore(reducers, initialState, window.__REDUX_DEVTOOLS_EXTENSION__ ? compose(applyMiddleware(...middleware), window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()) : compose(applyMiddleware(...middleware)))

export default store