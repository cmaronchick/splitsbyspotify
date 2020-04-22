import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

import withStyles from '@material-ui/core/styles/withStyles'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import EditIcon from '@material-ui/icons/Edit'

import MyButton from '../../util/MyButton'


import { connect } from 'react-redux'

import { editUserDetails } from '../../redux/actions/userActions'

const styles = (theme) => ({
    ...theme.spreadThis
})


class EditDetails extends Component {
    constructor(props) {
        super(props)
        this.state = {
            open: false,
            location: '',
            stravaProfile: '',
            bio: ''
        }
    }
    handleOpen = () => {
        this.setState({
            open: true
        })
        this.mapUserDetailsToState(this.props.credentials)
    }

    handleClose = () => {
        this.setState({
            open: false
        })
    }
    handleSubmit = () => {
        const userDetails = {
            bio: this.state.bio,
            stravaProfile: this.state.stravaProfile,
            location: this.state.location
        }
        this.props.editUserDetails(userDetails)
        this.handleClose()
    }
    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        })
    }
    mapUserDetailsToState = (credentials) => {
        this.setState({ 
            location: credentials.location ? credentials.location : '',
            stravaProfile: credentials.stravaProfile ? credentials.stravaProfile : '',
            bio: credentials.bio ? credentials.bio : ''
        })
    }

    componentDidMount() {
        const { credentials } = this.props;
        this.mapUserDetailsToState(credentials)
    }
    render() {
        const { classes } = this.props
        return (
            <Fragment>
                <MyButton tip="Edit Details" 
                    placement="top"
                    onClick={this.handleOpen}
                    btnClassName={classes.button}>
                        <Typography variant="body2">
                            Edit Details
                        </Typography>
                        <EditIcon color="primary" />
                </MyButton>
                <Dialog
                open={this.state.open}
                onClose={this.handleClose}
                fullWidth
                maxWidth="sm">
                    <DialogTitle>Edit Your Details</DialogTitle>
                    <DialogContent>
                        <form>
                            <TextField 
                                name="bio"
                                type="text"
                                label="Bio"
                                placeholder="A short bio about yourself"
                                className={classes.textField}
                                value={this.state.bio}
                                onChange={this.handleChange}
                                multiline
                                fullWidth
                                />
                            <TextField 
                                name="stravaProfile"
                                type="text"
                                label="Strava Profile"
                                placeholder="Your Strava Profile Link"
                                className={classes.textField}
                                value={this.state.stravaProfile}
                                onChange={this.handleChange}
                                fullWidth
                                />
                            <TextField 
                                name="location"
                                type="text"
                                label="Location"
                                placeholder="Where are you from?"
                                className={classes.textField}
                                value={this.state.location}
                                onChange={this.handleChange}
                                fullWidth
                                />
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.handleSubmit} color="secondary">
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
            </Fragment>
        )
    }
}

EditDetails.propTypes = {
    editUserDetails: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired

}

const mapStateToProps = (state) => ({
    credentials: state.user.FBUser.credentials
})

export default connect(mapStateToProps, { editUserDetails })(withStyles(styles)(EditDetails))
