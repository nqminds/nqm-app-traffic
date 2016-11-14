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

                this._markers[val.SiteCode] = L.marker(new L.LatLng(val.Latitude, val.Longitude), {
                    title: val.LocalAuthorityName,
                    icon: new L.TextIcon({
                        icontype: icontype,
                        text: mtext,
                        color: color,
                        id: val.SiteCode
                    })
                });

                this._markers[val.SiteCode].bindPopup(
                    "<b>Local authority name: </b>"+val.LocalAuthorityName+"<br>"+
                    "<b>Site code: </b>"+val.SiteCode+"<br>"+
                    "<b>Local authority code: </b>"+val.LocalAuthorityCode+"<br>"+
                    "<b>Site type:</b>"+val.SiteType).on('click', (e) => {self.props.onClickMarker(e.target.options.icon.options.id)});
                return this._markers[val.SiteCode];
            });

            this.leafletElement.addLayers(markers);
        }
    }

    componentWillReceiveProps(nextProps) {
        _.forEach(nextProps.realTimeData, (val)=>{
            let color = 'blue';
            let mtext;
            let icontype = "plain";

            if (val.Species[nextProps.moleculeType]!=undefined) {
                icontype = 'number';
                mtext = val.Species[nextProps.moleculeType].toString();
                if (val.Species[nextProps.moleculeType]>5)
                    color = 'red';
            }
            
            this._markers[val.SiteCode].options.icon.setType(icontype, color, mtext);
             
        });
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
    moleculeType: React.PropTypes.string.isRequired, 
    metaData: React.PropTypes.object.isRequired,
    realTimeData: React.PropTypes.array.isRequired,
    onClickMarker: React.PropTypes.func.isRequired
};

export default MarkerCluster;