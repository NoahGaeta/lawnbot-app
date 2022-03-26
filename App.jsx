import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, DefaultTheme } from 'react-native-paper';
import RobotManager from './src/RobotManager';
import MapViewer from './src/MapViewer';
import { Provider as PaperProvider } from 'react-native-paper';


const MAX_TIME_BETWEEN_UPDATES = 10000; // 10 seconds
const POLL_INTERVAL = 4000; // 4 second

const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: '#324a5f',
    accent: '#f1c40f',
  },
};

export default class App extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      activeScreen: 'robot',
      robotCoordinates: null,
      robotRotation: 0,
      robotActive: false,
      generatedPath: [],
      activeBoundary: null,
      robotStatus: 'idle'
    }

    this.handleSwitchToMap = this.handleSwitchToMap.bind(this);
    this.handleSwitchToRobot = this.handleSwitchToRobot.bind(this);
    this.pollRobotData = this.pollRobotData.bind(this);
    this.postBoundary = this.postBoundary.bind(this);

    this.pollDataTimeoutId = null;
    this.robotActiveTimeoutId = null;
  }

  componentDidMount() {
    this.pollRobotData();
  }

  componentWillUnmount() {
    clearTimeout(this.pollDataTimeoutId);
  }

  handleSwitchToMap() {
    this.setState({ activeScreen: 'map' });
  }

  handleSwitchToRobot() {
    this.setState({ activeScreen: 'robot' });
  }

  postBoundary(boundary) {
    const coordinatesString = JSON.stringify({name: boundary.name, coordinates: boundary.coordinates.map((coord) => [coord.longitude, coord.latitude])});
    return new Promise((res, rej) => {
      const req = new XMLHttpRequest();
      req.open('POST', 'http://192.168.1.20:9090');
      req.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      req.send(coordinatesString);
    })
  }

  requestData() {
    return new Promise((res, rej) => {
      const req = new XMLHttpRequest();
      req.onreadystatechange = () => {
        if (req.readyState === 4 && req.status === 200) {
          const data = JSON.parse(req.responseText);
          const position = data.position;
          const heading = data.heading;
          const status = data.status;
          const activeBoundary = data.boundary;
          const generatedPath = JSON.parse(data.generated_path);
          if(data.generated_path !== JSON.stringify(this.state.generatedPath)) {
            this.setState({ generatedPath });
          }
          
          clearTimeout(this.robotActiveTimeoutId);
          this.robotActiveTimeoutId = setTimeout(() => {
            this.setState({ robotActive: false, robotCoordinates: null, robotRotation: 0, robotStatus: 'idle' });
          }, MAX_TIME_BETWEEN_UPDATES);
          this.setState({ robotCoordinates: position, robotRotation: heading, robotActive: true, robotStatus: status, activeBoundary });
        }

        if(req.readyState === 4) {
          res();
        }
      }
      req.open('GET', 'http://192.168.1.20:9090');
      req.send();
    })

  }

  async pollRobotData() {
    await this.requestData();
    this.pollDataTimeoutId = setTimeout(this.pollRobotData, POLL_INTERVAL);
  }

  render() {
    return (
      <PaperProvider theme={theme}>
        <View style={styles.container}>
          <Appbar.Header>
              <Appbar.Content title={'Mova Robotics'} />
              <Appbar.Action 
                icon={'robot-mower-outline'} 
                onPress={this.handleSwitchToRobot} 
                color={this.state.activeScreen === 'robot' ? 'orange': 'white'}
              />
              <Appbar.Action 
                icon={'map-outline'} 
                onPress={this.handleSwitchToMap} 
                color={this.state.activeScreen === 'map' ? 'orange': 'white'}
              />
          </Appbar.Header>

          {this.state.activeScreen === 'robot' ? (
            <RobotManager 
              robotActive={this.state.robotActive}
              robotCoordinates={this.state.robotCoordinates}
              robotRotation={this.state.robotRotation}
              robotStatus={this.state.robotStatus}
            />
          ) : (
            <MapViewer 
              robotActive={this.state.robotActive}
              robotCoordinates={this.state.robotCoordinates} 
              robotRotation={this.state.robotRotation}
              postBoundary={this.postBoundary}
              robotBoundary={this.state.activeBoundary}
              generatedPath={this.state.generatedPath}
            />
          )}
        </View>
      </PaperProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#48525C'
  },
});
