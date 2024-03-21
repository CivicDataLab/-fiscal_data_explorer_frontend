import {
  GET_EXP_SCHEMES_DATA,
  SET_DATA_LOADING_EXP_SCHEMES,
  EXP_SCHEMES_DATA_ERROR,
  RESET_ACTIVE_FILTERS_AND_DATE_RANGE_SCHEMES,
  HYDRATE_SCHEMES_DATA_FROM_INITDATA,
} from "../actions/types";

const initialState = {
  initData: null,
  data: { mapData: {}, barChrtData: {}, lineChrtData: {}, tableData: {} },
  dateRange: ["2022-04-01", "2022-05-31"],
  activeFilters: {},
  loading: true,
  error: {},
};

export default function (state = initialState, action) {
  const { type, payload } = action;

  const initDataVal = state.initData ? state.initData : payload && payload.data;

  switch (type) {
    case GET_EXP_SCHEMES_DATA:
    case HYDRATE_SCHEMES_DATA_FROM_INITDATA:
      return {
        ...state,
        initData: initDataVal,
        data: payload.data,
        dateRange: payload.dateRange,
        activeFilters: payload.activeFilters,
        loading: false,
      };
    case SET_DATA_LOADING_EXP_SCHEMES:
      return {
        ...state,
        loading: true,
        error: {},
      };
    case EXP_SCHEMES_DATA_ERROR:
      return {
        ...state,
        error: payload.error,
        dateRange: payload.filters.dateRange,
        activeFilters: payload.filters.activeFilters,
        loading: false,
      };
    case RESET_ACTIVE_FILTERS_AND_DATE_RANGE_SCHEMES:
      return {
        ...state,
        activeFilters: {},
        dateRange: ["2022-04-01", "2022-05-31"],
      };
    default:
      return state;
  }
}
