import React, { useState, useEffect, Fragment } from "react";
import PropTypes from "prop-types";
//redux
import { connect } from "react-redux";

//carbon components
import { ContentSwitcher, Switch } from "carbon-components-react";
import { MultiSelect } from "carbon-components-react";

//custom components
import FLoading from "../../components/atoms/FLoading";
import FPageTitle from "../../components/organisms/FPageTitle";
// import FMonthPicker from '../../components/molecules/FMonthPicker';
import FMonthPicker from "../../components/molecules/FMonthPickerUpdated";

import FMap from "../../components/dataviz/FMap";
import FBarChart from "../../components/dataviz/FBarChart";
import FTimeSeries from "../../components/dataviz/FTimeSeries";
import FTable from "../../components/dataviz/FTable";

import FRadioGroup from "../../components/molecules/FRadioGroup";
import FLegendBar from "../../components/atoms/FLegendBar";
import FFilterColumn2 from "../../components/organisms/FFilterColumn2";

import FTooltipDistrictsAndSchemes from "../../components/atoms/FTooltipDistrictsAndSchemes";

import FPageMeta from "../../components/organisms/FPageMeta";
import FNoDataFound from "../../components/organisms/FNoDataFound";

// Custom Content Swticher
import FContentSwitcher from "../../components/molecules/FContentSwitcher";

//actions
import {
  getExpDistrictwiseData,
  setActiveVizIdx,
  resetActiveFiltersAndDateRange,
} from "../../actions/exp_districtwise";
import {
  getExpDistrictwiseFiltersData,
  updateExpDistrictwiseFilters,
  updateDistrictwiseOnDateRangeChange,
} from "../../actions/exp_districtwise_filters";

//data
import howToUseContent from "../../data/howToUseContent.json";
import Tooltips from "../../utils/tooltips";
var {
  exp_districtwise: filterOrderRef,
  districtwise_filter_comp,
} = require("../../data/filters_ref.json");

//Name of components to switch between
const vizTypes = ["FMap", "FBarChart", "FTimeSeries", "FTable"];

const tooltips = Tooltips.exp_districtwise;

