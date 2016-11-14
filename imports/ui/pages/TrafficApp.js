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
      airMetadata: {},
      chartType: "Line",
      siteCode: null,
      timestampBounds: [0,0]
    };
  }

  _onUpdatePlot(id, timeBounds) {
    this.setState({
      siteCode: id,
      timestampBounds: timeBounds
    });
  }

  handleSnackbarClose() {
    this.setState({
      snackBarOpen: false
    });
  };

  componentWillMount() {
    let airMetadata = {};

    this.tdxApi.getDatasetData(Meteor.settings.public.airMetadata, null, null, null, (err, data)=>{
      if (err) {
        this.setState({
          snackBarOpen: true,
          snackBarMessage: "No air metadata available!"
        });  
      } else {
        if (!data.data.length){
          this.setState({
            snackBarOpen: true,
            snackBarMessage: "No air metadata available!"
          });          
        } else {

          _.forEach(data.data, (val)=>{
            airMetadata[val.SiteCode] = val;
          });

          this.setState({
            'airMetadata': airMetadata
          });
        }
      }
    });
  }

  componentDidMount() {
  }

  render() {
    const appBarHeight = Meteor.settings.public.showAppBar !== false ? 50 : 0;
    const styles = {
      root: {
        height: "100%"
      },
      mainPanel: {
        position: "absolute",        
        top: appBarHeight,
        bottom: 0,
        left: 0,
        right: 0
      }
    };

    const resourceLoad = (this.state.siteCode!=null) ? true : false;
    const resourceOptions = { sort: { timestamp: 1 }};
    const resourceFilter = {SiteCode: {$eq: this.state.siteCode},
                                "$and":[{"timestamp":{"$gte":this.state.timestampBounds[0]}},
                                        {"timestamp":{"$lte":this.state.timestampBounds[1]}}]};
    
    let liveMap = null;

    if (!_.isEmpty(this.state.airMetadata)) {
      liveMap =
        (<LivemapContainer
          resourceId={Meteor.settings.public.airTable}
          filter={resourceFilter}
          options={resourceOptions}
          load={resourceLoad}
          metaData={this.state.airMetadata}
          realTimeData={this.props.data}
          onUpdatePlot={this._onUpdatePlot.bind(this)}
        />);  
    }
    
    return (
      <div style={styles.root}>
      <div style={styles.mainPanel}>
        {liveMap}
        <Snackbar
          open={this.state.snackBarOpen}
          message={this.state.snackBarMessage}
          autoHideDuration={4000}
          onRequestClose={this.handleSnackbarClose.bind(this)}
        />
      </div>
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

