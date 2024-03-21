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
import FContentSwitcher from "../../components/molecules/FContentSwitcher";

import FMap from '../../components/dataviz/FMap';
import FBarChart from '../../components/dataviz/FBarChart';
import FTimeSeries from '../../components/dataviz/FTimeSeriesReciepts';
import FTable from '../../components/dataviz/FTable';

import FRadioGroup from '../../components/molecules/FRadioGroup';

import FFilterColumn2 from '../../components/organisms/FFilterColumn2';

import FTooltipDistrictsAndSchemes from '../../components/atoms/FTooltipDistrictsAndSchemes';
import FTooltipReceipts from '../../components/atoms/FTooltipReceipts';
import FLegendBar from '../../components/atoms/FLegendBar';

import FPageMeta from '../../components/organisms/FPageMeta';
import FNoDataFound from '../../components/organisms/FNoDataFound';

//actions
import { getReceiptsDistrictwiseData, setActiveVizIdx, resetActiveFiltersAndDateRange }  from '../../actions/receipts_districtwise';
import { getReceiptsDistrictwiseFiltersData, updateReceiptsDistrictwiseFilters, updateReceiptsDistrictwiseOnDateRangeChange }  from '../../actions/receipts_districtwise_filters';

//data
import Tooltips from "../../utils/tooltips"
import howToUseContent from '../../data/howToUseContent.json';
var { receipts_districtwise : filterOrderRef, receipts_districtwise_filter_comp } = require("../../data/filters_ref.json");

//Name of components to switch between
const vizTypes = ["FMap", "FBarChart", "FTimeSeries", "FTable"];

const tooltips = Tooltips.receipts_districtwise

