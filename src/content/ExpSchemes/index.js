import React, { useState, useEffect, Fragment } from "react";
import PropTypes from "prop-types";
//redux
import { connect } from 'react-redux';

//carbon components
import { ContentSwitcher, Switch } from 'carbon-components-react';
import { MultiSelect } from 'carbon-components-react';

//custom components
import FLoading from '../../components/atoms/FLoading';
import FPageTitle from '../../components/organisms/FPageTitle';
// import FMonthPicker from '../../components/molecules/FMonthPicker';
import FMonthPicker from '../../components/molecules/FMonthPickerUpdated'

// Custom Content Swticher
import FContentSwitcher from "../../components/molecules/FContentSwitcher"

import FMap from '../../components/dataviz/FMap';
import FBarChart from '../../components/dataviz/FBarChart';
import FTimeSeries from '../../components/dataviz/FTimeSeriesSchemes';
import FTable from '../../components/dataviz/FTable';
import FRadioGroup from '../../components/molecules/FRadioGroup';
import FFilterColumn2 from '../../components/organisms/FFilterColumn2';
import FTooltipDistrictsAndSchemes from '../../components/atoms/FTooltipDistrictsAndSchemes';
import FLegendBar from '../../components/atoms/FLegendBar';

//actions
import { getExpSchemesData, resetActiveFiltersAndDateRange }  from '../../actions/exp_schemes';
import { getExpSchemesFiltersData, updateExpSchemesFilters, updateSchemesOnDateRangeChange }  from '../../actions/exp_schemes_filters';

import FPageMeta from '../../components/organisms/FPageMeta';
import FNoDataFound from '../../components/organisms/FNoDataFound';

//data
import Tooltips from  "../../utils/tooltips"
import howToUseContent from '../../data/howToUseContent.json';
var { exp_schemes : filterOrderRef, schemes_filter_comp } = require("../../data/filters_ref.json");



//Name of components to switch between
const vizTypes = ["FMap", "FBarChart", "FTimeSeries", "FTable"];

const tooltips = Tooltips.schemes

