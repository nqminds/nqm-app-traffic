import React from 'react';
import { MapLayer } from 'react-leaflet';
import './leaflet-text-icon.js';

class MarkerCluster extends MapLayer {
    constructor(props) {
        super(props);

        this._markers = {};
    }

    componentWillMount() {
        let markers = [];
        let self = this;
        let color = 'blue';
        let mtext='';
        let icontype = "plain";

        this.leafletElement = L.markerClusterGroup();
        
        if (!_.isEmpty(this.props.metaData)) {
            markers = _.map(this.props.metaData, (val,key)=>{

                this._markers[val.ID] = L.marker(new L.LatLng(val.Lat, val.Lon), {
                    title: val.Title,
                    icon: new L.TextIcon({
                        icontype: icontype,
                        text: mtext,
                        color: color,
                        id: val.ID
                    })
                });

                this._markers[val.ID].bindPopup(
                    val.Title).on('click', (e) => {self.props.onClickMarker(e.target.options.icon.options.id)});
                return this._markers[val.ID];
            });

            this.leafletElement.addLayers(markers);
        }
    }

    componentWillReceiveProps(nextProps) {
    }

    shouldComponentUpdate() {
        return false;
    }

    componentWillUnmount() {
        this.leafletElement.clearLayers();
    }

    render() {
        return null;
    }
}

MarkerCluster.propTypes = {
    metaData: React.PropTypes.object.isRequired,
    realTimeData: React.PropTypes.array.isRequired,
    onClickMarker: React.PropTypes.func.isRequired
};

export default MarkerCluster;