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
      trafficMetadata: {},
      chartType: "Line",
      ID: null,
      timestampBounds: [0,0]
    };
  }

  _onUpdatePlot(id, timeBounds) {
    this.setState({
      ID: id,
      timestampBounds: timeBounds
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
    const resourceOptions = { sort: { timestamp: 1 }};
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
          metaData={this.state.trafficMetadata}
          realTimeData={this.props.data}
          onUpdatePlot={this._onUpdatePlot.bind(this)}
        />);  
    }
    
    return (
      <div style={styles.root}>
        <div style={styles.leftPanel}>
          <div className="flex-container-column">
            <div className="flex-items-column" style={{background:"#1abc9c"}}>
              <p>
                <b className="pnumber">23.68</b><br></br>
                <small className="phead">Entry Congestion Level</small>
              </p>
            </div>
            <div className="flex-items-column" style={{background:"#3498db"}}>
              <p>
                <b className="pnumber">23.68</b><br></br>
                <small className="phead">Exit Congestion Speed</small>
              </p>
            </div>
            <div className="flex-items-column" style={{background:"#9b59b6"}}>
              <p>
                <b className="pnumber">23.68</b><br></br>
                <small className="phead">Roundabout Entry</small>
              </p>
            </div>
            <div className="flex-items-column" style={{background:"#e74c3c"}}>
              <p>
                <b className="pnumber">23.68</b><br></br>
                <small className="phead">Roundabout Entry Speed</small>
              </p>
            </div>
            <div className="flex-items-column" style={{background:"#f39c12"}}>
              <p>
                <b className="pnumber">23.68</b><br></br>
                <small className="phead">Roundabout Exit</small>
              </p>
            </div>
            <div className="flex-items-column" style={{background:"#95a5a6"}}>
              <p>
                <b className="pnumber">23.68</b><br></br>
                <small className="phead">Roundabout Exit Speed</small>
              </p>
            </div>
            <div className="flex-items-column" style={{background:"#16a085"}}>
              <p>
                <b className="pnumber">23.68</b><br></br>
                <small className="phead">Roundabout Inside</small>
              </p>
            </div>
            <div className="flex-items-column" style={{background:"#e67e22"}}>
              <p>
                <b className="pnumber">23.68</b><br></br>
                <small className="phead">Roundabout Inside Speed</small>
              </p>
            </div>
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

