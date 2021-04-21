import moment from 'moment';

var yymmdd_ref = require("../data/yymmdd_ref.json");
var scsr_offset = require("../data/scsr_offset.json");

export const prepQueryStringForFiltersApi = activeFilters => {
  const activeFilterKeys = Object.keys(activeFilters);
  const activeFilterVals = Object.values(activeFilters);
  var stringForApi = "";

  activeFilterVals.map((val, i) => {
      let tempVal0 = val.map(item => { return item.split('-')[0]});
      let tempVal1 = val.map(item => { return item.split('-')[1]});

      tempVal0 = tempVal0.join('","');
      tempVal1 = tempVal1.join('","');

      stringForApi +=  activeFilterKeys[i].split('-')[0] + '="' + tempVal0 + '"';
      if(activeFilterKeys[i].split('-')[1] !== undefined){
        stringForApi += '&' + activeFilterKeys[i].split('-')[1] + '="' + tempVal1 + '"';
      }
      if(i < activeFilterVals.length - 1){
        stringForApi += '&';
      }
  })

  return stringForApi;
}

export const calcXTickVals = (month_week, districtwiseVals) => {
  let offset = 0;
  let corresWeekNum = month_week !== 'month' && districtwiseVals[0].map((d,i) => {
    if(i !== 0 && districtwiseVals[0][i-1][0] > d[0]){ //if year has changed
       offset = districtwiseVals[0][i-1][0]+1;
    }
    return offset + d[0];
  })

  return corresWeekNum;
}

export const calcXTickFormats = (month_week, districtwiseVals, dateTo, dateFrom) => {
  let switchYear = false; //this one, when it turns to true, stays true.
  let switchYearGate = false;  // this one, when it turns to true, stays that way only for that particular loop cycle, after which it is sitched back to false

  let corresWeekDateRange = month_week !== 'month' && districtwiseVals[0].map((d,i) => {
    if(i !== 0 && districtwiseVals[0][i-1][0] > d[0]){ //if year has changed
       switchYear = true;
       switchYearGate = true;
    }
    let yearForMoment = switchYear === true ? dateTo : dateFrom;

    let xTickString = moment(yearForMoment.split('-')[0]).add(d[0], 'weeks').startOf('week').format(switchYearGate === true ? 'DD MMM YY' : 'DD MMM') /*gets the sunday of the week*/
                  + ' - ' +
                  moment(yearForMoment.split('-')[0]).add(d[0], 'weeks').endOf('week').format('DD MMM YY'); /*gets the saturday of the week*/

    switchYearGate = false;

    return xTickString;
  })
  return corresWeekDateRange;
}

//1
export const convertDataToJson = (data) => {
  const dataToJson = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
  return dataToJson;
}

//2
export const getWeekwiseDates = ( dateFrom, fromMonthIndex, toMonthIndex, fromYearIndex) => {

  //dealing with the case where toMonthIndex falls in the next year
  const toMonthIndexAddOn = toMonthIndex < fromMonthIndex ? 12 : 0;
  var allWeekWiseDays = []; //for the actual tick on x axis and the
  var totWeekWiseDayNums = []; //for mapping x axis
  var pMonthTotDays = 0;
  const { months , years, years_short } = yymmdd_ref;



  for(var i = fromMonthIndex ; i <= toMonthIndex + toMonthIndexAddOn ; i++){

      const iMod = i%12;
      const jsDateFrom = new Date(years[Math.floor(((i%fromMonthIndex)+fromMonthIndex)/12) + fromYearIndex]+`-0${iMod+1}-`+dateFrom.split('-')[2]);
      const dayFromIndex = jsDateFrom.getDay();
      const totDaysCurrMonth = parseInt(yymmdd_ref.noOfDays[iMod]);
      const firstWeekend = (7 - dayFromIndex);
      const weekwiseDaysOfMonth = [firstWeekend]; //a week = SUN to SAT
      let weekendCounter = firstWeekend ;
      while((weekendCounter+7) <= totDaysCurrMonth){
        weekendCounter += 7;
        weekwiseDaysOfMonth.push(weekendCounter)
      }
      if(iMod === toMonthIndex){ //if this is the last month only then add the end of month date
        weekwiseDaysOfMonth.push(totDaysCurrMonth);
      }

      weekwiseDaysOfMonth.map(date => {
        totWeekWiseDayNums.push(date+pMonthTotDays);
      })

      const weekwiseDatesOfMonth = weekwiseDaysOfMonth.map(day => {
        return day + " " + months[((i%fromMonthIndex)+fromMonthIndex)%12] + " " + years_short[Math.floor(((i%fromMonthIndex)+fromMonthIndex)/12) + fromYearIndex];
      })

      allWeekWiseDays = allWeekWiseDays.concat(weekwiseDatesOfMonth);
      pMonthTotDays += totDaysCurrMonth;
  }
    return { "date_for_tick" : allWeekWiseDays, "date_for_x_axis" : totWeekWiseDayNums };
}

