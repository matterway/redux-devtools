import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InspectorMonitor from 'redux-devtools-inspector';
import StackTraceTab from 'redux-devtools-trace-monitor';
import { DATA_TYPE_KEY } from '../../../constants/dataTypes';
import SubTabs from './SubTabs';

const DEFAULT_TABS = [
  {
    name: 'Action',
    component: SubTabs
  },
  {
    name: 'State',
    component: SubTabs
  },
  {
    name: 'Diff',
    component: SubTabs
  },
  {
    name: 'Trace',
    component: StackTraceTab
  }
];

class InspectorWrapper extends Component {
  static update = InspectorMonitor.update;

  render() {
    const { features, ...rest } = this.props;
    let tabs = () => DEFAULT_TABS;

    return (
      <InspectorMonitor
        dataTypeKey={DATA_TYPE_KEY}
        shouldPersistState={false}
        invertTheme={false}
        tabs={tabs}
        hideActionButtons={!features.skip}
        hideMainButtons
        {...rest}
      />
    );
  }
}

InspectorWrapper.propTypes = {
  features: PropTypes.object
};

export default InspectorWrapper;
