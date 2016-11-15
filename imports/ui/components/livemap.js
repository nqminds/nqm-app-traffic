/*
https://github.com/Leaflet/Leaflet.markercluster
https://github.com/troutowicz/geoshare/blob/7f0c45d433a0d52d78e02da9a12b0d2156fcbedc/test/app/components/MarkerCluster.jsx
http://leaflet.github.io/Leaflet.markercluster/example/marker-clustering-realworld.388.html
https://github.com/Leaflet/Leaflet.markercluster#usage
*/

import React from "react";
import { Map, TileLayer, Marker, Popup, LayerGroup, ZoomControl } from 'react-leaflet';
import FontIcon from 'material-ui/FontIcon';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';
import SelectField from 'material-ui/SelectField';
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import DatePicker from 'material-ui/DatePicker';
import MarkerCluster from "./markercluster"
import Chart from "./chart";
import Heatmap from "./heatmap"
import Control from './react-leaflet-control';
import Checkbox from 'material-ui/Checkbox';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';

const defaultData = [{ lat: 52.008778, lon: -0.771088}];
const styles = {
  customWidth: {
    width: 150,
  },
}

class Livemap extends React.Component {
    constructor(props) {
        super(props);

        let date = new Date();
        
        this.markerID = null;

        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);

        this.state = {
            centerPosition: L.latLng(defaultData[0], defaultData[1]),
            filterDate: date,
        };
    }

    componentWillMount() {
        let bounds = L.latLngBounds(_.map(this.props.metaData, (val, key)=>{
            return L.latLng(val.Lat, val.Lon);
        }));

        this.setState({
            centerPosition: bounds.getCenter()
        });
    }

    handleDateChange(event, date) {
        this.setState({
            filterDate: date,
        });

        if (this.markerID!=null)
            this._onClickMarker(this.markerID);
    }

    _onClickMarker(id) {
        const gte = this.state.filterDate.getTime();
        const lte = gte + 24*60*60*1000;

        this.markerID = id;

        this.props.onUpdatePlot(id, [gte, lte]);
    }

    render() {
        let self = this;
        let markerComponent = null;
        let controlChart = null;
        let heatMapComponent = null;

        if (!_.isEmpty(self.props.metaData)) {
            markerComponent = (
                <MarkerCluster
                    metaData={self.props.metaData}
                    realTimeData={self.props.realTimeData}
                    onClickMarker={this._onClickMarker.bind(this)}
                />);
            controlChart = (
                <Control position="topright" >
                    <div className="chartinfo">
                        <div className="flex-container-column">
                            <div className="flex-chart-column">
                                <Chart
                                    data={this.props.data}
                                    type={"Line"}
                                    barcount={10}
                                />
                            </div>
                            <div className="flex-chart-column">
                                <MuiThemeProvider muiTheme={this.context.muiTheme}>
                                    <DatePicker
                                        floatingLabelText="Filter Date"
                                        hintText="Filter date"
                                        value={this.state.filterDate}
                                        onChange={this.handleDateChange.bind(this)}
                                    />
                                </MuiThemeProvider>
                            </div>
                        </div>
                    </div>
                </Control>);
        }

        return (
            <Map
                center={this.state.centerPosition}
                zoom={11}
                scrollWheelZoom={false}
                touchZoom={false}
                maxBounds={null}
                dragging={true}
                zoomControl={false}
            >
                <TileLayer
                    url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />
                <ZoomControl position='bottomright' />
                {markerComponent}
                {controlChart}
            </Map>);
    }
}

Livemap.propTypes = {
    metaData: React.PropTypes.object.isRequired,
    realTimeData: React.PropTypes.array.isRequired,
    onUpdatePlot: React.PropTypes.func.isRequired,
    data: React.PropTypes.array.isRequired
};

Livemap.contextTypes = {
  muiTheme: React.PropTypes.object
};

export default Livemap;
