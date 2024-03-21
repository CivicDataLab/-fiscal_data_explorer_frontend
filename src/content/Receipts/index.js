import React, { Fragment, useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import axios from 'axios';
import FPageMeta from '../../components/organisms/FPageMeta';
//redux
import { connect } from 'react-redux';

//actions
import { getReceiptsData } from '../../actions/receipts';
import {
	getReceiptsFiltersData,
	updateReceiptsOnFilterChange,
	updateReceiptsOnDateRangeChange } from '../../actions/receipts_filters';

//carbon components
import { ContentSwitcher, Switch } from 'carbon-components-react';

//custom components
import FLoading from '../../components/atoms/FLoading';
import FBarChart from '../../components/dataviz/FBarChart';
import FTable from '../../components/dataviz/FTable';

// Custom Content Swticher
import FContentSwitcher from "../../components/molecules/FContentSwitcher"

// import FMonthPicker from '../../components/molecules/FMonthPicker';
import FMonthPicker from '../../components/molecules/FMonthPickerUpdated'
import FPageTitle from '../../components/organisms/FPageTitle';
import FFilterColumn2 from '../../components/organisms/FFilterColumn2';
import FTooltipReceipts from '../../components/atoms/FTooltipReceipts';
import FLegendBar from '../../components/atoms/FLegendBar';

import FNoDataFound from '../../components/organisms/FNoDataFound';

//import helpers
import { convertDataToJson, clearAllSelectedOptions } from '../../utils/functions';

// data_ref
import Tooltips from "../../utils/tooltips"
import howToUseContent from '../../data/howToUseContent.json';
const { receipts: filterOrderRef, receipts_filter_comp } = require('../../data/filters_ref.json');




//Name of components to switch between
const vizTypes = ["FSASR", "FTable"];

const tooltips = Tooltips.receipts_details

const Receipts = ( { receipts : {
											 data : {
												 vizData,
												 vizData : { data, xLabelVals, xLabelFormat } ,
												 tableData : { headers, rows }
											 },
											 loading,
											 fetching,
											 activeFilters,
											 dateRange,
											 error
									 },
									 receipts_filters : { allFiltersData, rawFilterData, loading : filtersLoading },
									 getReceiptsData,
									 updateReceiptsOnFilterChange,
									 updateReceiptsOnDateRangeChange,
									 getReceiptsFiltersData,
									 location
								   } ) => {

	let receiptsDetailsActiveFilters = {...activeFilters};

	const [filterBarVisibility, setFilterBarVisibility] = useState(false);
  //handle filter bar responsiveness
	const handleFilterBarVisibility = () => {
		setFilterBarVisibility(!filterBarVisibility);
	}

	//initialize useState hook
	const [currentVizType, setCurrentVizType] = useState(vizTypes[0]);
	const switchVizType = (e) => {
		setCurrentVizType(vizTypes[e.index]);

	}

	useEffect(() => {
			// getReceiptsData(activeFilters, dateRange);
			// getReceiptsFiltersData();
  }, []);

	const onFilterChange = (e, key) => {
		//if at least 1 option is selected,
    if(e.selectedItems.length > 0){
      receiptsDetailsActiveFilters[key] = e.selectedItems.map(selectedItem => {
        return selectedItem.id;
      })
    }else{ delete receiptsDetailsActiveFilters[key]; }
    //remove all child filters from activeFiltersArray
    const currFilterOrderIndex = filterOrderRef.indexOf(key);
    filterOrderRef.map((filterName,i) => {
      if(i > currFilterOrderIndex && receiptsDetailsActiveFilters[filterName] ){
        delete receiptsDetailsActiveFilters[filterName];
        clearAllSelectedOptions(filterName);
      }
    })
		updateReceiptsOnFilterChange(e, key, receiptsDetailsActiveFilters, allFiltersData, rawFilterData, dateRange);
	}

	const onDateRangeSet = (newDateRange) => {
		updateReceiptsOnDateRangeChange(newDateRange, receiptsDetailsActiveFilters);
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
							<Switch  text="Bar Chart" />
							<Switch  text="Table" />
						</ContentSwitcher> */}
						<FContentSwitcher 
							onChange={switchVizType}  
							options={[
							{label: "Bar Chart", infoText: tooltips.bar_chart_tooltip}, 
							{label: "Table", infoText: tooltips.table_tooltip}]}
							defaultValue="Bar Chart"
							activeVizIdx={vizTypes.indexOf(currentVizType)}
						/>
					</div>
					{ currentVizType === vizTypes[0] ?
							<Fragment>
								<FLegendBar
									vizType='bar'
									data={[
										{key: 'Receipt', type: 'bar', color: 'black'}
									]}
									/>
								<FBarChart
									data={data}
									dataToX="date"
									dataPoints={["receipt"]}
									barColors={["black"]}
									xLabelVals={xLabelVals}
									xLabelFormat={xLabelFormat}
									xAxisLabel={xLabelFormat === null ? "Months" : "date"}
									yAxisLabel="Amount"
									tooltip={<FTooltipReceipts/>}
									events={[{
										// childName: "all",
										target: "data",
										eventHandlers: {
											onMouseOver: () => {
												return [
													{
														// childName: "bar",
														target: "data",
														mutation: (props) => ({ style: Object.assign({}, props.style, { strokeWidth: 4 }) })
													},
													{
														// childName: "bar",
														target: "labels",
														mutation: () => ({ active: true })
													}
												];
											},
											onMouseOut: () => {
												return [
													{
														// childName: "bar",
														target: "data",
														mutation: (props) => ({ style: Object.assign({}, props.style, { strokeWidth: 0 }) })
													},
													{
														// childName: "bar",
														target: "labels",
														mutation: () => ({ active: false })
													}
												];
											}
										}
									}]}

									/>
							</Fragment> :
						 <Fragment>
							 <FTable
								 rows={rows}
								 headers={headers}
								 onClickDownloadBtn={(e) => { }}
								 showTotal={true}
								 />
						 </Fragment>
				 	 }
				</Fragment>
			)
		}
	}

	return (
		<div className="f-content">
			<FPageMeta pageId = 'receipts' />
			<FPageTitle
				pageTitle="Receipts | Details"
				pageDescription= {howToUseContent[2].content.body}
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
					<div className="data-viz-col receipts">
						{createDataUIComponent()}
					</div>
					<div className={`filter-col-wrapper ${filterBarVisibility === true ? "show" : "hide"}`}>
						<FFilterColumn2
							section = 'receipts'
							filterCompData ={receipts_filter_comp}
							allFiltersData={allFiltersData && allFiltersData}
							activeFilters={receiptsDetailsActiveFilters}
							filtersLoading={filtersLoading}
							onChange = {(e, key) => onFilterChange(e, key)}
							onFilterIconClick={handleFilterBarVisibility}
							/>
					</div>
				</div>
    </div>
	)
}

Receipts.propTypes = {
	receipts : PropTypes.object.isRequired,
	receipts_filters : PropTypes.object.isRequired,
	getReceiptsData : PropTypes.func.isRequired,
	updateReceiptsOnFilterChange : PropTypes.func.isRequired,
	updateReceiptsOnDateRangeChange : PropTypes.func.isRequired,
	getReceiptsFiltersData : PropTypes.func.isRequired
}

const mapStateToProps = state => ({
	receipts : state.receipts,
	receipts_filters : state.receipts_filters
})

export default withRouter(connect(
	mapStateToProps,
	{ getReceiptsData,
		getReceiptsFiltersData,
		updateReceiptsOnFilterChange,
		updateReceiptsOnDateRangeChange
	}
)(Receipts));