//3
export const calcMonthOrWeek = (dateFrom, dateTo) => {
  var dateFromTime = new Date(dateFrom).getTime();
  var dateToTime = new Date(dateTo).getTime();
  var daysDiff = ((dateToTime - dateFromTime) / (1000 * 3600 * 24)) + 2; //this calcs every day BETWEEN the given 2 dates. So add '2' to correct this
  const month_week = daysDiff > 125 ? "month" : "week"; //give month-wise breakdown if range > 125 days
  return month_week;
}

//4
export const calcScsrOffset = (tempVizData) => {
  const noOfDataRecords = tempVizData.length;
  return scsr_offset.xOffset[noOfDataRecords - 1];
}

//5
export const getDynamicYLabelFormat = (y) => (
  y > 9999999 ?
  (y/10000000) + " Cr" :
  y > 99999 ?
  (y/100000) + " L" :
  (y > 999 && y < 99999) ?
  (y/1000) + " K" :
  y
)

//6
export const onDateRangeChange = ( newDateRange ) => { //the month number-range is coming in as 1 - 12
  const { year : fromYear, month : fromMonth } = newDateRange.from;
  const { year : toYear, month : toMonth } = newDateRange.to;

  const dateFrom = fromYear.toString()+ "-" + ( fromMonth < 10 ? "0" : "") + fromMonth.toString() + "-01" ;
  const dateTo = toYear.toString() + "-" + //YY
           ( toMonth < 10 ? "0" : "") + toMonth.toString() + "-" + //MM
           ( toMonth !== 2 ? //dealing with day count of feb and leap year
             yymmdd_ref.noOfDays[toMonth-1] :
             yymmdd_ref.noOfDays[toMonth-1].split('_')[ (toYear%4 === 0 ? 1 : 0)] ) ; //DD

   return [dateFrom, dateTo];
}

//7
//find all the places where the selected filter exists.
export const recursFilterFind = (obj, query, results, idx, filterOrderRef, activeFilters, filterChangedIdx) => {


  if(query === "all"){
    if(filterChangedIdx === idx){
      Object.keys(obj).map(obj_key => {
        results.push(obj[obj_key]);
      })
      return;
    }
  }

  Object.keys(obj).map(obj_key => {
    if(obj[obj_key]){
      if(obj_key === query ){
        results.push(obj[query]);
      }

      if(activeFilters.filters.hasOwnProperty(filterOrderRef[idx]) === true ){
        if(activeFilters.filters[filterOrderRef[idx]] === obj_key.split("-")[0]){
          recursFilterFind(obj[obj_key], query, results, idx+1, filterOrderRef, activeFilters, filterChangedIdx);
        }else if (activeFilters.filters[filterOrderRef[idx]] === "all") {
          recursFilterFind(obj[obj_key], query, results, idx+1, filterOrderRef, activeFilters, filterChangedIdx);
        }
      }else{
        recursFilterFind(obj[obj_key], query, results, idx+1, filterOrderRef, activeFilters, filterChangedIdx);
      }

      // recursFilterFind(obj[obj_key], query, results, idx+1, filterOrderRef, activeFilters, filterChangedIdx);

    }
  });
}

