import React, {PropTypes, Component} from "react";
import ReactDOM from "react-dom";
import {
  VictoryLine,
  VictoryChart,
  VictoryAxis,
  VictoryTheme,
  VictoryStack,
  VictoryGroup,
  VictoryLabel,
  createContainer
} from "victory";

const tickLabelStyle = {
  fontFamily: "IBM Plex Sans",
  fontSize: "7px"
};

const slopeLabelStyle = {
  fontFamily: "IBM Plex Sans",
  fontSize: "5px"
};

// const VictoryZoomVoronoiContainer = createContainer("zoom", "voronoi");

class FSlope extends Component {
  static defaultProps = {
    //yLabelFormat mnust be an array of 3. each value representing  'prefix', 'suffix' and multiplier
    tickFormatY: ["", "", 1],
    height: 300,
    width: 300,
    padding: {top: 20, left: 75, right: 75, bottom: 50}
  };

  render() {
    const {height, width, padding, tickFormatY, data} = this.props;

    return (
      <VictoryChart
        animate={{duration: 1000, easing: "expOut"}}
        height={height}
        width={width}
        padding={padding}
      >
        <VictoryAxis
          tickLabelComponent={<VictoryLabel dy={-5} style={tickLabelStyle} />}
        />
        <VictoryAxis
          key={0}
          dependentAxis
          offsetX={padding.left}
          tickLabelComponent={<VictoryLabel dx={5} style={tickLabelStyle} />}
          tickFormat={x => tickFormatY[0] + x * tickFormatY[2] + tickFormatY[1]}
        />

        <VictoryGroup style={{data: {width: 5}}}>
          {data.map((dataArray, key) => {
            return (
              <VictoryLine
                colorScale={"blue"}
                data={dataArray}
                x="year"
                y="sanction"
                labels={d => d.label}
                labelComponent={
                  <VictoryLabel
                    dy={2.5}
                    dx={2}
                    textAnchor="start"
                    style={slopeLabelStyle}
                    renderInPortal
                  />
                }
              />
            );
          })}
        </VictoryGroup>
      </VictoryChart>
    );
  }
}

export default FSlope;
