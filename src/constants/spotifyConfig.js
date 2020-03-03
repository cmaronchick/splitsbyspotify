import { generateRandomString } from '../functions/utils'

export const spotifyConfig = {
    client_id: '534a806796ed42899cd7a378ecedf8f9',
    client_secret: 'a3f458bed20a4fc5b34e06243d9283c7',
    scope: 'user-read-private user-read-email',
    state: generateRandomString(16),
    stateKey: 'spotify_auth_state'
}