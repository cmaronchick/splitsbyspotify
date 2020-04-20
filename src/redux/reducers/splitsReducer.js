import { 
    SET_SPLITS,
    SET_TARGET_PACE,
    SET_SELECTED_DISTANCE,
    SET_ERRORS,
    CLEAR_ERRORS } from '../types'

const initialState = {
    splits: [],
    targetPace: '',
    selectedDistance: ''
}

export default function(state = initialState, action) {
    switch(action.type) {
        case SET_SPLITS: 
            return {
                ...state,
                splits: action.payload
            }
        case SET_TARGET_PACE:
            return {
                ...state,
                targetPace: action.payload
            }
        case SET_SELECTED_DISTANCE:
            return {
                ...state,
                selectedDistance: action.payload
            }
        default:
            return {
                ...state
            }
    }
}