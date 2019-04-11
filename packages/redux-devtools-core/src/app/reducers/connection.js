import { RECONNECT, CONNECT_REQUEST } from '../constants/socketActionTypes';

export default function connection(
  state = {
    options: {
      url: ''
    }
  },
  action
) {
  if (action.type === CONNECT_REQUEST) {
    const options = action.options;
    return { ...state, options };
  }
  if (action.type === RECONNECT) {
    const options = action.options;
    return { ...state, options };
  }
  return state;
}