//8
export const recursFilterFetch = (allFiltersData, obj, idx) => {
  Object.keys(obj).map(obj_key => {
    if(obj[obj_key]){
      if(allFiltersData[idx].val.some(item => item.id === obj_key) !== true){
        const filterOption = {
          filter_name: allFiltersData[idx].key,
          id: obj_key,
          label: obj_key,
          value: obj_key
        }
        allFiltersData[idx].val.push(filterOption);
      }
      recursFilterFetch(allFiltersData, obj[obj_key], idx+1);
    }
  });
}

//9
export const filterCompGenData = () => {
}


//10
//find all the places where the selected filter exists.
export const recursFilterFind2 = (obj, query, results, idx, filterOrderRef, activeFilters, filterChangedIdx) => {

  Object.keys(obj).map(obj_key => {
    if(obj[obj_key]){
      query.map(query_item => {
        if(obj_key === query_item.id ){
          results.push(obj[query_item.id]);
        }
      })



      if(activeFilters.hasOwnProperty(filterOrderRef[idx]) === true ){
        if(activeFilters[filterOrderRef[idx]].includes(obj_key)){
          recursFilterFind2(obj[obj_key], query, results, idx+1, filterOrderRef, activeFilters, filterChangedIdx);
        }
        // else if (activeFilters.filters[filterOrderRef[idx]] === "all") {
        //   recursFilterFind(obj[obj_key], query, results, idx+1, filterOrderRef, activeFilters, filterChangedIdx);
        // }
      }else{
        recursFilterFind2(obj[obj_key], query, results, idx+1, filterOrderRef, activeFilters, filterChangedIdx);
      }
    }
  });
}

//11
export const resetFiltersToAllFilterHeads = (rawFilterDataAllHeads, filterOrderRef) => {
  const allFiltersData = [];
  filterOrderRef.map((filter_name,i) => {
    allFiltersData.push({
      key: filter_name,
      val: []
    })

    rawFilterDataAllHeads.data[filter_name.split('-')[0]].map(d => {
      allFiltersData[i].val.push({ filter_name, id : d, label: d,  value: d })
    })
  })

  return allFiltersData;
}

//12

export const createBudgetCodeString = (activeFilterVals, activeFilterKeys, filterOrderRef, range) => { //the range array is the indices between which we wanna
  const budgetCodeStringArray = filterOrderRef.map((d, i) => {

    if(i >= range[0] && i <= range[1]){
      if(activeFilterKeys.includes(filterOrderRef[i])){
        const activeKeyIdx = activeFilterKeys.indexOf(filterOrderRef[i]);
        const valCode = activeFilterVals[activeKeyIdx].map(val => {
          return val.split('-')[0];
        })
        return valCode.join(", ");
      }else{ return "all"; }
    }
  })
  const budgetCodeStringArray_clean = budgetCodeStringArray.filter(elem => elem !== undefined);
  return budgetCodeStringArray_clean.join(' - ');
}

//13

export const clearAllSelectedOptions = (filterName) => {
  document
    .querySelectorAll(`.f-${filterName}-multiselect .bx--list-box__selection--multi`)
    .forEach(e => e.click());
}

//14

export const createObjForPayload = (activeFilterVals, activeFilterKeys) => {

  var objForPayload = {};

  activeFilterVals.map((val, i) => {
      let tempVal1 = val.map(item => item.split('-')[0] );
      let tempVal2 = val.map(item => item.split('-')[1] );
      tempVal1 = tempVal1.join('","');
      tempVal2 = tempVal2.join('","');
      objForPayload[activeFilterKeys[i].split('-')[0]] =  '"' + tempVal1 + '"';
      if(activeFilterKeys[i].split('-')[1] !== undefined){ //this is a check to see if our filter is if of the CODE_NAME format or simply a CODE format
        objForPayload[activeFilterKeys[i].split('-')[1]] =  '"' + tempVal2 + '"';
      }
  })

  return objForPayload;
}

export const toTitleCase = (word) => {
  return word[0].toUpperCase() + word.slice(1);
}
