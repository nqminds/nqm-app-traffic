'use strict';

import React from 'react';
import Chartist from 'chartist';

class ChartistGraph extends React.Component {

    constructor(props) {
        super(props);
    }

//  displayName: 'ChartistGraph'

  componentWillReceiveProps(newProps) {
    this.updateChart(newProps);
  }

  componentWillUnmount() {
    if (this.chartist) {
      try {
        this.chartist.detach();
      } catch (err) {
        throw new Error('Internal chartist error', err);
      }
    }
  }

  componentDidMount() {
    this.updateChart(this.props);
  }

  updateChart(config) {
    let Chartist = require('chartist');

    let { type, data } = config;
    let options = config.options || {};
    let responsiveOptions = config.responsiveOptions || [];
    let event;

    if (this.chartist) {
      this.chartist.update(data, options, responsiveOptions);
    } else {
      this.chartist = new Chartist[type](this.refs[config.id], data, options, responsiveOptions);

      if (config.listener) {
        for (event in config.listener) {
          if (config.listener.hasOwnProperty(event)) {
            this.chartist.on(event, config.listener[event]);
          }
        }
      }

    }

    return this.chartist;
  }

  render() {
    const className = this.props.className ? ' ' + this.props.className : ''
    const style = this.props.style ? this.props.style : {};

    return (<div className={'ct-chart' + className} ref={this.props.id} id={this.props.id} style={style} />)
  }

}

ChartistGraph.propTypes = {
  id: React.PropTypes.string.isRequired,
  type: React.PropTypes.string.isRequired,
  data: React.PropTypes.object.isRequired,
  className: React.PropTypes.string,
  options: React.PropTypes.object,
  responsiveOptions: React.PropTypes.array,
  style: React.PropTypes.object
}

export default ChartistGraph;