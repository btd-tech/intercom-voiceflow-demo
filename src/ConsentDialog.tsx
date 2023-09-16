import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface ConsentDialogProps {
  open?: boolean;
  onCancel?: () => Promise<void>;
  onConfirm?: () => Promise<void>;
}

export const ConsentDialog = ({ open, onCancel, onConfirm }: ConsentDialogProps) => {
  return (
    <Dialog open={Boolean(open)} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">Consent to chat history analysis</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          By continuing - you agree we can collect your transcript data including conversations with the AI and our Customer Service rep for the
          purpose of analysis and providing a better experience to you. For more information please see this link
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Disagree</Button>
        <Button onClick={onConfirm}>Agree</Button>
      </DialogActions>
    </Dialog>
  );
};
