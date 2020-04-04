import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import NoImg from '../images/noImg.png'

import Card from '@material-ui/core/Card'
import CardMedia from '@material-ui/core/CardMedia'
import CardContent from '@material-ui/core/CardContent'

import withStyles from '@material-ui/core/styles/withStyles'

const styles = (theme) => ({
    ...theme.spreadThis,
})

const PlaylistSkeleton = props => {
    const { classes } = props

    const content = Array.from({ length: 5})
        .map((item, index) => (
            <Card className={classes.skeletonCard} key={index}>
                <CardMedia className={classes.skeletonCover} image={NoImg}/>
                <CardContent className={classes.skeletonCardContent}>
                    <div className={classes.skeletonSpotifyUser}>

                    </div>
                    <div className={classes.skeletonDate}>
                        
                    </div>
                    <div className={classes.skeletonFullLine}>
                        
                    </div>
                    <div className={classes.skeletonFullLine}>
                        
                    </div>
                    <div className={classes.skeletonHalfLine}>
                        
                    </div>
                </CardContent>
            </Card>
        ))
    return (
        <Fragment>
            {content}
        </Fragment>
    )
}

PlaylistSkeleton.propTypes = {
    classes: PropTypes.object.isRequired

}

export default withStyles(styles)(PlaylistSkeleton)
