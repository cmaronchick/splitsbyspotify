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

const styles = {
  avatar: {
    backgroundColor: blue[100],
    color: blue[600],
  },
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
  const classes = props.classes;
  const { onClose, playlistId, open } = props;

  const handleClose = () => {
    onClose();
  };

  const handleConfirmDeleteButtonClick = playlistId => {
    props.handleConfirmDeletePlaylist(playlistId);
  };

  return (
    <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
        <DialogTitle id="simple-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
            <DialogContentText id="confirm-delete-text">
                Are you sure you want to delete this playlist?
            </DialogContentText>
            <DialogContentText id="confirm-delete-text" color="error">
                NOTE: You will lose any Splits Playlists that you have previously saved.
            </DialogContentText>
        <DialogActions>
            <Button onClick={() => handleConfirmDeleteButtonClick(playlistId)} className={classes.alertButton} color="secondary" variant="contained">
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

export default withStyles(styles)(ConfirmDeleteDialog)