const ExpDistrictwise = ({
  exp_districtwise: {
    initData,
    data: {
      mapData,
      barChrtData: { data: barChrtData },
      lineChrtData: { data: lineChrtData, xLabelVals, xLabelFormat },
      tableData: { headers, rows },
    },
    loading,
    error,
    activeVizIdx,
    activeFilters,
    dateRange,
  },
  exp_districtwise_filters: {
    allFiltersData,
    rawFilterDataAllHeads,
    loading: filtersLoading,
  },
  getExpDistrictwiseData,
  setActiveVizIdx,
  getExpDistrictwiseFiltersData,
  resetActiveFiltersAndDateRange,
  updateDistrictwiseOnDateRangeChange,
  updateExpDistrictwiseFilters,
}) => {
  //----------- initiatialization and handler pairs -----------//

  //#1 LEFT FILTER BAR
  const [filterBarVisibility, setFilterBarVisibility] = useState(false);
  const handleFilterBarVisibility = () =>
    setFilterBarVisibility(!filterBarVisibility);

  //#2 CONTENT SWITCHER TABS
  const activeViz = vizTypes[activeVizIdx];
  const switchActiveViz = (e) => setActiveVizIdx(e.index);

  //#3 SECONDARY CONTENT SWITCHER RADIO BUTTONS
  const [activeVizView, setActiveVizView] = useState({
    FTimeSeriesVizView: "gross",
    FMapVizView: "gross",
  });
  const onViewChange = (value, name) => {
    setActiveVizView({
      ...activeVizView,
      [name]: value,
    });
  };

  //#4 MAIN DATA & FILTER DATA HANDLERS.
  let expDistrictwiseActiveFilters = { ...activeFilters };

  const onFilterChange = (e, key) => {
    //#1 ADD OR REMOVE FILTER ID, depending on if its a selection or deselection
    if (e.selectedItems.length > 0) {
      //if at least 1 option is selected,
      expDistrictwiseActiveFilters[key] = e.selectedItems.map(
        (selectedItem) => {
          return selectedItem.id;
        }
      );
    } else {
      delete expDistrictwiseActiveFilters[key];
    }

    //#2 remove all child filters from activeFiltersArray : because thats the rule : PARENT FILTER RESETS CHILD FILTERS
    const currFilterOrderIndex = filterOrderRef.indexOf(key);
    filterOrderRef.map((filterName, i) => {
      if (
        i > currFilterOrderIndex &&
        expDistrictwiseActiveFilters[filterName]
      ) {
        delete expDistrictwiseActiveFilters[filterName];
        clearAllSelectedOptions(filterName);
      }
    });

    getExpDistrictwiseData(initData, expDistrictwiseActiveFilters, dateRange);
    updateExpDistrictwiseFilters(
      e,
      key,
      expDistrictwiseActiveFilters,
      allFiltersData,
      rawFilterDataAllHeads
    );
  };

  const onDateRangeSet = (newDateRange) => {
    updateDistrictwiseOnDateRangeChange(
      initData,
      newDateRange,
      expDistrictwiseActiveFilters
    );
  };

  //----------- END initiatialization and handler pairs -----------//

  //----------- probably redundant now, since multiselect comp has changed -------------//
  const clearAllSelectedOptions = (filterName) => {
    document
      .querySelectorAll(
        `.f-${filterName}-multiselect .bx--list-box__selection--multi`
      )
      .forEach((e) => e.click());
  };
  //----------- probably redundant now, since multiselect comp has changed -------------//

  const renderSwitch = () => {
    switch (activeViz) {
      case "FMap":
        return (
          <Fragment>
            <FLegendBar
              vizType="map"
              data={{
                key: ["Lowest", "Highest"],
                type: "gradient",
                color: ["hsl(177,100%,0%)", "hsl(177,100%,70%)"],
              }}
            />
            <FRadioGroup
              className="viz-view-toggle"
              name="FMapVizView"
              titleText="View:"
              onChange={(value, name) => onViewChange(value, name)}
              items={[
                { label: "Gross", id: "gross" },
                { label: "Net Payment", id: "netPayment" },
              ]}
              valueSelected={activeVizView.FMapVizView}
            />
            <div id="fmap">
              <FMap data={mapData} dataPointToMap={activeVizView.FMapVizView} />
            </div>
          </Fragment>
        );

      case "FBarChart":
        return (
          <Fragment>
            <FLegendBar
              vizType="bar"
              data={[
                { key: "Gross Amount", type: "bar", color: "darkGrey" },
                { key: "Net Amount", type: "bar", color: "black" },
              ]}
            />
            <FBarChart
              data={barChrtData}
              dataToX="districtName"
              dataPoints={["gross", "netPayment"]}
              barColors={["darkGrey", "black"]}
              xLabelVals={xLabelVals}
              yAxisLabel="Amount"
              xAxisLabel="districts"
              tooltip={
                <FTooltipDistrictsAndSchemes
                  activeDataPoint={["gross", "netPayment"]}
                  vizType={vizTypes[activeVizIdx]}
                />
              }
            />
          </Fragment>
        );

      case "FTimeSeries":
        return (
          <Fragment>
            <FTimeSeries
              dataToX="date"
              dataToY={activeVizView.FTimeSeriesVizView}
              data={lineChrtData}
              dataAryName="datewiseExp"
              xLabelVals={xLabelVals}
              xLabelFormat={xLabelFormat}
              dateRange={dateRange}
              yAxisLabel="amount"
              xAxisLabel="date"
              tooltip={
                <FTooltipDistrictsAndSchemes
                  vizType={vizTypes[activeVizIdx]}
                  activeDataPoint={[activeVizView]}
                  totalTicks={lineChrtData[0].datewiseExp.length}
                />
              }
              //  lineLabel="districtName"
            />
          </Fragment>
        );

      case "FTable":
        return (
          <FTable
            rows={rows}
            headers={headers}
            onClickDownloadBtn={(e) => {}}
            showTotal={true}
            showHeaderTooltip={true}
          />
        );

      default:
        return <div>nothing to display</div>;
    }
  };

  const createDataUIComponent = () => {
    switch (true) {
      case loading:
        return <FLoading />;
      case error.status === "emptyResponseError":
        return <FNoDataFound />;
      default:
        return (
          <Fragment>
            <div className="content-switcher-wrapper">
              {/* <ContentSwitcher onChange={switchActiveViz} selectedIndex={activeVizIdx} >
              <Switch  text="Map" />
              <Switch  text="Bar Chart" />
              <Switch  text="Time Series" />
              <Switch  text="Table" />
            </ContentSwitcher> */}
              <FContentSwitcher
                onChange={switchActiveViz}
                options={[
                  { label: "Map", infoText: tooltips.map_chart_tooltip },
                  { label: "Bar Chart", infoText: tooltips.bar_chart_tooltip },
                  {
                    label: "Time Series",
                    infoText: tooltips.time_series_chart_tooltip,
                  },
                  { label: "Table", infoText: tooltips.table_tooltip },
                ]}
                defaultValue="Map"
                activeVizIdx={activeVizIdx}
              />
            </div>
            {activeViz === "FTimeSeries" && (
              <FRadioGroup
                className="viz-view-toggle"
                name="FTimeSeriesVizView"
                titleText="View:"
                onChange={(value, name) => onViewChange(value, name)}
                items={[
                  { label: "Gross", id: "gross" },
                  { label: "Net Payment", id: "netPayment" },
                  { label: "Both", id: "gross,netPayment" },
                ]}
                valueSelected={activeVizView.FTimeSeriesVizView}
              />
            )}

            {renderSwitch()}
          </Fragment>
        );
    }
  };

  return (
    <div className="f-content">
      <FPageMeta pageId="expenditure_demandwise" />
      <FPageTitle
        pageTitle="Expenditure | Districtwise"
        pageDescription={howToUseContent[1].content.body}
        showLegend={false}
        monthPicker={
          <FMonthPicker
            // defaultSelect = {{
            //   years:[ parseInt(dateRange[0].split('-')[0]), parseInt(dateRange[1].split('-')[0]) ],
            //   months:[ parseInt(dateRange[0].split('-')[1]), parseInt(dateRange[1].split('-')[1]) ] }}
            // dateRange = {{years:[2018, 2019], months:[4, 3]}}
            // dateRange={["2015/04/01", "2020/03/31"]}
            availableFinancialYears={[
              { label: "2015-2016", value: "2015-2016" },
              { label: "2016-2017", value: "2016-2017" },
              { label: "2017-2018", value: "2017-2018" },
              { label: "2018-2019", value: "2018-2019" },
              { label: "2019-2020", value: "2019-2020" },
              { label: "2020-2021", value: "2020-2021" },
              { label: "2021-2022", value: "2021-2022" },
	      { label: "2022-2023", value: "2022-2023" },
            ]}
            onDateRangeSet={onDateRangeSet}
          />
        }
      />
      <div className="d-flex flex-row-reverse p-relative">
        <div className="data-viz-col exp-districtwise">
          {createDataUIComponent()}
        </div>
        <div
          className={`filter-col-wrapper ${
            filterBarVisibility === true ? "show" : "hide"
          }`}
        >
          <FFilterColumn2
            section="exp_districtwise"
            allFiltersData={allFiltersData && allFiltersData}
            filterCompData={districtwise_filter_comp}
            filtersLoading={filtersLoading}
            activeFilters={expDistrictwiseActiveFilters}
            onChange={(e, key) => onFilterChange(e, key)}
            onFilterIconClick={handleFilterBarVisibility}
          />
        </div>
      </div>
    </div>
  );
};

ExpDistrictwise.propTypes = {
  exp_districtwise: PropTypes.object.isRequired,
  exp_districtwise_filters: PropTypes.object.isRequired,
  getExpDistrictwiseData: PropTypes.func.isRequired,
  setActiveVizIdx: PropTypes.func.isRequired,
  getExpDistrictwiseFiltersData: PropTypes.func.isRequired,
  resetActiveFiltersAndDateRange: PropTypes.func.isRequired,
  updateExpDistrictwiseFilters: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  exp_districtwise: state.exp_districtwise,
  exp_districtwise_filters: state.exp_districtwise_filters,
});

export default connect(mapStateToProps, {
  getExpDistrictwiseData,
  setActiveVizIdx,
  getExpDistrictwiseFiltersData,
  resetActiveFiltersAndDateRange,
  updateDistrictwiseOnDateRangeChange,
  updateExpDistrictwiseFilters,
})(ExpDistrictwise);
