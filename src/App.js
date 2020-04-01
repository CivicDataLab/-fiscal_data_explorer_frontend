import React, { Fragment, useEffect, useState } from "react";
import PropTypes from "prop-types"
import { Route, Switch, withRouter } from "react-router-dom";
import axios from "axios";
import MediaQuery from "react-responsive";
import { connect } from "react-redux";

//ACTIONS

//expenditure
import { getExpSummaryData } from "./actions/exp_summary.js"

import { getExpDemandwiseData } from "./actions/exp_demandwise.js"
import { getExpDemandwiseFiltersData } from './actions/exp_demandwise_filters';

import { getExpDistrictwiseData } from "./actions/exp_districtwise.js"
import { getExpDistrictwiseFiltersData } from './actions/exp_districtwise_filters';

//receipts
import { getReceiptsData } from "./actions/receipts.js"
import { getReceiptsFiltersData } from './actions/receipts_filters';

import { getReceiptsDistrictwiseData } from "./actions/receipts_districtwise.js"
import { getReceiptsDistrictwiseFiltersData } from './actions/receipts_districtwise_filters';

//schemes
import { getExpSchemesData } from "./actions/exp_schemes.js"
import { getExpSchemesFiltersData } from './actions/exp_schemes_filters';

//components
import FHeader1 from "./components/organisms/FHeader1";

//pages
import Home from "./content/Home";
import BudgetHighlights from "./content/BudgetHighlights";

import ExpSummary from "./content/ExpSummary";
import ExpDetails from "./content/ExpDetails";
import ExpDistrictwise from "./content/ExpDistrictwise";

import Receipts from "./content/Receipts";
import ReceiptsDistrictwise from "./content/ReceiptsDistrictwise";

import ExpSchemes from "./content/ExpSchemes";

import Glossary from "./content/Glossary";
import AboutUs from "./content/AboutUs";
import ContactUs from "./content/ContactUs";

//css
import "./App.scss";

//CONFIG
const _CONFIG = {
	initDateRange : ["2018-04-01","2019-03-31"],
	initActiveFilters : {},
	initAllFiltersData : [],
	initRawFilterDataAllHeads : {} //only applies for exp_districtwise, receipts_districtwise & schemes
}


const App = ({

		getExpSummaryData,

		getExpDemandwiseData,
	  getExpDemandwiseFiltersData,

		getExpDistrictwiseData,
	  getExpDistrictwiseFiltersData,

		getReceiptsData,
	  getReceiptsFiltersData,

		getReceiptsDistrictwiseData,
	  getReceiptsDistrictwiseFiltersData,

		getExpSchemesData,
		getExpSchemesFiltersData,

		location : { pathname }
	}
) => {


const apiCallQueue = [
	{ apiFunc: () => getExpSummaryData() },

	{ apiFunc: () => getReceiptsData(_CONFIG.initActiveFilters, _CONFIG.initDateRange) },
	{ apiFunc: () => getReceiptsFiltersData() },

	{ apiFunc: () => getExpSchemesData(null /*initData*/, _CONFIG.initActiveFilters, _CONFIG.initDateRange) },
	{ apiFunc: () => getExpSchemesFiltersData(_CONFIG.initAllFiltersData, _CONFIG.initRawFilterDataAllHeads) },

	{ apiFunc: () => getReceiptsDistrictwiseData(null /*initData*/, _CONFIG.initActiveFilters, _CONFIG.initDateRange) },
	{ apiFunc: () => getReceiptsDistrictwiseFiltersData(_CONFIG.initAllFiltersData, _CONFIG.initRawFilterDataAllHeads) },

	{ apiFunc: () => getExpDemandwiseData(_CONFIG.initActiveFilters, _CONFIG.initDateRange) },

	{ apiFunc: () => getExpDistrictwiseData(null /*initData*/, _CONFIG.initActiveFilters, _CONFIG.initDateRange) },

	{ apiFunc: () => getExpDistrictwiseFiltersData(_CONFIG.initAllFiltersData, _CONFIG.initRawFilterDataAllHeads) },

	{ apiFunc: () => getExpDemandwiseFiltersData() }
]




const fetchApisInQueue = async (idx) => {
		await apiCallQueue[idx].apiFunc();
		if(idx+1 !== apiCallQueue.length){
			fetchApisInQueue(idx+1);
		}
}

 useEffect(() => {
	 // if(pathname.includes("receipts") === true){
		//  apiCallQueue.unshift(
		// 	 { apiFunc: () => getReceiptsData(initReceiptsFilters, initReceiptsDateRange) },
		//  	 { apiFunc: () => getReceiptsFiltersData() }
		//  )
	 // }
	 fetchApisInQueue(0);

 }, []);

 return (
      <div>
        <FHeader1 />
          <Switch>
						<Route exact path="/" component={Home} />
            <Route exact path="/aboutus" component={AboutUs} />
            <Route exact path="/contactus" component={ContactUs} />
						<Route exact path="/glossary" component={Glossary} />
            <Route exact path="/expenditure/summary" component={ExpSummary} />
            <Route exact path="/expenditure/details" component={ExpDetails} />
            <Route exact path="/expenditure/tracker" component={ExpDistrictwise} />
						<Route exact path="/receipts/districtwise" component={ReceiptsDistrictwise} />
						<Route exact path="/schemes" component={ExpSchemes} />
            <Route exact path="/receipts" component={Receipts} />
          </Switch>
      </div>
  );
}

App.propTypes = {

	getExpSummaryData : PropTypes.func.isRequired,

	getExpDemandwiseData : PropTypes.func.isRequired,
  getExpDemandwiseFiltersData : PropTypes.func.isRequired,

	getExpDistrictwiseData : PropTypes.func.isRequired,
  getExpDistrictwiseFiltersData : PropTypes.func.isRequired,

	getReceiptsData : PropTypes.func.isRequired,
  getReceiptsFiltersData : PropTypes.func.isRequired,

	getReceiptsDistrictwiseData : PropTypes.func.isRequired,
  getReceiptsDistrictwiseFiltersData : PropTypes.func.isRequired,

	getExpSchemesData : PropTypes.func.isRequired,
	getExpSchemesFiltersData : PropTypes.func.isRequired

}

const mapStateToProps = state => ({

})

export default withRouter(connect(
	mapStateToProps,
	{
		getExpSummaryData,
		getExpDemandwiseData,
		getExpDemandwiseFiltersData,
		getExpDistrictwiseData,
		getExpDistrictwiseFiltersData,

		getReceiptsData,
		getReceiptsFiltersData,

		getReceiptsDistrictwiseData,
		getReceiptsDistrictwiseFiltersData,

		getExpSchemesData,
		getExpSchemesFiltersData

	})(App));
