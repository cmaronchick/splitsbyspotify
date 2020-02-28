exports.errors = (req, res, next) => {
    console.log('error handler error: ', req.error)
    const error = JSON.parse(req.error.message)
    return res.status(error.code ? error.code : 500).json({ error: error.message ? error.message : 'Something went wrong getting that playlist'})
}