"use strict";

import React from "react";
import {Meteor} from "meteor/meteor";
import Snackbar from 'material-ui/Snackbar';
import 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.heat'
import * as _ from "lodash";
import TDXAPI from "nqm-api-tdx/client-api";

import LivemapContainer from "./livemap-container"
import connectionManager from "../../api/manager/connection-manager";

const metricsMetadata = {
  EntryCongestionLevel: {
    color: "#1abc9c",
    text: "Entry Congestion Level"
  },
  ExitCongestionLevel: {
    color: "#3498db",
    text: "Exit Congestion Level"
  },
  RoundaboutEntry: {
    color: "#9b59b6",
    text: "Roundabout Entry"
  },
  RoundaboutEntrySpeed: {
    color: "#e74c3c",
    text: "Roundabout Entry Speed"
  },
  RoundaboutExit: {
    color: "#f39c12",
    text: "Roundabout Exit"
  },
  RoundaboutExitSpeed: {
    color: "#95a5a6",
    text: "Roundabout Exit Speed"
  },
  RoundaboutInside: {
    color: "#16a085",
    text: "Roundabout Inside"
  },
  RoundaboutInsideSpeed: {
    color: "#e67e22",
    text: "Roundabout Inside Speed"
  }
};

class TrafficApp extends React.Component {
  constructor(props) {
    super(props);

    this.tdxApi = new TDXAPI({
      commandHost: Meteor.settings.public.commandHost,
      queryHost: Meteor.settings.public.queryHost,
      accessToken: connectionManager.authToken
    });

    this.state = {
      snackBarMessage:"",
      snackBarOpen: false,
      trafficMetadata: {},
      chartType: "Line",
      ID: null,
      timestampBounds: [0,0],
      metricsKey: null
    };
  }

  _onUpdatePlot(id, timeBounds, metricsKey) {
    this.setState({
      ID: id,
      timestampBounds: timeBounds,
      metricsKey: metricsKey
    });
  }

  handleSnackbarClose() {
    this.setState({
      snackBarOpen: false
    });
  };

  componentWillMount() {
    let trafficMetadata = {};

    this.tdxApi.getDatasetData(Meteor.settings.public.trafficMetadata, null, null, null, (err, data)=>{
      if (err) {
        this.setState({
          snackBarOpen: true,
          snackBarMessage: "No traffic metadata available!"
        });  
      } else {
        if (!data.data.length){
          this.setState({
            snackBarOpen: true,
            snackBarMessage: "No traffic metadata available!"
          });          
        } else {

          _.forEach(data.data, (val)=>{
            trafficMetadata[val.ID] = val;
          });

          this.setState({
            'trafficMetadata': trafficMetadata
          });
        }
      }
    });
  }

  componentDidMount() {
  }

  render() {
    const appBarHeight = Meteor.settings.public.showAppBar !== false ? 50 : 0;
    const leftPanelWidth = 170;
    const styles = {
      root: {
        height: "100%"
      },
      mainPanel: {
        position: "absolute",        
        top: appBarHeight,
        bottom: 0,
        left: leftPanelWidth,
        right: 0
      },
      leftPanel: {
        background: "white",
        position: "fixed",
        top: appBarHeight,
        bottom: 0,
        width: leftPanelWidth
      }
    };

    const resourceLoad = (this.state.ID!=null) ? true : false;
    const resourceOptions = { sort: { timestamp: 1 } };
    
    const resourceFilter = {ID: {$eq: this.state.ID},
                                "$and":[{"timestamp":{"$gte":this.state.timestampBounds[0]}},
                                        {"timestamp":{"$lte":this.state.timestampBounds[1]}}]};
    
    let liveMap = null;

    if (!_.isEmpty(this.state.trafficMetadata)) {
      liveMap =
        (<LivemapContainer
          resourceId={Meteor.settings.public.trafficTable}
          filter={resourceFilter}
          options={resourceOptions}
          load={resourceLoad}
          metricsMetadata={metricsMetadata}
          metaData={this.state.trafficMetadata}
          realTimeData={this.props.data}
          onUpdatePlot={this._onUpdatePlot.bind(this)}
        />);  
    }
    
    let metrics = {};
    if (!this.props.data.length || this.state.ID==null) {
      _.forEach(metricsMetadata, (val, key)=>{
        metrics[key] = 0.0;
      });
    } else if (this.props.data.length && this.state.ID!=null){
      metrics = _.find(this.props.data, (o)=>{return o.ID==this.state.ID});
    }

    const leftMetricsComponent =_.map(metricsMetadata, (val, key)=>{
      return (
            <div className="flex-items-column" style={{background:val.color}} key={key}>
              <p>
                <b className="pnumber">{metrics[key].toFixed(1)}</b><br></br>
                <small className="phead">{val.text}</small>
              </p>
            </div>);
    });

    return (
      <div style={styles.root}>
        <div style={styles.leftPanel}>
          <div className="flex-container-column">
            {leftMetricsComponent}
          </div>
        </div>
        <div style={styles.mainPanel}>
          {liveMap}
        </div>
        <Snackbar
          open={this.state.snackBarOpen}
          message={this.state.snackBarMessage}
          autoHideDuration={4000}
          onRequestClose={this.handleSnackbarClose.bind(this)}
        />
      </div>
    );
  }
}

TrafficApp.propTypes = {
  data: React.PropTypes.array.isRequired,
};

TrafficApp.contextTypes = {
  muiTheme: React.PropTypes.object
};

export default TrafficApp;

