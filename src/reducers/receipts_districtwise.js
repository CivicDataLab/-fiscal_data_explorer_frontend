import {
  RECEIPTS_DISTRICTWISE_SWITCH_ACTIVE_VIZ_IDX,
  GET_RECEIPTS_DISTRICTWISE_DATA,
  HYDRATE_RECEIPTS_DISTRICTWISE_DATA_FROM_INITDATA,
  SET_DATA_LOADING_RECEIPTS_DISTRICTWISE,
  RESET_ACTIVE_FILTERS_AND_DATE_RANGE_RECEIPTS_DISTRICTWISE,
  RECEIPTS_DISTRICTWISE_DATA_ERROR } from "../actions/types";

const initialState = {
  initData: null,
  data: { mapData:{}, barChrtData:{}, lineChrtData:{}, tableData:{}},
  dateRange: ["2020-04-01","2020-05-30"],
  activeFilters: {},
  loading: true,
  activeVizIdx: 0,
  error: {}
};

export default function(state = initialState, action) {
  const { type, payload } = action;

  const initDataVal = state.initData ? state.initData : (payload && payload.data);

  switch (type) {
    case GET_RECEIPTS_DISTRICTWISE_DATA:
    case HYDRATE_RECEIPTS_DISTRICTWISE_DATA_FROM_INITDATA:
      return {
        ...state,
        initData: initDataVal,
        data: payload.data,
        dateRange: payload.dateRange,
        activeFilters: payload.activeFilters,
        loading: false
      };
    case SET_DATA_LOADING_RECEIPTS_DISTRICTWISE:
      return {
        ...state,
        loading: true,
        error: {}
      };
    case RECEIPTS_DISTRICTWISE_DATA_ERROR:
      return {
        ...state,
        error: payload.error,
        dateRange: payload.filters.dateRange,
        activeFilters: payload.filters.activeFilters,
        loading: false
      };
    case RESET_ACTIVE_FILTERS_AND_DATE_RANGE_RECEIPTS_DISTRICTWISE:
      return {
        ...state,
        activeFilters: {},
        dateRange: ["2020-04-01","2020-05-30"]
      }
    case RECEIPTS_DISTRICTWISE_SWITCH_ACTIVE_VIZ_IDX:
      return {
        ...state,
        activeVizIdx: payload
      };
    default:
      return state;
  }
}
