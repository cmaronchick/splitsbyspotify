import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

//MUI Stuff
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import Badge from '@material-ui/core/Badge'
import Typography from '@material-ui/core/Typography'

import NotificationIcon from '@material-ui/icons/Notifications'
import FavoriteIcon from '@material-ui/icons/Favorite'
import ChatIcon from '@material-ui/icons/Chat'

//redux stuff

import { connect } from 'react-redux'
import { markNotificationsRead } from '../../redux/actions/userActions'

class Notifications extends Component {
    state = {
        anchorEl: null
    }
    handleOpen = (event) => {
        this.setState({
            anchorEl: event.target
        })
    }
    handleClose = () => {
        this.setState({
            anchorEl: null
        })
    }
    onMenuOpened = () => {
        let unreadNotificationIds = this.props.notifications
            .filter(not => !not.read)
            .map(not => not.notificationId)
        this.props.markNotificationsRead(unreadNotificationIds)
    }
    render() {
        dayjs.extend(relativeTime)
        const notifications = this.props.notifications
        const anchorEl = this.state.anchorEl

        let notificationIcon;
        notificationIcon = (notifications && notifications.length > 0) ?
            notifications.filter(not => not.read === false).length > 0
            ? (
                <Badge badgeContent={notifications.filter(not => not.read === false).length}
                    color="secondary">
                        <NotificationIcon />
                </Badge>
            ) : (
                <NotificationIcon />
            ) : (
                <NotificationIcon />
            )
        let notificationsMarkup = notifications && notifications.length > 0 ? (
            notifications.map(not => {
                const verb = not.type === 'like' ? 'liked' : not.type === 'comment' ? 'commented on' : 'followed'
                const time = dayjs(not.createdAt).fromNow()
                const iconColor = not.read ? 'primary' : 'secondary'
                const icon = not.type === 'like' ? (
                    <FavoriteIcon color={iconColor} style={{ marginRight: 10}}/>
                ) : (
                    <ChatIcon color={iconColor} style={{marginRight: 10}}/>
                )
                return (
                    <MenuItem
                        key={not.createdAt}
                        onClick={this.handleClose}>
                            {icon} 
                            <Typography
                                component={Link}
                                color="primary"
                                variant="body1"
                                to={`/playlist/${not.firebasePlaylistId}`}>
                                    {not.sender} {verb} your playlist {time}
                            </Typography>
                    </MenuItem>
                )
            })
        ) : (
            <MenuItem onClick={this.handleClose}>
                You have no notifications yet.
            </MenuItem>
        )
        return (
            <Fragment>
                <Tooltip placement="top" title="Notifications">
                    <IconButton aria-owns={anchorEl ? 'simple-menu' : undefined}
                    aria-haspopup="true"
                    onClick={this.handleOpen}>
                        {notificationIcon}
                    </IconButton>
                </Tooltip>
                <Menu 
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={this.handleClose}
                    onEntered={this.onMenuOpened}>
                        {notificationsMarkup}
                </Menu>
            </Fragment>
        )
    }
}

Notifications.propTypes = {
    markNotificationsRead: PropTypes.func.isRequired,
    notifications: PropTypes.array.isRequired
}

const mapStateToProps = (state) => ({
    notifications: state.user.FBUser ? state.user.FBUser.notifications : []
})

export default connect(mapStateToProps, { markNotificationsRead })(Notifications)
