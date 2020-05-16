import { SET_SPLITS, SET_TARGET_PACE, SET_SELECTED_DISTANCE, SET_SELECTED_MEASUREMENT } from '../types'
import firebase from '../../constants/firebase'

export const calculateSplits = (selectedDistance, targetPace) => (dispatch) => {
    firebase.analytics().logEvent( 'splits', { action: 'calculated', selectedDistance, targetPace})

    if (targetPace.indexOf(':') === -1) {
      targetPace = `${targetPace}:00`
    }
    dispatch({
      type: SET_TARGET_PACE,
      payload: targetPace
    })
    const minPerMile = parseInt(targetPace.split(':')[0])
    const secPerMile = targetPace.split(':').length > 1 ? parseFloat(targetPace.split(':')[1]/60) : 0
    const splitPace = minPerMile + secPerMile
    let splits = []
    let remainingDistance = selectedDistance
    let elapsedMinutes = 0;
    let elapsedSeconds = 0;
    let elapsedTime = 0;
    let split = ""
    let i = 1
    while (remainingDistance > 0) {
      elapsedTime = (i * splitPace)
      elapsedMinutes = Math.floor(elapsedTime)
      elapsedSeconds = ((elapsedTime-elapsedMinutes) * 60).toFixed(0)
      if (remainingDistance > 0 && remainingDistance < 1) {
        elapsedTime = ((i-1) * splitPace)
        elapsedMinutes = Math.floor(elapsedTime)
        elapsedSeconds = (remainingDistance * splitPace).toFixed(2)
        //console.log('elapsedSeconds', (elapsedSeconds - Math.floor(elapsedSeconds)))
        if (elapsedSeconds >= 1) {
          elapsedMinutes += Math.floor(elapsedSeconds)
          elapsedSeconds = Math.round(((elapsedSeconds - Math.floor(elapsedSeconds))*60)).toFixed(0)
        } else {
          elapsedSeconds = Math.round(((elapsedSeconds - Math.floor(elapsedSeconds))*60)).toFixed(0)
        }
        elapsedTime = elapsedMinutes + elapsedSeconds / 60
        console.log('elapsedTime', elapsedTime)
      }
      if (elapsedSeconds >= 60) {
        elapsedMinutes += elapsedSeconds%60
        elapsedSeconds = elapsedSeconds - (elapsedMinutes*60)
        elapsedSeconds = elapsedSeconds < 10 ? `0${elapsedSeconds}` : elapsedSeconds
      }
      split = `${elapsedMinutes}:${elapsedSeconds < 10 ? `0${elapsedSeconds}` : elapsedSeconds}`
      splits.push(split)
      remainingDistance = selectedDistance - i
      i++
    }
    dispatch({
        type: SET_SPLITS,
        payload: {
          splits,
          elapsedTime
        }
    })
}

export const setTargetPace = (targetPace) => (dispatch) => {
    dispatch({
        type: SET_TARGET_PACE,
        payload: targetPace
    })
}

export const setSelectedDistance = (selectedDistance) => (dispatch) => {
    dispatch({
        type: SET_SELECTED_DISTANCE,
        payload: selectedDistance
    })
}

export const setSelectedMeasurement = (selectedMeasurement) => (dispatch) => {
  localStorage.selectedMeasurement = selectedMeasurement
    dispatch({
        type: SET_SELECTED_MEASUREMENT,
        payload: selectedMeasurement
    })
}