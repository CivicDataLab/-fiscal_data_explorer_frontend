import React, { useState } from "react";
import moment from "moment";
import { DatePicker, Select } from "antd";

import "./_style.scss";

const { RangePicker } = DatePicker;

const dateFormat = "MMM. YYYY";

const FMonthPickerUpdated = ({
  onDateRangeSet,
  availableFinancialYears,
  disableMonths,
  hideMonths,
}) => {
  const [financialYear, setFinancialYear] = useState("2022-2023");
  const [rangePickerValue, setRangePickerValue] = useState([
    moment(`2022/04/01`, "YYYY/MM/DD"),
    moment(`2022/05/31`, "YYYY/MM/DD"),
  ]);

  const handleSelectYear = (val, arr) => {
    let dates = val.split("-");
    setFinancialYear(val);
    if (val === "2022-2023") {
      setRangePickerValue([
        moment(`2022/04/01`, "YYYY/MM/DD"),
        moment(`2022/05/31`, "YYYY/MM/DD"),
      ]);
    } else {
      setRangePickerValue([
        moment(`${dates[0]}/04/01`, "YYYY/MM/DD"),
        moment(`${dates[1]}/03/31`, "YYYY/MM/DD"),
      ]);
    }
    let dateObject = {
      from: {
        year: dates[0],
        month: 4,
      },
      to: {
        year: dates[1],
        month: 3,
      },
    };
    onDateRangeSet(dateObject);
  };

  const handleDateRangeSelection = (dates) => {
    handleSetPanelButtonActions(dates);
    if (dates) {
      let dateObject = {
        from: {
          year: dates[0].year(),
          month: dates[0].month() + 1,
        },
        to: {
          year: dates[1].year(),
          month: dates[1].month() + 1,
        },
      };
      setRangePickerValue(dates);
      onDateRangeSet(dateObject);
    }
  };

  const handleSetPanelButtonActions = (dates) => {
    let condition =
      dates[0].year() === dates[1].year() &&
      dates[0].year() === parseInt(financialYear.split("-")[1]);
    if (condition) {
      let button = document.querySelector(".ant-picker-header > button");
      button.style.pointerEvents = "auto";
      button.addEventListener("click", () => {
        button.style.pointerEvents = "none";
      });
    }
  };

  return (
    <div className="ml-20">
      <Select
        defaultValue="2022-2023"
        options={availableFinancialYears}
        onChange={handleSelectYear}
      />
      {!hideMonths ? (
        <RangePicker
          className="ml-20"
          picker="month"
          allowClear={false}
          value={rangePickerValue}
          disabled={disableMonths}
          separator={""}
          onOpenChange={(open) => {
            if (open) {
              handleSetPanelButtonActions(rangePickerValue);
            }
          }}
          disabledDate={(current) => {
            if (financialYear === "2022-2023") {
              return (
                (current && current < moment("2022/04/01", "YYYY/MM/DD")) ||
                current > moment("2022/05/31", "YYYY/MM/DD")
              );
            } else {
              return (
                current &&
                (current <
                  moment(
                    `${financialYear.split("-")[0]}/04/01`,
                    "YYYY/MM/DD"
                  ) ||
                  current >
                    moment(
                      `${financialYear.split("-")[1]}/03/31`,
                      "YYYY/MM/DD"
                    ))
              );
            }
          }}
          format={dateFormat}
          onChange={handleDateRangeSelection}
        />
      ) : null}
    </div>
  );
};

export default FMonthPickerUpdated;
