import { combineReducers } from "redux";

import exp_summary from "./exp_summary";
import exp_demandwise from "./exp_demandwise";
import exp_demandwise_filters from "./exp_demandwise_filters";
import exp_districtwise from "./exp_districtwise";
import exp_districtwise_filters from "./exp_districtwise_filters";

import receipts_districtwise from "./receipts_districtwise";
import receipts_districtwise_filters from "./receipts_districtwise_filters";

import exp_schemes from "./exp_schemes";
import exp_schemes_filters from "./exp_schemes_filters";

import receipts from "./receipts";
import receipts_filters from "./receipts_filters";

import exp_covid from "./exp_covid"

import procurements from "./procurements"

export default combineReducers({
  exp_summary,

  exp_demandwise,
  exp_demandwise_filters,

  exp_districtwise,
  exp_districtwise_filters,

  receipts_districtwise,
  receipts_districtwise_filters,

  exp_schemes,
  exp_schemes_filters,

  receipts,
  receipts_filters,

  exp_covid,

  procurements

});
