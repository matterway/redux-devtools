import 'devui/lib/presets';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import configureStore from './store/configureStore';
import { CONNECT_REQUEST } from './constants/socketActionTypes';
import App from './containers/App';

class Root extends Component {
  componentWillMount() {
    configureStore((store) => {
      this.store = store;
      store.dispatch({
        type: CONNECT_REQUEST,
        options: this.props.socketOptions
      });
      this.forceUpdate();
    });
  }

  render() {
    if (!this.store) {
      return null;
    }
    return (
      <Provider store={this.store}>
        <App {...this.props} />
      </Provider>
    );
  }
}

Root.propTypes = {
  socketOptions: PropTypes.shape({
    url: PropTypes.string
  })
};

export default Root;
