import axios from "axios";
import {
  DISTRICTWISE_SWITCH_ACTIVE_VIZ_IDX,
  GET_EXP_DISTRICTWISE_DATA,
  HYDRATE_EXP_DISTRICTWISE_DATA_FROM_INITDATA,
  SET_DATA_LOADING_EXP_DISTRICTWISE,
  RESET_ACTIVE_FILTERS_AND_DATE_RANGE_DISTRICTWISE,
  EXP_DISTRICTWISE_DATA_ERROR
} from "./types";

import {
  calcMonthOrWeek,
  createBudgetCodeString,
  createObjForPayload,
  calcXTickVals, //0----
  calcXTickFormats, //0----
  toTitleCase
} from '../utils/functions';

//data-refs
var yymmdd_ref = require("../data/yymmdd_ref.json");
var hp_geojson = JSON.stringify(require("../data/hp_geojson.json"));
const { exp_districtwise : filterOrderRef } = require("../data/filters_ref.json");

export const getExpDistrictwiseData = (initData, activeFilters, dateRange, triggeredByDateRangeChange = false) => async dispatch => {
  try {

    if(Object.keys(activeFilters).length === 0 && initData && triggeredByDateRangeChange === false){
      dispatch({
        type: HYDRATE_EXP_DISTRICTWISE_DATA_FROM_INITDATA,
        payload: {
          data: initData,
          dateRange: dateRange,
          activeFilters: activeFilters
        }
      });
    }else{

      const [ dateFrom , dateTo ] = dateRange;
      // console.log("DOCU: dateRange", dateRange)
      // console.log("DOCU: activeFilters", activeFilters)
      const { months , years, years_short } = yymmdd_ref;

      // As there is no data for 2020-21 we need to update code while we update data for it
      const updatedDateTo = dateTo === "2021-03-31" ? "2020-05-31" : dateTo

      const month_week = calcMonthOrWeek(dateFrom, updatedDateTo);
      const fromMonthIndex = parseInt(dateFrom.split('-')[1])-1;
      const fromYearIndex = years.indexOf(dateFrom.split('-')[0]);

      const activeFilterKeys = Object.keys(activeFilters);
      const activeFilterVals = Object.values(activeFilters);
      // console.log("DOCU: activeFilterKeys", activeFilterKeys);
      // console.log("DOCU: activeFilterVals", activeFilterVals);

      const objForPayload = createObjForPayload(activeFilterVals, activeFilterKeys);
      console.log("DOCU: objForPayload", objForPayload);

      //0 SET LOADING TO TRUE
      dispatch({ type: SET_DATA_LOADING_EXP_DISTRICTWISE, payload: {} });

      //1 PREP AND MAKE API CALL
      const config = { headers: { "content-type": "application/json" } };
      // console.log('exp_districtwise_api_call:', `https://hpback.openbudgetsindia.org/api/treasury_exp?start=${dateFrom}&end=${dateTo}&range=${month_week[0].toUpperCase() + month_week.slice(1)}`);
      const res = await axios.post(
        `https://hpback.openbudgetsindia.org/api/treasury_exp?start=${dateFrom}&end=${updatedDateTo}&range=${toTitleCase(month_week)}`,
        { filters : objForPayload },
        config
      )
  		// console.log("exp districtwise raw data", res.data.records);
      if(Object.keys(res.data.records).length === 0) throw "emptyResponseError";

      console.log('DOCU: response data', res.data );

      //2 PREP DATA FOR VISUALIZATION
      const districtNames = Object.keys(res.data.records);
      const districtwiseExpVals = Object.values(res.data.records);

      //calc x-tick-vals if is week
      let xTickVals = calcXTickVals(month_week, districtwiseExpVals); //1---- //redundant can get rid of it
      //calc x-tick-formats if is week
      let xTickFormats = calcXTickFormats(month_week, districtwiseExpVals, updatedDateTo, dateFrom);  //2----


      const tempLineChrtData = [];
      const tempBarChrtData = [];
      const tempMapData = JSON.parse(hp_geojson);
      const tempTableData = { headers : [], rows : [] };


      districtNames.map((districtName, i) => {
        let datewiseExp = [];
        let totalExp = { districtName, gross: 0, AGDED: 0, BTDED: 0, netPayment: 0};
        // datewiseExp.push({"date":(month_week === "month" ? " " : 0), "gross": 0, "AGDED": 0, "BTDED": 0, "netPayment": 0});
        let distExpValsToMap = month_week === 'month' //3----
                               ? districtwiseExpVals[i]
                               : districtwiseExpVals[i].map(d => d[1] ) ;
        // console.log("distExpValsToMap", distExpValsToMap);

        distExpValsToMap.map((expArray, i) => { //4----
          let dataObj = {};
          dataObj.idx = i;
          dataObj.districtName = districtName;
          dataObj.date = month_week === "month"
                         ? months[(i+fromMonthIndex)%12]+" "+years_short[Math.floor((i+fromMonthIndex)/12) + fromYearIndex] //can also be handled within the calcXTickFormats function itself
                         : xTickFormats[i] //5----
          dataObj.gross = expArray[0];
          dataObj.AGDED = expArray[1];
          dataObj.BTDED = expArray[2];
          dataObj.netPayment = expArray[3];
          datewiseExp.push(dataObj);

          totalExp.gross += expArray[0]
          totalExp.AGDED += expArray[1]
          totalExp.BTDED += expArray[2]
          totalExp.netPayment += expArray[3]
        })
        tempLineChrtData.push({
          districtName,
          datewiseExp,
          totalExp
        })
        tempBarChrtData.push(totalExp);
        tempMapData.features.map((feature,i) =>{
          const { properties : { NAME_2 : districtName_inJson }} = feature; //the district name as in the geojson
          if(districtName_inJson.toUpperCase() === districtName ){
            feature.properties.gross = totalExp.gross;
            feature.properties.AGDED = totalExp.AGDED;
            feature.properties.BTDED = totalExp.BTDED;
            feature.properties.netPayment = totalExp.netPayment;
          }else{
          }
        })
      })

      // console.log("tempLineChrtData", tempLineChrtData);
      // console.log("tempBarChrtData", tempBarChrtData);
      // console.log("tempMapData", tempMapData);

      //3 PREP DATA FOR TABLE
      tempTableData.headers.push(
        { key: 'districtName', header: 'District' },
        { key: 'treasuryCode', header: 'Treasury Code' },
        { key: 'budgetCode', header: 'Budget Code' },
        { key: 'gross', header: 'Gross (Lacs)' },
        { key: 'AGDED', header: 'AGDED (Lacs)' },
        { key: 'BTDED', header: 'BTDED (Lacs)' },
        { key: 'netPayment', header: 'Net Payment (Lacs)' }
      )

      tempBarChrtData.map((d, i) => {
      	tempTableData.rows.push({
      		id: i,
      		'districtName': d.districtName,
          'treasuryCode' : createBudgetCodeString(activeFilterVals, activeFilterKeys, filterOrderRef, [0, 2]),
          'budgetCode' : createBudgetCodeString(activeFilterVals, activeFilterKeys, filterOrderRef, [3, filterOrderRef.length-1]),
      		'gross': (d.gross/100000).toFixed(2).toLocaleString('en-IN'),
          'AGDED': (d.AGDED/100000).toFixed(2).toLocaleString('en-IN'),
      		'BTDED': (d.BTDED/100000).toFixed(2).toLocaleString('en-IN'),
      		'netPayment': (d.netPayment/100000).toFixed(2).toLocaleString('en-IN')
      	})
      })

      // console.log("tempTableData", tempTableData);

      dispatch({
        type: GET_EXP_DISTRICTWISE_DATA,
        payload: {
          data: {
            mapData: tempMapData,
            barChrtData: {
              data:tempBarChrtData
            },
            lineChrtData: {
              xLabelVals: month_week === "week" ? 'null' : 'null', //6--- //redundant can get rid of it.
              xLabelFormat: month_week === "week" ? xTickFormats : tempLineChrtData[0].datewiseExp.map(d => d.date),  //7---
              data:tempLineChrtData
            },
            tableData: tempTableData
          },
          dateRange: dateRange,
          activeFilters: activeFilters
        }
      });
    }

  } catch (err) {
    dispatch({
      type: EXP_DISTRICTWISE_DATA_ERROR,
      payload: {
        filters : { dateRange, activeFilters },
        error : { status: err }
      }
    });
  }
};

export const setActiveVizIdx = (e) => async dispatch => {
  try{
    dispatch({
      type: DISTRICTWISE_SWITCH_ACTIVE_VIZ_IDX,
      payload: e
    })
  }catch(err){

  }
}

export const resetActiveFiltersAndDateRange = () => async dispatch => {
  dispatch({
    type: RESET_ACTIVE_FILTERS_AND_DATE_RANGE_DISTRICTWISE,
    payload: ''
  })
}
