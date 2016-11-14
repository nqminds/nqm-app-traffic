import React from 'react';
import ChartistGraph from './react-chartist'
import Chartist from 'chartist';
import moment from 'moment'
import * as _ from 'lodash'

const _xAxisDivisors = 6;

class Chart extends React.Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
    }

    componentWillReceiveProps(nextProps) {}

    render() {
        let graphData, barData, data, options;
        let responsiveOptions = "";
        let ret;
        let className;
        let id;
        let undef = false;

        if (this.props.data.length) {
            if(this.props.data[0].Species[this.props.moleculeType]==undefined)
                 undef = true;
        }
        
        if (this.props.type=="Line") {
            
            className = "ct-line-chart"
            id="line-chart";

            if (!undef) {
                graphData = _.map(this.props.data, (val)=>{
                    return {x:val.timestamp, y:val.Species[this.props.moleculeType]};
                });
            } else graphData = [];

            data = {
                series: [{
                    name: 'Timeseries',
                    data: graphData
                }]
            };

            options = {
                onlyInteger: true,
                showPoint: false,
                showArea: true,
                lineSmooth: Chartist.Interpolation.step({
                    postpone: false,
                    fillHoles: false
                }),
                axisX: {
                    type: Chartist.FixedScaleAxis,
                    stretch: true,
                    divisor: _xAxisDivisors,
                    labelInterpolationFnc: function (value) {
                        return moment(value).format('HH:mm');
                    }
                }
            };
        } else if (this.props.type=="Bar"){
            let bounds = [];
            let labelData = [];

            className = "ct-bar-chart"
            id = "bar-chart";

            if (this.props.barcount<=3) {
                for (i=0;i<=this.props.barcount;i++) {
                    bounds.push([i,i,i]);
                    labelData.push(i.toString());
                }
            } else {
                bounds.push([0,this.props.barcount/4,0]);
                bounds.push([this.props.barcount/4,this.props.barcount/2,1]);
                bounds.push([this.props.barcount/2,3*this.props.barcount/4,2]);
                bounds.push([3*this.props.barcount/4,this.props.barcount,3]);
                labelData.push("[0,"+_.round(this.props.barcount/4)+")");
                labelData.push("["+_.round(this.props.barcount/4)+","+_.round(this.props.barcount/2)+")");
                labelData.push("["+_.round(this.props.barcount/2)+","+_.round(3*this.props.barcount/4)+")");
                labelData.push("["+_.round(3*this.props.barcount/4)+","+this.props.barcount+"]");
            }
            

            graphData = _.fill(Array(bounds.length), 0);

            if (!undef) {
                _.forEach(this.props.data, (val)=>{
                    if (this.props.barcount<=3) {
                        _.forEach(bounds, (elb)=>{
                            if (val.Species[this.props.moleculeType]==elb[0])
                                graphData[elb[2]]++;
                        });
                    } else {
                        _.forEach(bounds, (elb)=>{
                            if ((val.Species[this.props.moleculeType]>=elb[0] && val.Species[this.props.moleculeType]<elb[1] && elb[2]<3)
                                 || (val.Species[this.props.moleculeType]==elb[1] && elb[2]==3))
                                graphData[elb[2]]++;
                        });
                    }
                });
            }

            data = {
                labels: labelData,
                series: [ graphData ]
            };

            options = {
                seriesBarDistance: 10
            };

            responsiveOptions = [
                ['screen and (max-width: 640px)', {
                    seriesBarDistance: 5,
                    axisX: {
                        labelInterpolationFnc: function (value) {
                        return value[0];
                        }
                    }
                }]
            ];
        }
        
        return (<div>
                <ChartistGraph
                    id = {id}
                    className={className}
                    data = {data}
                    options = {options}
                    type = {this.props.type}
                    responsive-options={responsiveOptions}
                />
                </div>);
    }
}

Chart.propTypes = {
    moleculeType: React.PropTypes.string.isRequired,
    data: React.PropTypes.array.isRequired,
    type: React.PropTypes.string.isRequired,
    barcount: React.PropTypes.number.isRequired
};

export default Chart;