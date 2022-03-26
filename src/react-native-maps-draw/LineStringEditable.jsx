import React, { PureComponent } from 'react';
import { Polyline, Marker } from 'react-native-maps';

export default class LineStringEditable extends PureComponent {
    
    constructor(props) {
        super(props);

        this.state = {
            coordinates: this.props.coordinates
        }
    }

    componentDidUpdate(prevProps) {
        if(prevProps.coordinates !== this.props.coordinates) {
            this.setState({ coordinates: this.props.coordinates });
        }
    }

    render() {
        return (
            <React.Fragment>
                <Polyline
                    {...this.props}
                    coordinates={this.state.coordinates}
                />
                {this.state.coordinates.map((coord, idx) => 
                    <Marker 
                        coordinate={coord}
                        key={idx}
                        draggable
                        onDragEnd={(e) => {
                            const coordinates = this.state.coordinates.slice();
                            coordinates[idx] = e.nativeEvent.coordinate;
                            this.setState({ coordinates });
                            if(this.props.onCoordinateUpdate) {
                                this.props.onCoordinateUpdate(coordinates);
                            }
                        }}
                        image={require('../../static/circle.png')}
                        onPress={(e) => {
                            if(this.props.markerPress) {
                                this.props.markerPress(e);
                            }
                        }}
                    />
                )}
            </React.Fragment>
        )
    }
}