import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogActions from '@material-ui/core/DialogActions'
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { blue } from '@material-ui/core/colors';

import { confirmRemoveFromMyPlaylists } from '../../redux/actions/spotifyActions'

import { connect } from 'react-redux'

const styles = {
  dialog: {
      padding: 10
  },
  buttonDiv: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center'
  },
  alertButton: {
      backgroundColor: '#f44336'
  }
};

const ConfirmDeleteDialog = (props) => {
  const { classes, onClose, spotify, open } = props;
  const { removeSpotifyPlaylistId, removeFirebasePlaylistId, removePlaylistName } = spotify


  const handleClose = () => {
    onClose();
  };

  const handleConfirmDeleteButtonClick = (spotifyPlaylistId, firebasePlaylistId) => {
    console.log('spotifyPlaylistId, firebasePlaylistId', spotifyPlaylistId, firebasePlaylistId)
    props.handleConfirmDeletePlaylist(spotifyPlaylistId, firebasePlaylistId);
  };

  return (
    <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
        <DialogTitle id="simple-dialog-title">Confirm {removePlaylistName} Delete</DialogTitle>
        <DialogContent>
            <DialogContentText id="confirm-delete-text">
                Are you sure you want to delete this playlist?
            </DialogContentText>
            <DialogContentText id="confirm-delete-text" color="error">
                NOTE: All comments, likes, and follows for this playlist will be lost PERMANENTLY.
            </DialogContentText>
        <DialogActions>
            <Button onClick={() => handleConfirmDeleteButtonClick(removeSpotifyPlaylistId, removeFirebasePlaylistId)} className={classes.alertButton} color="secondary" variant="contained">
                Delete
            </Button>
            <Button onClick={() => handleClose()}>
                Cancel
            </Button>
        </DialogActions>
        </DialogContent>
    </Dialog>
  );
}

ConfirmDeleteDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  spotify: state.spotify
})

const mapActionsToProps = {
  confirmRemoveFromMyPlaylists
}

export default connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(ConfirmDeleteDialog))
