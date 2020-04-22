import React, { Component } from 'react'
import PropTypes from 'prop-types'

import withStyles from '@material-ui/core/styles/withStyles'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import EditIcon from '@material-ui/icons/Edit'

import MyButton from '../../util/MyButton'

import { connect } from 'react-redux'

import { commentOnPlaylist } from '../../redux/actions/spotifyActions'

const styles = theme => ({
    ...theme.spreadThis,
    submitButton: {
        position: 'relative'
    },
    progressSpinner: {
        position: 'absolute'
    },
    closeButton: {
        position: 'absolute',
        left: '90%',
        top: '10%'
    }

})

class PostComment extends Component {
    constructor(props) {
        super(props)
        this.state = {
            firebasePlaylistId: props.firebasePlaylistId,
            body: ''
        }
    }
    handleChange = (event) => {
      this.setState({ [event.target.name]: event.target.value });
    };
    handleSubmit = (event) => {
      event.preventDefault();
      this.props.commentOnPlaylist(this.props.firebasePlaylistId, { body: this.state.body });
    };

    render() {

    const { classes, authenticated } = this.props;
    const errors = this.state.errors;
    const commentFormMarkup = authenticated ? (
        <Grid item sm={12} style={{ textAlign: 'center', padding: 12 }}>
          <form onSubmit={this.handleSubmit}>
            <TextField
              name="body"
              type="text"
              label="Comment on playlist"
              error={errors && errors.comment ? true : false}
              helperText={errors && errors.comment}
              value={this.state.body}
              onChange={this.handleChange}
              fullWidth
              className={classes.textField}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              className={classes.button}
            >
              Submit
            </Button>
          </form>
          <hr className={classes.invisibleSeparator} />
        </Grid>
      ) : null;
      return commentFormMarkup;
    }
}

PostComment.propTypes = {
  classes: PropTypes.object.isRequired,
  authenticated: PropTypes.bool.isRequired,
  firebasePlaylistId: PropTypes.string.isRequired
}


const mapActionsToProps = {
    commentOnPlaylist: (firebasePlaylistId, body) => commentOnPlaylist(firebasePlaylistId, body)
}
const mapStateToProps = (state)  => ({
    authenticated: state.user.authenticated
})

export default connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(PostComment))