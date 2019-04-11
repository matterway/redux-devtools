import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Tabs } from 'matterway-devui';
import StateTree from 'redux-devtools-inspector/lib/tabs/StateTab';
import ActionTree from 'redux-devtools-inspector/lib/tabs/ActionTab';
import DiffTree from 'redux-devtools-inspector/lib/tabs/DiffTab';
import { selectMonitorTab } from '../../../actions';
import RawTab from './RawTab';
import ChartTab from './ChartTab';
import VisualDiffTab from './VisualDiffTab';

class SubTabs extends Component {
   selector = () => {
    switch (this.props.parentTab) {
      case 'Action':
        return { data: this.props.action };
      case 'Diff':
        return { data: this.props.delta };
      default:
        return { data: this.props.nextState };
    }
  };

  getTabs(props) {
    const parentTab = props.parentTab;

    if (parentTab === 'Diff') {
      return [
        {
          name: 'Tree',
          component: DiffTree,
          selector: () => this.props
        },
        {
          name: 'Raw',
          component: VisualDiffTab,
          selector: this.selector
        }
      ];
    }

    return [
      {
        name: 'Tree',
        component: parentTab === 'Action' ? ActionTree : StateTree,
        selector: () => this.props
      },
      {
        name: 'Chart',
        component: ChartTab,
        selector: this.selector
      },
      {
        name: 'Raw',
        component: RawTab,
        selector: this.selector
      }
    ];
  }

  render() {
    let selected = this.props.selected;
    let tabs = this.getTabs(this.props);

    let hasTab = tabs.some(({name}) => {
      return name === selected;
    });

    if (!hasTab) {
      selected = tabs[0].name;
    }

    return (
      <Tabs
        key={this.props.parentTab}
        tabs={tabs}
        selected={selected}
        onClick={this.props.selectMonitorTab}
      />
    );
  }
}

SubTabs.propTypes = {
  selected: PropTypes.string,
  parentTab: PropTypes.string,
  selectMonitorTab: PropTypes.func.isRequired,
  action: PropTypes.object,
  delta: PropTypes.object,
  nextState: PropTypes.object
};

function mapStateToProps(state) {
  return {
    parentTab: state.monitor.monitorState.tabName,
    selected: state.monitor.monitorState.subTabName
  };
}

function mapDispatchToProps(dispatch) {
  return {
    selectMonitorTab: bindActionCreators(selectMonitorTab, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SubTabs);
