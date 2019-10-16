import * as SETTINGS from 'constants/settings';
import { connect } from 'react-redux';
import { doWalletStatus, doWalletEncrypt, selectWalletEncryptSucceeded, selectWalletEncryptResult } from 'lbry-redux';
import { doHideModal } from 'redux/actions/app';
import { doGetSync, changeSyncPassword } from 'lbryinc';
import { makeSelectClientSetting } from 'redux/selectors/settings';

import ModalWalletEncrypt from './view';

const select = state => ({
  walletEncryptSucceded: selectWalletEncryptSucceeded(state),
  walletEncryptResult: selectWalletEncryptResult(state),
  syncEnabled: makeSelectClientSetting(SETTINGS.ENABLE_SYNC)(state),
});

const perform = dispatch => ({
  closeModal: () => dispatch(doHideModal()),
  encryptWallet: password => dispatch(doWalletEncrypt(password)),
  updateWalletStatus: () => dispatch(doWalletStatus()),
  getSync: password => dispatch(doGetSync(password)),
  changeSyncPassword: (oldPassword, newPassword) => dispatch(changeSyncPassword(oldPassword, newPassword)),
});

export default connect(
  select,
  perform
)(ModalWalletEncrypt);
