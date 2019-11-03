import { Lbry, ACTIONS, doToast } from 'lbry-redux';
import analytics from 'analytics';
import { launcher } from 'util/autoLaunch';
import * as SETTINGS from 'constants/settings';
import { makeSelectClientSetting } from 'redux/selectors/settings';

const UPDATE_IS_NIGHT_INTERVAL = 5 * 60 * 1000;

export function doFetchDaemonSettings() {
  return dispatch => {
    Lbry.settings_get().then(settings => {
      analytics.toggle(settings.share_usage_data);
      dispatch({
        type: ACTIONS.DAEMON_SETTINGS_RECEIVED,
        data: {
          settings,
        },
      });
    });
  };
}

export function doSetDaemonSetting(key, value) {
  return dispatch => {
    const newSettings = {
      key,
      value: !value && value !== false ? null : value,
    };
    Lbry.settings_set(newSettings).then(newSettings);
    Lbry.settings_get().then(settings => {
      analytics.toggle(settings.share_usage_data);
      dispatch({
        type: ACTIONS.DAEMON_SETTINGS_RECEIVED,
        data: {
          settings,
        },
      });
    });
  };
}

export function doSetClientSetting(key, value) {
  return {
    type: ACTIONS.CLIENT_SETTING_CHANGED,
    data: {
      key,
      value,
    },
  };
}

export function doUpdateIsNight() {
  return {
    type: ACTIONS.UPDATE_IS_NIGHT,
  };
}

export function doUpdateIsNightAsync() {
  return dispatch => {
    dispatch(doUpdateIsNight());

    setInterval(() => dispatch(doUpdateIsNight()), UPDATE_IS_NIGHT_INTERVAL);
  };
}

export function doSetDarkTime(value, options) {
  const { fromTo, time } = options;
  return (dispatch, getState) => {
    const state = getState();
    const darkModeTimes = state.settings.clientSettings[SETTINGS.DARK_MODE_TIMES];
    const { hour, min } = darkModeTimes[fromTo];
    const newHour = time === 'hour' ? value : hour;
    const newMin = time === 'min' ? value : min;
    const modifiedTimes = {
      [fromTo]: {
        hour: newHour,
        min: newMin,
        formattedTime: newHour + ':' + newMin,
      },
    };
    const mergedTimes = { ...darkModeTimes, ...modifiedTimes };

    dispatch(doSetClientSetting(SETTINGS.DARK_MODE_TIMES, mergedTimes));
    dispatch(doUpdateIsNight());
  };
}

export function doSetAutoLaunch(value) {
  return (dispatch, getState) => {
    const state = getState();

    const autoLaunch = makeSelectClientSetting(SETTINGS.AUTO_LAUNCH)(state);

    if (value === undefined) {
      console.log('undefined:,', String(autoLaunch), value && String(value));
      launcher.isEnabled().then(isEnabled => {
        if (isEnabled) {
          if (!autoLaunch) {
            launcher.disable().then(() => {
              dispatch(doSetClientSetting(SETTINGS.AUTO_LAUNCH, false));
              dispatch(
                doToast({
                  message: __('LBRY auto-launch on login disabled.'),
                })
              );
            });
          }
        } else {
          if (autoLaunch) {
            launcher.enable().then(() => {
              dispatch(doSetClientSetting(SETTINGS.AUTO_LAUNCH, true));
              dispatch(
                doToast({
                  message: __('LBRY auto-launch on login enabled.'),
                })
              );
            });
          }
        }
      });
    } else if (value === true) {
      launcher.isEnabled().then(function(isEnabled) {
        if (!isEnabled) {
          launcher
            .enable()
            .then(() => {
              dispatch(doSetClientSetting(SETTINGS.AUTO_LAUNCH, true));
              dispatch(
                doToast({
                  message: __('LBRY auto-launch on login enabled.'),
                })
              );
            })
            .catch();
        }
      });
    } else {
      launcher.isEnabled().then(function(isEnabled) {
        if (isEnabled) {
          launcher.disable().then(() => {
            dispatch(doSetClientSetting(SETTINGS.AUTO_LAUNCH, false));
            dispatch(
              doToast({
                message: __('LBRY auto-launch on login disabled.'),
              })
            );
          });
        }
      });
    }
  };
}
