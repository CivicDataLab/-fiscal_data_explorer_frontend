import axios from "axios";
import {
  DISTRICTWISE_SWITCH_ACTIVE_VIZ_IDX,
  GET_EXP_DISTRICTWISE_DATA,
  SET_DATA_LOADING_EXP_DISTRICTWISE,
  EXP_DISTRICTWISE_DATA_ERROR
} from "./types";

import {
  getWeekwiseDates,
  calcMonthOrWeek,
  createBudgetCodeString
} from '../utils/functions';

//data-refs
var yymmdd_ref = require("../data/yymmdd_ref.json");
var hp_geojson = JSON.stringify(require("../data/hp_geojson.json"));

export const getExpDistrictwiseData = (activeFilters, dateRange) => async dispatch => {
  try {

    const [ dateFrom , dateTo ] = dateRange;
    const { months , years, years_short } = yymmdd_ref;
    const month_week = calcMonthOrWeek(dateFrom, dateTo);
    const fromMonthIndex = parseInt(dateFrom.split('-')[1])-1;
    const fromYearIndex = years.indexOf(dateFrom.split('-')[0]);
    const toMonthIndex = parseInt(dateTo.split('-')[1])-1;

    const tempLineChrtData = [];
    const tempBarChrtData = [];
    const tempMapData = JSON.parse(hp_geojson);
    console.log("og object");
    console.log(hp_geojson);
    console.log("temp map data obj");
    console.log(tempMapData);
    const tempTableData = { headers : [], rows : [] };

    const activeFilterKeys = Object.keys(activeFilters);
    const activeFilterVals = Object.values(activeFilters);

    var objForPayload = {};
    activeFilterVals.map((val, i) => {
        let tempVal = val.map(item => { return item.split('-')[0]});
        tempVal = tempVal.join('","');
        objForPayload[activeFilterKeys[i]] =  '"' + tempVal + '"';
    })
    console.log("objForPayload");
    console.log(objForPayload);

    //0 SET LOADING TO TRUE
    dispatch({ type: SET_DATA_LOADING_EXP_DISTRICTWISE, payload: {} });

    //1 PREP AND MAKE API CALL
    const config = { headers: { "content-type": "application/json" } };
		const res = await axios.post(
      `http://13.126.189.78/api/treasury_exp?start=${dateFrom}&end=${dateTo}&range=${month_week[0].toUpperCase() + month_week.slice(1)}`, {filters:objForPayload}
    );
		console.log("exp districtwise raw data"); console.log(res.data.records);


    //2 PREP DATA FOR VISUALIZATION
    const districtNames = Object.keys(res.data.records);
    const districtwiseExpVals = Object.values(res.data.records);
    console.log("districtwiseExpVals");
    console.log(districtwiseExpVals);
    districtNames.map((districtName, i) => {
      let datewiseExp = [];
      let totalExp = { districtName, gross: 0, BTDED: 0, AGDED: 0, netPayment: 0};
      // datewiseExp.push({"date":(month_week === "month" ? " " : 0), "gross": 0, "BTDED": 0, "AGDED": 0, "netPayment": 0});
      districtwiseExpVals[i].map((expArray, i) => {
        let dataObj = {};
        dataObj.idx = i;
        dataObj.date = month_week === "month" ?
                       months[(i+fromMonthIndex)%12]+" "+years_short[Math.floor((i+fromMonthIndex)/12) + fromYearIndex] :
                       getWeekwiseDates( dateFrom, fromMonthIndex, toMonthIndex, fromYearIndex).date_for_x_axis[i];
        dataObj.gross = expArray[0];
        dataObj.BTDED = expArray[1];
        dataObj.AGDED = expArray[2];
        dataObj.netPayment = expArray[3];
        datewiseExp.push(dataObj);

        totalExp.gross += expArray[0]
        totalExp.BTDED += expArray[1]
        totalExp.AGDED += expArray[2]
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
          feature.properties.BTDED = totalExp.BTDED;
          feature.properties.AGDED = totalExp.AGDED;
          feature.properties.netPayment = totalExp.netPayment;
        }else{
        }
      })
    })

    console.log("tempLineChrtData");
    console.log(tempLineChrtData);

    console.log("tempBarChrtData");
    console.log(tempBarChrtData);

    console.log("tempMapData");
    console.log(tempMapData);

    //3 PREP DATA FOR TABLE
    tempTableData.headers.push(
      { key: 'districtName', header: 'District' },
      { key: 'budgetCode', header: 'Budget Code' },
      { key: 'gross', header: 'Gross (INR)' },
      { key: 'BTDED', header: 'BTDED (INR)' },
      { key: 'AGDED', header: 'AGDED (INR)' },
      { key: 'netPayment', header: 'Net Payment (INR)' }
    )

    tempBarChrtData.map((d, i) => {
    	tempTableData.rows.push({
    		id: i,
    		'districtName': d.districtName,
        'budgetCode' : createBudgetCodeString(activeFilterVals, activeFilterKeys),
    		'gross': d.gross.toLocaleString('en-IN'),
    		'BTDED': d.BTDED.toLocaleString('en-IN'),
    		'AGDED': d.AGDED.toLocaleString('en-IN'),
    		'netPayment': d.netPayment.toLocaleString('en-IN')
    	})
    })
    console.log("tempTableData");
    console.log(tempTableData);

    dispatch({
      type: GET_EXP_DISTRICTWISE_DATA,
      payload: {
        data: {
          mapData: tempMapData,
          barChrtData: {
            data:tempBarChrtData
          },
          lineChrtData: {
            xLabelVals:getWeekwiseDates( dateFrom, fromMonthIndex, toMonthIndex, fromYearIndex).date_for_x_axis,
            xLabelFormat: month_week === "week" ? getWeekwiseDates( dateFrom, fromMonthIndex, toMonthIndex, fromYearIndex).date_for_tick : null,
            data:tempLineChrtData
          },
          tableData: tempTableData
        },
        dateRange: dateRange,
        activeFilters: activeFilters
      }
    });

  } catch (err) {
    dispatch({
      type: EXP_DISTRICTWISE_DATA_ERROR,
      payload: {
        status: err
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
