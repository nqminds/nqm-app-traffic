/*
https://github.com/Leaflet/Leaflet.markercluster
https://github.com/troutowicz/geoshare/blob/7f0c45d433a0d52d78e02da9a12b0d2156fcbedc/test/app/components/MarkerCluster.jsx
http://leaflet.github.io/Leaflet.markercluster/example/marker-clustering-realworld.388.html
https://github.com/Leaflet/Leaflet.markercluster#usage
*/

import React from "react";
import { Map, TileLayer, Marker, Popup, LayerGroup, ZoomControl } from 'react-leaflet';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';
import SelectField from 'material-ui/SelectField';
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import DatePicker from 'material-ui/DatePicker';
import MarkerCluster from "./markercluster"
import Chart from "./chart";
import Heatmap from "./heatmap"
import Control from './react-leaflet-control';

const defaultData = [{ lat: 52.008778, lon: -0.771088}];
const molecules = {1:'All', 2:'NO2', 3:'SO2', 4:'PM10', 5:'PM25', 6:'O3'};
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
            moleculeIndex: 1,
            mapType: 1,
            filterDate: date,
        };
    }

    componentWillMount() {
        let bounds = L.latLngBounds(_.map(this.props.metaData, (val, key)=>{
            return L.latLng(val.Latitude, val.Longitude);
        }));

        this.setState({
            centerPosition: bounds.getCenter()
        });
    }

    handleMoleculeChange(event, index, value){
        this.setState({
            moleculeIndex: value
        })
    }

    handleMapType(event, index, value){
        let moleculeIndex = this.state.moleculeIndex;

        if (this.state.mapType==2)
            moleculeIndex = 1;

        this.setState({
            moleculeIndex: moleculeIndex,
            mapType: value
        })
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

        if (this.state.moleculeIndex!=1)
            this.props.onUpdatePlot(id, [gte, lte]);
    }

    render() {
        let self = this;
        let markerComponent = null;
        let controlChart = null;
        let heatMapComponent = null;

        if (!_.isEmpty(self.props.metaData) && this.state.mapType==1) {
            markerComponent = (
                <MarkerCluster
                    moleculeType={molecules[this.state.moleculeIndex]}
                    metaData={self.props.metaData}
                    realTimeData={self.props.realTimeData}
                    onClickMarker={this._onClickMarker.bind(this)}
                />);
            controlChart = (
                <Control position="topright" >
                    <div className="chartinfo">
                        <div className="flex-container-column">
                            <div className="lex-items-column">
                                <Chart
                                    moleculeType={molecules[this.state.moleculeIndex]}
                                    data={this.props.data}
                                    type={"Line"}
                                    barcount={10}
                                />
                            </div>
                            <div className="lex-items-column">
                                <Chart
                                    moleculeType={molecules[this.state.moleculeIndex]}
                                    data={this.props.data}
                                    type={"Bar"}
                                    barcount={10}
                                />
                            </div>
                            <div className="lex-items-column">
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
        } else if (!_.isEmpty(self.props.metaData) && this.state.mapType==2) {
            heatMapComponent = (
                <Heatmap
                    moleculeType={molecules[this.state.moleculeIndex]}
                    metaData={self.props.metaData}
                    realTimeData={self.props.realTimeData}
                />);
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
                {heatMapComponent}
                {markerComponent}
                {controlChart}
                <Control position="topleft" >
                    <MuiThemeProvider muiTheme={this.context.muiTheme}>
                        <div className="toolbarinfo">
                            <DropDownMenu value={this.state.moleculeIndex} onChange={this.handleMoleculeChange.bind(this)}>
                                <MenuItem value={1} primaryText={molecules[1]} />
                                <MenuItem value={2} primaryText={molecules[2]} />
                                <MenuItem value={3} primaryText={molecules[3]} />
                                <MenuItem value={4} primaryText={molecules[4]} />
                                <MenuItem value={5} primaryText={molecules[5]} />
                                <MenuItem value={6} primaryText={molecules[6]} />
                            </DropDownMenu>
                            <DropDownMenu value={this.state.mapType} onChange={this.handleMapType.bind(this)}>
                                <MenuItem value={1} primaryText="Sensor Map" />
                                <MenuItem value={2} primaryText="Heat Map" />
                            </DropDownMenu>
                        </div>
                    </MuiThemeProvider>
                </Control>
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
