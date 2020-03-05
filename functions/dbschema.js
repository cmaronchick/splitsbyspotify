let db = {
    playlists: [
        {
            spotifyUser: 'user',
            playlistId: 'this is a string ID',
            createdAt: '2020-01-27T23:27:21.672Z',
            likeCount: 5,
            commentCount: 5
        }
    ],
    comments: [
        {
            spotifyUser: 'user',
            photoURL: 'this is an image url',
            playlistId: 'this is a string ID',
            createdAt: '2020-01-27T23:27:21.672Z',
            body: 'this is a string'
        }
    ],
    notifications: [
        {
            recipient: 'user',
            sender: 'john',
            read: 'true | false',
            playlistId: 'this is a string ID',
            type: 'like | comment',
            createdAt: '2020-01-27T23:27:21.672Z'
        }
    ]

};
const userDetails = {

}