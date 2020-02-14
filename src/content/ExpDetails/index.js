import React, { Fragment, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link } from 'react-router-dom';
import axios from 'axios';

//redux
import { connect } from 'react-redux';

//actions
import { getExpDemandwiseData } from '../../actions/exp_demandwise';
import {
	updateExpDemandwiseOnFilterChange,
	updateExpDemandwiseOnDateRangeChange
} from '../../actions/exp_demandwise_filters';

//carbon components
import { ContentSwitcher, Switch } from 'carbon-components-react';

//custom components
import FButton from '../../components/atoms/FButton';
import FLoading from '../../components/atoms/FLoading';
import FSASRChart from '../../components/dataviz/FSASRChart';
import FTimeSeries from '../../components/dataviz/FTimeSeries';
import FTable from '../../components/dataviz/FTable';
import FDropdown from '../../components/molecules/FDropdown';
import FMonthPicker from '../../components/molecules/FMonthPicker';
import FRadioGroup from '../../components/molecules/FRadioGroup';
import FPageTitle from '../../components/organisms/FPageTitle';
import FFilterColumn2 from '../../components/organisms/FFilterColumn2';

//import helpers
import { convertDataToJson, clearAllSelectedOptions } from '../../utils/functions';

// data_ref
const { exp_demandwise: filterOrderRef, demandwise_filter_comp } = require('../../data/filters_ref.json');

//Name of components to switch between
const vizTypes = ["FSASR", "FTable"];

const ExpDetails = ( { exp_demandwise : {
													data : {
														vizData : { data, xLabelVals, xLabelFormat, scsrOffset } ,
												    tableData : { headers, rows }
													},
												  loading,
												  activeFilters,
												  dateRange
											 },
											 exp_demandwise_filters : { allFiltersData, rawFilterData, loading : filtersLoading },
											 getExpDemandwiseData,
											 updateExpDemandwiseOnFilterChange,
											 updateExpDemandwiseOnDateRangeChange
										  	} ) => {

	//initialize useState hook
	const [currentVizType, setCurrentVizType] = useState(vizTypes[0]);
	const switchVizType = (e) => { setCurrentVizType(vizTypes[e]); }

	const onFilterChange = (e, key) => {
		//if at least 1 option is selected,
		console.log(e.selectedItems[0]);
		console.log(key);
    if(e.selectedItems.length > 0){
      activeFilters[key] = e.selectedItems.map(selectedItem => {
        return selectedItem.id;
      })
    }else{ delete activeFilters[key]; }
    //remove all child filters from activeFiltersArray
    const currFilterOrderIndex = filterOrderRef.indexOf(key);
    filterOrderRef.map((filterName,i) => {
      if(i > currFilterOrderIndex && activeFilters[filterName] ){
        delete activeFilters[filterName];
        clearAllSelectedOptions(filterName);
      }
    })

		updateExpDemandwiseOnFilterChange(e, key, activeFilters, allFiltersData, rawFilterData, dateRange);
	}

	const onDateRangeSet = (newDateRange) => {
		updateExpDemandwiseOnDateRangeChange(newDateRange, activeFilters);
	}

	const createDataUIComponent = () => {
		if(loading === true){
			return <FLoading />;
		}else{
			return (
				<Fragment>
					<div className="content-switcher-wrapper">
						<ContentSwitcher onChange={switchVizType} selectedIndex={vizTypes.indexOf(currentVizType)}>
							<Switch  text="Visual" />
							<Switch  text="Table" />
						</ContentSwitcher>
					</div>
					{ currentVizType === vizTypes[0] ?
							<FSASRChart
								data={data}
								xLabelVals={xLabelVals}
								xLabelFormat={xLabelFormat}
								scsrOffset={scsrOffset}
								/> :
						 <Fragment>
								<FTable
									rows={rows}
									headers={headers}
									onClickDownloadBtn={(e) => { console.log(e)}}
								  />
						 </Fragment>
				 	 }
				</Fragment>
			)
		}
	}

	return (
		<div className="f-content">
			<FPageTitle
				pageTitle="Expenditure | Demand Details"
				showLegend={true}
				monthPicker={
					<FMonthPicker
						defaultSelect = {{
							years:[ parseInt(dateRange[0].split('-')[0]), parseInt(dateRange[1].split('-')[0]) ],
							months:[ parseInt(dateRange[0].split('-')[1]), parseInt(dateRange[1].split('-')[1]) ] }}
						dateRange = {{years:[2018, 2019], months:[4, 3]}}
						onDateRangeSet={onDateRangeSet}
						/>
					}
				/>

      <div className="data-viz-col exp-details">
				{createDataUIComponent()}
      </div>

			<div className="filter-col-wrapper">
				<FFilterColumn2
					filterCompData ={demandwise_filter_comp}
					allFiltersData={allFiltersData && allFiltersData}
					activeFilters={activeFilters}
					filtersLoading={filtersLoading}
					onChange = {(e, key) => onFilterChange(e, key)}
					/>
			</div>
    </div>
	)
}

ExpDetails.propTypes = {
	exp_demandwise : PropTypes.object.isRequired,
	exp_demandwise_filters : PropTypes.object.isRequired,
	getExpDemandwiseData : PropTypes.func.isRequired,
	updateExpDemandwiseOnFilterChange : PropTypes.func.isRequired,
	updateExpDemandwiseOnDateRangeChange : PropTypes.func.isRequired
}

const mapStateToProps = state => ({
	exp_demandwise : state.exp_demandwise,
	exp_demandwise_filters : state.exp_demandwise_filters
})

export default connect(mapStateToProps, { getExpDemandwiseData, updateExpDemandwiseOnFilterChange, updateExpDemandwiseOnDateRangeChange })(ExpDetails);
