import { stringify } from 'jsan';
import * as actions from '../constants/socketActionTypes';
import { getActiveInstance } from '../reducers/instances';
import {
  UPDATE_STATE,
  REMOVE_INSTANCE,
  LIFTED_ACTION,
  UPDATE_REPORTS,
  GET_REPORT_REQUEST,
  GET_REPORT_SUCCESS
} from '../constants/actionTypes';
import { showNotification, importState } from '../actions';
import { nonReduxDispatch } from '../utils/monitorActions';

let socket;
let store;

function emit({ message: type, id, instanceId, action, state }) {
  if (!socket) {
    return;
  }

  socket.send(JSON.stringify({
    type,
    action,
    state,
    instanceId
  }));
}

function dispatchRemoteAction({ message, action, state, toAll }) {
  const instances = store.getState().instances;
  const instanceId = getActiveInstance(instances);
  const id = !toAll && instances.options[instanceId].connectionId;
  store.dispatch({
    type: actions.EMIT,
    message,
    action,
    state: nonReduxDispatch(
      store,
      message,
      instanceId,
      action,
      state,
      instances
    ),
    instanceId,
    id
  });
}

function onMessage(event) {
  let action = JSON.parse(event.data);

  if (action.type === 'REPORT') {
    store.dispatch({
      type: GET_REPORT_SUCCESS,
      data: action.data,
      id: action.id
    });
    store.dispatch(importState(action.data.payload));
    return;
  }

  if (action.type === 'DISCONNECTED') {
    store.dispatch({
      type: REMOVE_INSTANCE,
      id: action.id
    });
    return;
  }

  if (action.type === 'START') {
    store.dispatch({
      type: actions.EMIT,
      message: 'START',
      id: action.id
    });
    return;
  }

  if (action.type === 'ERROR') {
    store.dispatch(showNotification(action.payload));
    return;
  }

  store.dispatch({
    type: UPDATE_STATE,
    request: action.data ? { ...action.data, id: action.id } : action
  });

  const instances = store.getState().instances;
  const instanceId = action.instanceId || action.id;
  if (
    instances.sync &&
    instanceId === instances.selected &&
    (action.type === 'ACTION' || action.type === 'STATE')
  ) {
    socket.send(JSON.stringify({
      type: 'SYNC',
      state: stringify(instances.states[instanceId]),
      id: action.id,
      instanceId
    }));
  }
}

function startServer(store) {
  const connection = store.getState().connection;
  let socket = new WebSocket(connection.options.url);
  socket.addEventListener('open', () => {
    store.dispatch({
      type: actions.CONNECT_SUCCESS,
      payload: {
        id: '',
        authState: 'AUTHENTICATED',
        socketState: 'OPEN'
      },
      error: null
    });

    store.dispatch({
      type: actions.AUTH_REQUEST
    });
    store.dispatch({
      type: actions.AUTH_SUCCESS
    });
    store.dispatch({
      type: actions.SUBSCRIBE_REQUEST,
      subscription: UPDATE_STATE
    });
    store.dispatch({
      type: actions.SUBSCRIBE_REQUEST,
      subscription: UPDATE_REPORTS
    });
    store.dispatch({
      type: actions.EMIT,
      message: 'START'
    });
  });
  socket.addEventListener('close', () => {
    store.dispatch({ type: actions.DISCONNECTED, code: 0 });
  });

  socket.addEventListener('error', error => {
    store.dispatch({ type: actions.CONNECT_ERROR, error });
  });

  socket.addEventListener('message', onMessage);

  return socket;
}

function connect() {
  try {
    socket = startServer(store);
  } catch (error) {
    store.dispatch({
      type: actions.CONNECT_ERROR,
      error
    });
    store.dispatch(showNotification(error.message || error));
  }
}

function disconnect() {
  socket.close();
}

function getReport(reportId) {
  const instances = store.getState().instances;
  const instanceId = getActiveInstance(instances);

  socket.send(JSON.stringify({
    type: GET_REPORT_REQUEST,
    instanceId,
    reportId
  }));
}

export default function api(inStore) {
  store = inStore;
  return next => action => {
    const result = next(action);
    switch (
      action.type // eslint-disable-line default-case
    ) {
      case actions.CONNECT_REQUEST:
        connect();
        break;
      case actions.RECONNECT:
        disconnect();
        if (action.options.type !== 'disabled') {
          connect();
        }
        break;
      case actions.EMIT:
        if (socket) {
          emit(action);
        }
        break;
      case LIFTED_ACTION:
        dispatchRemoteAction(action);
        break;
      case GET_REPORT_REQUEST:
        getReport(action.report);
        break;
    }
    return result;
  };
}
