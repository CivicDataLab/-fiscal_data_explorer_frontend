import {
  GET_RECEIPTS_DATA,
  SET_DATA_LOADING_RECEIPTS,
  RECEIPTS_DATA_ERROR,
} from "../actions/types";

const initialState = {
  data: { vizData: {}, tableData: {} },
  dateRange: ["2022-04-01", "2022-05-31"],
  activeFilters: {},
  loading: true,
  error: {},
};

export default function (state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_RECEIPTS_DATA:
      return {
        ...state,
        data: payload.data,
        dateRange: payload.dateRange,
        activeFilters: payload.activeFilters,
        loading: false,
      };
    case SET_DATA_LOADING_RECEIPTS:
      return {
        ...state,
        loading: true,
        error: {},
      };
    case RECEIPTS_DATA_ERROR:
      return {
        ...state,
        error: payload.error,
        dateRange: payload.filters.dateRange,
        activeFilters: payload.filters.activeFilters,
        loading: false,
      };
    default:
      return state;
  }
}
