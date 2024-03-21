import axios from "axios";
import {
  RECEIPTS_DISTRICTWISE_SWITCH_ACTIVE_VIZ_IDX,
  GET_RECEIPTS_DISTRICTWISE_DATA,
  HYDRATE_RECEIPTS_DISTRICTWISE_DATA_FROM_INITDATA,
  SET_DATA_LOADING_RECEIPTS_DISTRICTWISE,
  RESET_ACTIVE_FILTERS_AND_DATE_RANGE_RECEIPTS_DISTRICTWISE,
  RECEIPTS_DISTRICTWISE_DATA_ERROR,
} from "./types";

import {
  getWeekwiseDates,
  calcMonthOrWeek,
  createBudgetCodeString,
  createObjForPayload,
  calcXTickVals,
  calcXTickFormats,
} from "../utils/functions";

//data-refs
var yymmdd_ref = require("../data/yymmdd_ref.json");
var hp_geojson = JSON.stringify(require("../data/hp_geojson.json"));
const {
  receipts_districtwise: filterOrderRef,
} = require("../data/filters_ref.json");

export const getReceiptsDistrictwiseData =
  (initData, activeFilters, dateRange, triggeredByDateRangeChange = false) =>
  async (dispatch) => {
    try {
      if (
        Object.keys(activeFilters).length === 0 &&
        initData &&
        triggeredByDateRangeChange === false
      ) {
        dispatch({
          type: HYDRATE_RECEIPTS_DISTRICTWISE_DATA_FROM_INITDATA,
          payload: {
            populateInitData: false,
            data: initData,
            dateRange: dateRange,
            activeFilters: activeFilters,
          },
        });
      } else {
        const [dateFrom, dateTo] = dateRange;
        const { months, years, years_short } = yymmdd_ref;

        // As there is no data for 2020-21 we need to update code while we update data for it
        const updatedDateTo = dateTo === "2022-04-31" ? "2022-05-31" : dateTo;

        const month_week = calcMonthOrWeek(dateFrom, updatedDateTo);
        const fromMonthIndex = parseInt(dateFrom.split("-")[1]) - 1;
        const fromYearIndex = years.indexOf(dateFrom.split("-")[0]);
        const toMonthIndex = parseInt(updatedDateTo.split("-")[1]) - 1;

        const tempLineChrtData = [];
        const tempBarChrtData = [];
        const tempMapData = JSON.parse(hp_geojson);

        const tempTableData = { headers: [], rows: [] };

        const activeFilterKeys = Object.keys(activeFilters);
        const activeFilterVals = Object.values(activeFilters);

        const objForPayload = createObjForPayload(
          activeFilterVals,
          activeFilterKeys
        );

        //0 SET LOADING TO TRUE
        dispatch({ type: SET_DATA_LOADING_RECEIPTS_DISTRICTWISE, payload: {} });

        //1 PREP AND MAKE API CALL
        const config = { headers: { "content-type": "application/json" } };
        const res = await axios.post(
          `https://hpback.openbudgetsindia.org/api/treasury_rec?start=${dateFrom}&end=${updatedDateTo}&range=${
            month_week[0].toUpperCase() + month_week.slice(1)
          }`,
          { filters: objForPayload }
        );
        if (Object.keys(res.data.records).length === 0)
          throw "emptyResponseError";

        //2 PREP DATA FOR VISUALIZATION
        const districtNames = Object.keys(res.data.records);
        const districtwiseRecVals = Object.values(res.data.records);

        //calc x-tick-vals if is week
        let xTickVals = calcXTickVals(month_week, districtwiseRecVals);
        //calc x-tick-formats if is week
        let xTickFormats = calcXTickFormats(
          month_week,
          districtwiseRecVals,
          updatedDateTo,
          dateFrom
        );

        districtNames.map((districtName, i) => {
          let datewiseRec = [];
          let totalRec = { districtName, receipt: 0 };
          let distRecValsToMap =
            month_week === "month"
              ? districtwiseRecVals[i]
              : districtwiseRecVals[i].map((d) => d[1]);

          distRecValsToMap.map((recArray, i) => {
            let dataObj = {};
            dataObj.idx = i;
            dataObj.districtName = districtName;
            dataObj.date =
              month_week === "month"
                ? months[(i + fromMonthIndex) % 12] +
                  " " +
                  years_short[
                    Math.floor((i + fromMonthIndex) / 12) + fromYearIndex
                  ]
                : xTickFormats[i]; //5----
            dataObj.receipt = recArray[0];
            datewiseRec.push(dataObj);
            totalRec.receipt += recArray[0];
          });
          tempLineChrtData.push({
            districtName,
            datewiseRec,
            totalRec,
          });
          tempBarChrtData.push(totalRec);
          tempMapData.features.map((feature, i) => {
            const {
              properties: { NAME_2: districtName_inJson },
            } = feature; //the district name as in the geojson

            if (districtName_inJson.toUpperCase() === districtName) {
              feature.properties.receipt = totalRec.receipt;
            } else {
            }
          });
        });
        //3 PREP DATA FOR TABLE
        tempTableData.headers.push(
          { key: "districtName", header: "District", tooltip: "District Name" },
          {
            key: "treasuryCode",
            header: "Treasury Code",
            tooltip: "Unique code associated with each treasury.",
          },
          {
            key: "budgetCode",
            header: "Budget Code",
            tooltip: "Unique codes associated with Account Heads",
          },
          {
            key: "receipt",
            header: "Receipt (Lacs)",
            tooltip: "Revenue in Rupees Lakhs",
          }
        );

        tempBarChrtData.map((d, i) => {
          tempTableData.rows.push({
            id: i,
            districtName: d.districtName,
            treasuryCode: createBudgetCodeString(
              activeFilterVals,
              activeFilterKeys,
              filterOrderRef,
              [1, 2]
            ),
            budgetCode: createBudgetCodeString(
              activeFilterVals,
              activeFilterKeys,
              filterOrderRef,
              [3, filterOrderRef.length - 1]
            ),
            receipt: (d.receipt / 100000).toFixed(2).toLocaleString("en-IN"),
          });
        });

        dispatch({
          type: GET_RECEIPTS_DISTRICTWISE_DATA,
          payload: {
            populateInitData: initData ? false : true, //populate and store 'all data' so that we dont have to make API call again and again.
            data: {
              mapData: tempMapData,
              barChrtData: {
                data: tempBarChrtData,
              },
              lineChrtData: {
                xLabelVals: month_week === "week" ? xTickVals : "null", //6---
                xLabelFormat:
                  month_week === "week"
                    ? xTickFormats
                    : tempLineChrtData[0].datewiseRec.map((d) => d.date), //7---
                data: tempLineChrtData,
              },
              tableData: tempTableData,
            },
            dateRange: dateRange,
            activeFilters: activeFilters,
          },
        });
      }
    } catch (err) {
      dispatch({
        type: RECEIPTS_DISTRICTWISE_DATA_ERROR,
        payload: {
          filters: { dateRange, activeFilters },
          error: { status: err },
        },
      });
    }
  };

export const setActiveVizIdx = (e) => async (dispatch) => {
  try {
    dispatch({
      type: RECEIPTS_DISTRICTWISE_SWITCH_ACTIVE_VIZ_IDX,
      payload: e,
    });
  } catch (err) {}
};

export const resetActiveFiltersAndDateRange = () => async (dispatch) => {
  dispatch({
    type: RESET_ACTIVE_FILTERS_AND_DATE_RANGE_RECEIPTS_DISTRICTWISE,
    payload: "",
  });
};