const ExpSchemes = ({
  exp_schemes : {
    initData,
    data : {
      mapData,
      barChrtData : { data : barChrtData },
      lineChrtData : { data : lineChrtData, xLabelVals, xLabelFormat },
      tableData : { headers, rows }
    },
    loading,
    activeFilters,
    dateRange,
    error
  },
  exp_schemes_filters : { allFiltersData, rawFilterDataAllHeads, loading : filtersLoading },
  getExpSchemesData,
  getExpSchemesFiltersData,
  resetActiveFiltersAndDateRange,
  updateSchemesOnDateRangeChange,
  updateExpSchemesFilters }) => {

  let schemesActiveFilters = {...activeFilters};

  //handle filter bar responsiveness
  const [filterBarVisibility, setFilterBarVisibility] = useState(false);
	const handleFilterBarVisibility = () => {
		setFilterBarVisibility(!filterBarVisibility);
	}

  const [currentVizType, setCurrentVizType] = useState(vizTypes[0]);
	const switchVizType = (e) => {
    setCurrentVizType(vizTypes[e.index]);
  }

  const [activeVizView, setActiveVizView] = useState({
    FTimeSeriesVizView : "gross",
    FMapVizView : "gross"
  });


  const clearAllSelectedOptions = (filterName) => {
    document
      .querySelectorAll(`.f-${filterName}-multiselect .bx--list-box__selection--multi`)
      .forEach(e => e.click());
  }

  const onViewChange = (value, name) => {
    setActiveVizView({
      ...activeVizView,
      [name] : value
    });
  }

  const onFilterChange = (e, key) => {
    //if at least 1 option is selected,
    if(e.selectedItems.length > 0){
      schemesActiveFilters[key] = e.selectedItems.map(selectedItem => {
        return selectedItem.id;
      })
    }else{ delete schemesActiveFilters[key]; }
    //remove all child filters from activeFiltersArray
    const currFilterOrderIndex = filterOrderRef.indexOf(key);
    filterOrderRef.map((filterName,i) => {
      if(i > currFilterOrderIndex && schemesActiveFilters[filterName] ){
        delete schemesActiveFilters[filterName];
        clearAllSelectedOptions(filterName);
      }
    })

    getExpSchemesData(initData, schemesActiveFilters, dateRange);
    updateExpSchemesFilters(e, key, schemesActiveFilters, allFiltersData, rawFilterDataAllHeads);
	}


  const onDateRangeSet = (newDateRange) => {
		updateSchemesOnDateRangeChange(initData, newDateRange, schemesActiveFilters);
	}


  const renderSwitch = () => {
    switch (currentVizType) {
      case 'FMap':
      return (
        <Fragment>
          <FLegendBar
            vizType='map'
            data={
              {key: ['Lowest' ,'Highest'], type: 'gradient', color: ["hsl(177,100%,0%)", "hsl(177,100%,70%)"]}
            }
            />
          <FRadioGroup
            className = "viz-view-toggle"
            name = "FMapVizView"
            titleText = "View:"
            onChange = {(value, name) => onViewChange(value, name)}
            items = {[
              { label : "Gross", id : "gross" },
              { label : "Net Payment", id : "netPayment" },
            ]}
            valueSelected = {activeVizView.FMapVizView}
          />
          <div id="fmap">
            <FMap
              data={mapData}
              dataPointToMap={activeVizView.FMapVizView}
              />
           </div>
        </Fragment>
      );
      case 'FBarChart':
      return (
        <Fragment>
          <FLegendBar
            vizType='bar'
            data={[
              {key: 'Gross Amount', type: 'bar', color: 'darkGrey'},
              {key: 'Net Amount', type: 'bar', color: 'black'}
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
            tooltip={<FTooltipDistrictsAndSchemes activeDataPoint={["gross", "netPayment"]}/>}
            />
        </Fragment>
      );
      case 'FTimeSeries':
      return  <Fragment>
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
                  tooltip={<FTooltipDistrictsAndSchemes vizType={vizTypes[vizTypes.indexOf(currentVizType)]} activeDataPoint={[activeVizView]} totalTicks={lineChrtData[0].datewiseExp.length}/>}
                  //lineLabel="districtName"
                />
              </Fragment>

      case 'FTable':
      return <FTable
              rows={rows}
              headers={headers}
              onClickDownloadBtn={(e) => { }}
              showTotal={true}
              showHeaderTooltip={true}
              />
      default:
      return <div>nothing to display</div>;
    }
  }

  const createDataUIComponent = () => {
    switch(true){
      case loading === true :
      return <FLoading />;
      case error.status === 'emptyResponseError' :
      return <FNoDataFound />;
      default :
      return (
        <Fragment>
					<div className="content-switcher-wrapper">
            {/* <ContentSwitcher onChange={switchVizType} selectedIndex={vizTypes.indexOf(currentVizType)} >
              <Switch  text="Map" />
              <Switch  text="Bar Chart" />
              <Switch  text="Time Series" />
              <Switch  text="Table" />
            </ContentSwitcher> */}
            <FContentSwitcher 
            onChange={switchVizType}  
            options={[
              {label: "Map", infoText: tooltips.map_chart_tooltip}, 
              {label: "Bar Chart", infoText: tooltips.bar_chart_tooltip}, 
              {label: "Time Series", infoText: tooltips.time_series_chart_tooltip}, 
              {label: "Table", infoText: tooltips.table_tooltip}
            ]}
            defaultValue="Map"
            activeVizIdx={vizTypes.indexOf(currentVizType)}
            />
					</div>
          { currentVizType === 'FTimeSeries' &&
            <FRadioGroup
              className = "viz-view-toggle"
              name = "FTimeSeriesVizView"
              titleText = "View:"
              onChange = {(value, name) => onViewChange(value, name)}
              items = {[
                { label : "Gross", id : "gross" },
                { label : "Net Payment", id : "netPayment" },
                { label : "Both", id : "gross,netPayment" }

              ]}
              valueSelected = {activeVizView.FTimeSeriesVizView}

            />
          }
					{ renderSwitch() }
				</Fragment>
      )
    }
	}

  return (
    <div className="f-content">
      <FPageMeta pageId = 'schemes' />
      <FPageTitle
        pageTitle="Schemes"
        pageDescription= {howToUseContent[4].content.body}
        showLegend={false}
        monthPicker={
          <FMonthPicker
            // defaultSelect = {{
            //   years:[ parseInt(dateRange[0].split('-')[0]), parseInt(dateRange[1].split('-')[0]) ],
            //   months:[ parseInt(dateRange[0].split('-')[1]), parseInt(dateRange[1].split('-')[1]) ] }}
            // dateRange = {{years:[2018, 2019], months:[4, 3]}}
            // dateRange={["2015/04/01", "2020/03/31"]}
            availableFinancialYears={[
		    {label: "2015-2016", value: "2015-2016"},
		    {label: "2016-2017", value: "2016-2017"},
		    {label: "2017-2018", value: "2017-2018"}, 
		    {label: "2018-2019", value: "2018-2019"}, 
		    {label: "2019-2020", value: "2019-2020"}, 
		    {label: "2020-2021", value: "2020-2021"},
		    {label: "2021-2022", value: "2021-2022"},
		    {label: "2022-2023", value: "2022-2023"},
	    ]}
            onDateRangeSet={onDateRangeSet}
          />
        }
        />
        <div className="d-flex flex-row-reverse p-relative">
          <div className="data-viz-col exp-schemes">
            {createDataUIComponent()}
          </div>
          <div className={`filter-col-wrapper ${filterBarVisibility === true ? "show" : "hide"}`}>
            <FFilterColumn2
              section = 'schemes'
              allFiltersData = {allFiltersData && allFiltersData}
              filterCompData = {schemes_filter_comp}
              filtersLoading = {filtersLoading}
              activeFilters = {schemesActiveFilters}
              onChange = {(e, key) => onFilterChange(e, key)}
              onFilterIconClick={handleFilterBarVisibility}
              />
          </div>
        </div>
    </div>
  )

}

ExpSchemes.propTypes ={
  exp_schemes : PropTypes.object.isRequired,
  exp_schemes_filters : PropTypes.object.isRequired,
  getExpSchemesData : PropTypes.func.isRequired,
  getExpSchemesFiltersData : PropTypes.func.isRequired,
  resetActiveFiltersAndDateRange : PropTypes.func.isRequired,
  updateExpSchemesFilters : PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  exp_schemes : state.exp_schemes,
  exp_schemes_filters : state.exp_schemes_filters
})

export default connect(
  mapStateToProps,
  { getExpSchemesData,
    getExpSchemesFiltersData,
    resetActiveFiltersAndDateRange,
    updateSchemesOnDateRangeChange,
    updateExpSchemesFilters
  }
)(ExpSchemes);
