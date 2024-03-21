import {
  DISTRICTWISE_SWITCH_ACTIVE_VIZ_IDX,
  GET_EXP_DISTRICTWISE_DATA,
  HYDRATE_EXP_DISTRICTWISE_DATA_FROM_INITDATA,
  SET_DATA_LOADING_EXP_DISTRICTWISE,
  RESET_ACTIVE_FILTERS_AND_DATE_RANGE_DISTRICTWISE,
  EXP_DISTRICTWISE_DATA_ERROR,
} from "../actions/types";

const initialState = {
  initData: null,
  data: { mapData: {}, barChrtData: {}, lineChrtData: {}, tableData: {} },
  dateRange: ["2022-04-01", "2022-05-31"],
  activeFilters: {},
  loading: true,
  activeVizIdx: 0,
  error: {},
};

export default function (state = initialState, action) {
  const { type, payload } = action;

  const initDataVal = state.initData ? state.initData : payload && payload.data;

  switch (type) {
    case GET_EXP_DISTRICTWISE_DATA:
    case HYDRATE_EXP_DISTRICTWISE_DATA_FROM_INITDATA:
      return {
        ...state,
        initData: initDataVal,
        data: payload.data,
        dateRange: payload.dateRange,
        activeFilters: payload.activeFilters,
        loading: false,
      };
    case SET_DATA_LOADING_EXP_DISTRICTWISE:
      return {
        ...state,
        loading: true,
        error: {},
      };
    case EXP_DISTRICTWISE_DATA_ERROR:
      return {
        ...state,
        error: payload.error,
        dateRange: payload.filters.dateRange,
        activeFilters: payload.filters.activeFilters,
        loading: false,
      };
    case RESET_ACTIVE_FILTERS_AND_DATE_RANGE_DISTRICTWISE:
      return {
        ...state,
        activeFilters: {},
        dateRange: ["2022-04-01", "2022-05-31"],
      };
    case DISTRICTWISE_SWITCH_ACTIVE_VIZ_IDX:
      return {
        ...state,
        activeVizIdx: payload,
      };
    default:
      return state;
  }
}
