import axios from "axios";
import {
  GET_RECEIPTS_DATA,
  SET_DATA_LOADING_RECEIPTS,
  RECEIPTS_DATA_ERROR,
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
const { receipts: filterOrderRef } = require("../data/filters_ref.json");

export const getReceiptsData =
  (activeFilters, dateRange) => async (dispatch) => {
    try {
      const [dateFrom, dateTo] = dateRange;
      const { months, years, years_short } = yymmdd_ref;

      // As there is no data for 2020-21 we need to update code while we update data for it
      const updatedDateTo = dateTo === "2022-04-31" ? "2022-05-31" : dateTo;

      const month_week = calcMonthOrWeek(dateFrom, updatedDateTo);
      const fromMonthIndex = parseInt(dateFrom.split("-")[1]) - 1;
      const fromYearIndex = years.indexOf(dateFrom.split("-")[0]);
      const toMonthIndex = parseInt(updatedDateTo.split("-")[1]) - 1;

      const tempVizData = [];
      const tempTableData = { headers: [], rows: [] };

      const activeFilterKeys = Object.keys(activeFilters);
      const activeFilterVals = Object.values(activeFilters);

      const objForPayload = createObjForPayload(
        activeFilterVals,
        activeFilterKeys
      );

      //0 SET LOADING TO TRUE
      dispatch({ type: SET_DATA_LOADING_RECEIPTS, payload: {} });

      //1 PREP AND MAKE API CALL
      const config = {
        headers: {
          "content-type": "application/json",
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "Content-Type",
        },
      };
      const res = await axios.post(
        `https://hpback.openbudgetsindia.org/api/detail_receipts_${month_week}?start=${dateFrom}&end=${updatedDateTo}`,
        { filters: objForPayload },
        config
      );
      if (Object.keys(res.data.records).length === 0)
        throw "emptyResponseError";

      //calc x-tick-vals if is week
      let xTickVals = calcXTickVals(month_week, [res.data.records]); //1----

      //calc x-tick-formats if is week
      let xTickFormats = calcXTickFormats(
        month_week,
        [res.data.records],
        updatedDateTo,
        dateFrom
      ); //2----

      //2 PREP DATA FOR VISUALIZATION
      var highestRecord = 0;
      res.data.records.map((record, i) => {
        if (record[0] > highestRecord) {
          highestRecord = record[0];
        }
      });
      highestRecord = Math.round(highestRecord);

      let valsToMap =
        month_week === "month" //3----
          ? res.data.records
          : res.data.records.map((d) => d[1]);

      month_week === "month" && tempVizData.push({ date: " ", receipt: 0 });

      valsToMap.map((record, i) => {
        var dataObj = {};

        dataObj.date =
          month_week === "month"
            ? months[(i + fromMonthIndex) % 12] +
              " " +
              years_short[Math.floor((i + fromMonthIndex) / 12) + fromYearIndex]
            : //  : xTickVals[i] //5----
              xTickFormats[i];

        dataObj.receipt = Math.round(record[0] * 100) / 100;
        tempVizData.push(dataObj);
      });

      //3 PREP DATA FOR TABLE
      tempVizData.map((d, i) => {
        i === 0 &&
          tempTableData.headers.push(
            {
              key: "date",
              header: month_week === "week" ? "WEEKWISE DATES" : "MONTHS",
            },
            { key: "budgetCode", header: "BUDGET CODE" },
            { key: "receipt", header: "TOTAL AMOUNT IN LACS" }
          );

        i !== 0 &&
          tempTableData.rows.push({
            id: i,
            date: d.date,
            budgetCode: createBudgetCodeString(
              activeFilterVals,
              activeFilterKeys,
              filterOrderRef,
              [0, filterOrderRef.length - 1]
            ),
            receipt: (d.receipt / 100000).toFixed(2).toLocaleString("en-IN"),
          });
      });

      dispatch({
        type: GET_RECEIPTS_DATA,
        payload: {
          data: {
            vizData: {
              xLabelVals: month_week === "week" ? xTickVals : "null", //6---
              xLabelFormat:
                month_week === "week"
                  ? xTickFormats
                  : tempVizData.map((d) => d.date), //7---
              data: tempVizData,
            },
            tableData: tempTableData,
          },
          dateRange: dateRange,
          activeFilters: activeFilters,
        },
      });
    } catch (err) {
      dispatch({
        type: RECEIPTS_DATA_ERROR,
        payload: {
          filters: { dateRange, activeFilters },
          error: { status: err },
        },
      });
    }
  };
