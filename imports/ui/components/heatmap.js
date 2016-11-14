import React from 'react';
import { MapLayer } from 'react-leaflet';
import * as _ from "lodash";

const maxIntensity = 11;
const defaultRadius = 125;

class Heatmap extends MapLayer {
    constructor(props) {
        super(props);

        this._updateLatLon = this._updateLatLon.bind(this);
    }

    _updateLatLon(props) {
        let latlngData = [];
        let lat, lon;

        if (props.realTimeData.length){
            _.forEach(props.realTimeData, (val)=>{
                if(val.Species[props.moleculeType]!=undefined) {
                    lat = props.metaData[val.SiteCode].Latitude;
                    lon = props.metaData[val.SiteCode].Longitude;

                    latlngData.push([lat, lon, val.Species[props.moleculeType]+1])
                }
            });
        }

        if (!latlngData.length) {
            _.forEach(props.metaData,(val,key)=>{
                if (val.Latitude!=null && val.Longitude!=null)
                    latlngData.push([val.Latitude, val.Longitude, maxIntensity]);
            });
        }

        return latlngData;
    }

    componentWillMount() {
        this.leafletElement = L.heatLayer(this._updateLatLon(this.props), {radius: defaultRadius, max: maxIntensity}).addTo(this.context.map);
    }

    componentWillReceiveProps(nextProps) {
        this.leafletElement.setLatLngs(this._updateLatLon(nextProps));
    }

    shouldComponentUpdate() {
        return false;
    }

    componentWillUnmount() {
        this.context.map.removeLayer(this.leafletElement);
    }

    render() {
        return null;
    }
}

Heatmap.propTypes = {
    moleculeType: React.PropTypes.string.isRequired,
    metaData: React.PropTypes.object.isRequired,
    realTimeData: React.PropTypes.array.isRequired,
};

export default Heatmap;