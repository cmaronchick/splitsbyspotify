import { 
    SET_SPLITS,
    SET_TARGET_PACE,
    SET_SELECTED_DISTANCE,
    SET_SELECTED_MEASUREMENT,
    SET_ERRORS,
    CLEAR_ERRORS } from '../types'

const initialState = {
    splits: [],
    targetPace: null,
    selectedDistance: 0,
    selectedMeasurement: localStorage.selectedMeasurement ? localStorage.selectedMeasurement : 'mi'
}

export default function(state = initialState, action) {
    switch(action.type) {
        case SET_SPLITS: 
            return {
                ...state,
                splits: action.payload.splits,
                elapsedTime: action.payload.elapsedTime
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
        case SET_SELECTED_MEASUREMENT:
            return {
                ...state,
                selectedMeasurement: action.payload
            }
        default:
            return {
                ...state
            }
    }
}