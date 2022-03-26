import React, { PureComponent } from 'react';
import PolygonEditable from './PolygonEditable';
import LineStringEditable from './LineStringEditable';
import PointEditable from './PointEditable';

export const DRAW_TYPES = {
    POLYGON: 'Polygon',
    LINESTRING: 'LineString',
    POINT: 'Point'
};

const FEATURE_MAP = {
    'Polygon': PolygonEditable,
    'Polyline': LineStringEditable,
    'Point': PointEditable
}

export class Draw extends PureComponent {

    // props: mapRef, drawType, onDrawStart, onDrawEnd, active, keepFeatures
    constructor(props) {
        super(props);

        this.state = {
            coordinates: [],
            features: []
        }

        this.isDrawing = false;

        this.done = false;

        this.handleDrawState = this.handleDrawState.bind(this);
    }

    componentDidMount() {
        this.mounted = true;

        this.initListener();

        this.props.getOnPressCallback(this.handleDrawState);
        
        if(!Object.values(DRAW_TYPES).includes(this.props.drawType)) {
            throw new Error(`Invalid draw type: ${this.props.drawType}`);
        }
    }
    
    componentDidUpdate(prevProps) {
        if(this.props.drawType !== prevProps.drawType) {
            if(!Object.values(DRAW_TYPES).includes(this.props.drawType)) {
                throw new Error(`Invalid draw type: ${this.props.drawType}`);
            }
        }

        if(this.props.map !== prevProps.map) {
            this.initListener();
        }

        if(prevProps.keepFeatures && !this.props.keepFeatures) {
            this.setState({ features: [] });
        }

        if(prevProps.active && !this.props.active) {
            this.setState({ coordinates: [] });
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    initListener() {
        if(this.props.map) {
            const key = Object.keys(this.props.map);
        }
    }

    handleDrawState(event) {
        if(this.mounted && this.props.active) {
            if(!this.isDrawing) {
                this.props.onDrawStart();
                this.isDrawing = true;
            }

            this.handleDrawTypePress(event);
        }
    }

    onDrawEnd(coordinates) {
        this.props.onDrawEnd(coordinates);
        this.isDrawing = false;

        const feature = {
            type: this.props.drawType,
            coordinates
        }

        let features = [...this.state.features, feature];

        if(!this.props.keepFeatures) {
            features = [];
        }

        this.done = false;

        this.setState({ features, coordinates: [] });
    }

    handleDrawTypePress(event) {
        if(this.props.drawType === DRAW_TYPES.POINT) {
            const coordinates = event.nativeEvent.coordinate;
            this.onDrawEnd(coordinates);
            this.setState({ coordinates });
        } else if(this.props.drawType === DRAW_TYPES.LINESTRING || this.props.drawType === DRAW_TYPES.POLYGON) {
            if(this.done) {
                this.onDrawEnd(this.state.coordinates);
            } else {
                const coordinates = event.nativeEvent.coordinate;
                let allCoordinates = this.state.coordinates;
                if(coordinates) {
                    allCoordinates = [...this.state.coordinates, coordinates];
                }
                this.setState({ coordinates: allCoordinates });
            }
        }
    }

    render() {
        return (
            <React.Fragment>
                {this.state.features.map((feature, idx) => {
                    const Feature = FEATURE_MAP[feature.type];
                    return (
                        <React.Fragment key={idx}>
                        {feature.type === DRAW_TYPES.POINT ? (
                            <Feature
                                coordinate={feature.coordinates}
                                stopPropagation={true}
                                onCoordinateUpdate={(coordinates) => feature.coordinates = coordinates}
                            />
                        ) : (
                            <Feature
                                coordinates={feature.coordinates}
                                stopPropagation={true}
                                onCoordinateUpdate={(coordinates) => feature.coordinates = coordinates}
                            />
                        )}

                        </React.Fragment>
                    );
                })}

                {this.state.coordinates.length > 0 && this.props.drawType !== 'Point' && (
                    this.state.coordinates.length === 1 ? (
                        <PointEditable 
                            coordinate={this.state.coordinates[0]} 
                            onCoordinateUpdate={(coordinates) => this.setState({ coordinates })}
                        />
                    ) : (
                        <React.Fragment>
                            <LineStringEditable
                                coordinates={this.state.coordinates}
                                markerPress={(e) => {
                                    if(this.state.coordinates.length > 2) {
                                        this.done = true;
                                        this.handleDrawTypePress(e);
                                        e.stopPropagation();
                                    }
                                }}
                                onCoordinateUpdate={(coordinates) => this.setState({ coordinates })}
                            />
                        </React.Fragment>
                    )
                )}
            </React.Fragment>
        );
    }
}
