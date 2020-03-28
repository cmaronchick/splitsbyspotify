import { createStore, combineReducers, applyMiddleware, compose} from 'redux'
//import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk'

import userReducer from './reducers/userReducer'
import spotifyReducer from './reducers/spotifyReducer'
import uiReducer from './reducers/uiReducer'

const initialState = {};

const middleware = [thunk];

const reducers = combineReducers({
    user: userReducer,
    spotify: spotifyReducer,
    UI: uiReducer
})

const store = createStore(reducers, initialState, compose(applyMiddleware(...middleware), window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()))

export default store