const ReceiptsDistrictwise = ({
  receipts_districtwise : {
    initData,
    data : {
      mapData,
      barChrtData : { data: barChrtData },
      lineChrtData : { data: lineChrtData, xLabelVals, xLabelFormat },
      tableData : { headers, rows }
    },
    loading,
    activeVizIdx,
    activeFilters,
    dateRange,
    error
  },
  receipts_districtwise_filters : { allFiltersData, rawFilterDataAllHeads, loading : filtersLoading },
  getReceiptsDistrictwiseData,
  setActiveVizIdx,
  getReceiptsDistrictwiseFiltersData,
  resetActiveFiltersAndDateRange,
  updateReceiptsDistrictwiseOnDateRangeChange,
  updateReceiptsDistrictwiseFilters }) => {

  let receiptsDistrictwiseActiveFilters = {...activeFilters};
  //handle filter bar responsiveness
  const [filterBarVisibility, setFilterBarVisibility] = useState(false);
	const handleFilterBarVisibility = () => {
		setFilterBarVisibility(!filterBarVisibility);
	}

  const activeViz = vizTypes[activeVizIdx];

  const switchActiveViz = (e) => {
    setActiveVizIdx(e.index)
  };




  useEffect(() => {
    // getReceiptsDistrictwiseData(initData, activeFilters, dateRange);
    // getReceiptsDistrictwiseFiltersData(allFiltersData, rawFilterDataAllHeads);

    return () => {
      // resetActiveFiltersAndDateRange();
    };

  }, []);

  const clearAllSelectedOptions = (filterName) => {
    document
      .querySelectorAll(`.f-${filterName}-multiselect .bx--list-box__selection--multi`)
      .forEach(e => e.click());
  }

  const onFilterChange = (e, key) => {
    //if at least 1 option is selected,
    if(e.selectedItems.length > 0){
      receiptsDistrictwiseActiveFilters[key] = e.selectedItems.map(selectedItem => {
        return selectedItem.id;
      })
    }else{ delete receiptsDistrictwiseActiveFilters[key]; }
    //remove all child filters from activeFiltersArray
    const currFilterOrderIndex = filterOrderRef.indexOf(key);
    filterOrderRef.map((filterName,i) => {
      if(i > currFilterOrderIndex && receiptsDistrictwiseActiveFilters[filterName] ){
        delete receiptsDistrictwiseActiveFilters[filterName];
        clearAllSelectedOptions(filterName);
      }
    })

    getReceiptsDistrictwiseData(initData, receiptsDistrictwiseActiveFilters, dateRange);
    updateReceiptsDistrictwiseFilters(e, key, receiptsDistrictwiseActiveFilters, allFiltersData, rawFilterDataAllHeads);
	}


  const onDateRangeSet = (newDateRange) => {
		updateReceiptsDistrictwiseOnDateRangeChange(initData, newDateRange, receiptsDistrictwiseActiveFilters);
	}



  const renderSwitch = () => {
    switch (activeViz) {
      case 'FMap':
      return (
        <Fragment>
          <FLegendBar
            vizType='map'
            data={
              {key: ['Lowest' ,'Highest'], type: 'gradient', color: ["hsl(177,100%,0%)", "hsl(177,100%,70%)"]}
            }
            />
          <div id="fmap">
            <FMap
              data={mapData}
              dataPointToMap={'receipt'}
              />
           </div>
         </Fragment>
      )

      case 'FBarChart':
      return (
        <Fragment>
        <FLegendBar
          vizType='bar'
          data={[
            {key: 'Receipt', type: 'bar', color: 'darkGrey'}
          ]}
          />
        <FBarChart
              data={barChrtData}
              dataToX="districtName"
              dataPoints={["receipt"]}
              barColors={["darkGrey", "black"]}
              xLabelVals={xLabelVals}
              yAxisLabel="total amount in crores"
              xAxisLabel="districts"
              tooltip={<FTooltipReceipts/>}
              />
        </Fragment>
      )

      case 'FTimeSeries':
      return  <Fragment>
                <FTimeSeries
                  dataToX="date"
                  dataToY={'receipt'}
                  data={lineChrtData}
                  dataAryName="datewiseRec"
                  xLabelVals={xLabelVals}
  								xLabelFormat={xLabelFormat}
                  dateRange={dateRange}
                  yAxisLabel="amount"
                  xAxisLabel="date"
                  tooltip={<FTooltipReceipts vizType="FTimeSeries"/>}
                //  lineLabel="districtName"
                />
              </Fragment>

      case 'FTable':
      return <FTable
              rows={rows}
              headers={headers}
              onClickDownloadBtn={(e) => {}}
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
              {/* <ContentSwitcher onChange={switchActiveViz} selectedIndex={activeVizIdx} >
                <Switch  text="Map" />
                <Switch  text="Bar Chart" />
                <Switch  text="Time Series" />
                <Switch  text="Table" />
              </ContentSwitcher> */}
              <FContentSwitcher 
                onChange={switchActiveViz}  
                options={[
                  {label: "Map", infoText: tooltips.map_chart_tooltip}, 
                  {label: "Bar Chart", infoText: tooltips.bar_chart_tooltip}, 
                  {label: "Time Series", infoText: tooltips.time_series_chart_tooltip}, 
                  {label: "Table", infoText: tooltips.table_tooltip}
                ]}
                defaultValue="Map"
                activeVizIdx={activeVizIdx}
              />
  					</div>
  					{ renderSwitch() }
  				</Fragment>
        )
    }
	}

  return (
    <div className="f-content">
      <FPageMeta pageId = 'receipts_districtwise' />
      <FPageTitle
        pageTitle="Receipts | Districtwise"
        pageDescription= {howToUseContent[3].content.body}
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
          <div className={`filter-col-wrapper ${filterBarVisibility === true ? "show" : "hide"}`}>
            <FFilterColumn2
              section = 'receipts_districtwise'
              allFiltersData = {allFiltersData && allFiltersData}
              filterCompData = {receipts_districtwise_filter_comp}
              filtersLoading = {filtersLoading}
              activeFilters = {receiptsDistrictwiseActiveFilters}
              onChange = {(e, key) => onFilterChange(e, key)}
              onFilterIconClick={handleFilterBarVisibility}
              />
          </div>
        </div>
    </div>
  )

}

ReceiptsDistrictwise.propTypes ={
  receipts_districtwise : PropTypes.object.isRequired,
  receipts_districtwise_filters : PropTypes.object.isRequired,
  getReceiptsDistrictwiseData : PropTypes.func.isRequired,
  setActiveVizIdx : PropTypes.func.isRequired,
  getReceiptsDistrictwiseFiltersData : PropTypes.func.isRequired,
  resetActiveFiltersAndDateRange : PropTypes.func.isRequired,
  updateReceiptsDistrictwiseOnDateRangeChange : PropTypes.func.isRequired,
  updateReceiptsDistrictwiseFilters : PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  receipts_districtwise : state.receipts_districtwise,
  receipts_districtwise_filters : state.receipts_districtwise_filters
})

export default connect(
  mapStateToProps,
  { getReceiptsDistrictwiseData,
    setActiveVizIdx,
    getReceiptsDistrictwiseFiltersData,
    resetActiveFiltersAndDateRange,
    updateReceiptsDistrictwiseOnDateRangeChange,
    updateReceiptsDistrictwiseFilters
  }
)(ReceiptsDistrictwise);
