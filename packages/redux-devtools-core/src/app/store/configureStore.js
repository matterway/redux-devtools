import { createStore, compose, applyMiddleware } from 'redux';
import localForage from 'localforage';
import { getStoredState, createPersistor } from 'redux-persist';
import api from '../middlewares/api';
import exportState from '../middlewares/exportState';
import rootReducer from '../reducers';

function logAction() {
  return (next) => (action) => {
    console.log('DISPATCH', action);

    next(action);
  };
}

export default function configureStore(callback, key) {
  const persistConfig = {
    keyPrefix: `redux-devtools${key || ''}:`,
    blacklist: ['instances', 'socket'],
    storage: localForage,
    serialize: data => data,
    deserialize: data => data
  };

  getStoredState(persistConfig, (err, restoredState) => {
    const store = createStore(
      rootReducer,
      restoredState,
      compose(applyMiddleware(logAction, exportState, api))
    );
    const persistor = createPersistor(store, persistConfig);
    callback(store, restoredState);
    if (err) {
      persistor.purge();
    }
  });
}
