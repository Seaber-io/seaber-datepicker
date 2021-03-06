import isDate from "date-fns/isDate";
import isValidDate from "date-fns/isValid";
import format from "date-fns-tz/format";
import addMinutes from "date-fns/addMinutes";
import addHours from "date-fns/addHours";
import addDays from "date-fns/addDays";
import addWeeks from "date-fns/addWeeks";
import addMonths from "date-fns/addMonths";
import addYears from "date-fns/addYears";
import subMinutes from "date-fns/subMinutes";
import subHours from "date-fns/subHours";
import subDays from "date-fns/subDays";
import subWeeks from "date-fns/subWeeks";
import subMonths from "date-fns/subMonths";
import subYears from "date-fns/subYears";

import getQuarter from "date-fns/getQuarter";

import setSeconds from "date-fns/setSeconds";

import setQuarter from "date-fns/setQuarter";

import min from "date-fns/min";
import max from "date-fns/max";
import differenceInCalendarDays from "date-fns/differenceInCalendarDays";
import differenceInCalendarMonths from "date-fns/differenceInCalendarMonths";
import differenceInCalendarWeeks from "date-fns/differenceInCalendarWeeks";
import differenceInCalendarYears from "date-fns/differenceInCalendarYears";
import startOfDay from "date-fns/startOfDay";
import startOfWeek from "date-fns/startOfWeek";
import startOfMonth from "date-fns/startOfMonth";
import startOfQuarter from "date-fns/startOfQuarter";
import startOfYear from "date-fns/startOfYear";
import endOfDay from "date-fns/endOfDay";
import endOfWeek from "date-fns/endOfWeek";
import endOfMonth from "date-fns/endOfMonth";
import dfIsEqual from "date-fns/isEqual";
import dfIsSameDay from "date-fns/isSameDay";
import dfIsSameMonth from "date-fns/isSameMonth";
import dfIsSameYear from "date-fns/isSameYear";
import dfIsSameQuarter from "date-fns/isSameQuarter";
import isAfter from "date-fns/isAfter";
import isBefore from "date-fns/isBefore";
import isWithinInterval from "date-fns/isWithinInterval";
import toDate from "date-fns/toDate";
import parse from "date-fns/parse";
import parseISO from "date-fns/parseISO";
import longFormatters from "date-fns/esm/_lib/format/longFormatters";
import { Temporal } from 'proposal-temporal';

export const DEFAULT_YEAR_ITEM_NUMBER = 12;

// This RegExp catches symbols escaped by quotes, and also
// sequences of symbols P, p, and the combinations like `PPPPPPPppppp`
var longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;

// ** Date Constructors **


export function newDate(value) {
  const d = value
    ? typeof value === "string" || value instanceof String
      ? parseISO(value)
      : toDate(value)
    : new Date();
  return isValid(d) ? d : null;
}

export function parseDate(value, dateFormat, locale, strictParsing, timeZone = 'UTC') {
  let parsedDate = null;
  let localeObject = getLocaleObject(locale) || getDefaultLocale();
  let strictParsingValueMatch = true;
  if (Array.isArray(dateFormat)) {
    dateFormat.forEach(df => {
      let tryParseDate = parse(value, df, new Date(), { locale: localeObject });
      if (strictParsing) {
        strictParsingValueMatch =
          isValid(tryParseDate) &&
          value === format(tryParseDate, df, { awareOfUnicodeTokens: true, timeZone });
      }
      if (isValid(tryParseDate) && strictParsingValueMatch) {
        parsedDate = tryParseDate;
      }
    });
    return parsedDate;
  }

  parsedDate = parse(value, dateFormat, new Date(), { locale: localeObject });

  if (strictParsing) {
    strictParsingValueMatch =
      isValid(parsedDate) &&
      value === format(parsedDate, dateFormat, { awareOfUnicodeTokens: true, timeZone });
  } else if (!isValid(parsedDate)) {
    dateFormat = dateFormat
      .match(longFormattingTokensRegExp)
      .map(function(substring) {
        var firstCharacter = substring[0];
        if (firstCharacter === "p" || firstCharacter === "P") {
          var longFormatter = longFormatters[firstCharacter];
          return localeObject
            ? longFormatter(substring, localeObject.formatLong)
            : firstCharacter;
        }
        return substring;
      })
      .join("");

    if (value.length > 0) {
      parsedDate = parse(value, dateFormat.slice(0, value.length), new Date());
    }

    if (!isValid(parsedDate)) {
      parsedDate = new Date(value);
    }
  }

  return isValid(parsedDate) && strictParsingValueMatch ? parsedDate : null;
}

// ** Date "Reflection" **

export { isDate };

export function isValid(date) {
  return isValidDate(date) && isAfter(date, new Date("1/1/1000"));
}

// ** Date Formatting **



export function formatDate(date, formatStr, locale, timeZone) {
  if (locale === "en") {
    return format(date, formatStr, { awareOfUnicodeTokens: true, timeZone });
  }
  let localeObj = getLocaleObject(locale);
  if (locale && !localeObj) {
    console.warn(
      `A locale object was not found for the provided string ["${locale}"].`
    );
  }
  if (
    !localeObj &&
    !!getDefaultLocale() &&
    !!getLocaleObject(getDefaultLocale())
  ) {
    localeObj = getLocaleObject(getDefaultLocale());
  }
  return format(date, formatStr, {
    locale: localeObj ? localeObj : null,
    awareOfUnicodeTokens: true,
    timeZone
  });
}

export function safeDateFormat(date, { dateFormat, locale }, timeZone) {
  return (
    (date &&
      formatDate(
        date,
        Array.isArray(dateFormat) ? dateFormat[0] : dateFormat,
        (locale), timeZone
      )) ||
    ""
  );
}

// ** Date Setters **

export function setTime(date, { hour, minute, second, timeZone = 'UTC', day, year, month }) {
  day = (!isNaN(day)) ? day : date.getDate();
  month = (!isNaN(month)) ? month : (date.getMonth()+1);
  year = (!isNaN(year)) ? year : date.getFullYear();
  hour = (!isNaN(hour)) ? hour : getHours(date, timeZone);
  minute = (!isNaN(minute)) ? minute : getMinutes(date, timeZone);
  second = (!isNaN(second)) ? second : 0;
  return new Date(Temporal.ZonedDateTime.from({ timeZone, year, month, day, hour, minute, second }, { overflow: 'constrain' }).epochMilliseconds);
}

export class _cache {

  static time = new Map();
  static zone = new Map(); 
  
  static getTime(v) {
    return this.time.get(v)
  }

  static getZone(v) { 
    return this.zone.get(v)
  }

  static setTime(v, vv) {
    return this.time.set(v, vv);
  }

  static setZone(v, vv) {
    return this.zone.set(v, vv);
  }

}

// ** Date Getters **

const _convTemp = (date, timeZone = 'UTC') => {

  var _date, _timeZone;
  
  _timeZone = _cache.getZone(timeZone);

  if (!_timeZone) {
    _timeZone = new Temporal.TimeZone(timeZone);
    _cache.setZone(timeZone, _timeZone);
  } 

  _date = _cache.getTime([date, timeZone]);

  if (!_date) {
    if (date === 'today') {
      const now = new Temporal.now.plainDateISO(_timeZone).with({ hour: 0, minute: 0 });
      _date = new Temporal.ZonedDateTime.from(now);
    } else {
      _date = new Temporal.ZonedDateTime(BigInt(date.getTime()*1000000), _timeZone);
    }
    _cache.setTime([date, timeZone], _date);
  }

  return _date;
}

export function getSeconds(date, timeZone) {
  return _convTemp(date, timeZone).second;
}

export function getMinutes(date, timeZone) {
  return _convTemp(date, timeZone).minute;
}

export function getHours(date, timeZone) {
  return _convTemp(date, timeZone).hour;
}

export function getMonth(date, timeZone) {
  return _convTemp(date, timeZone).month;
}

export function getYear(date, timeZone) {
  return _convTemp(date, timeZone).year;
}

export function getDay(date, timeZone) {
  return _convTemp(date, timeZone).dayOfWeek;
}

export function getDate(date, timeZone) {
  return _convTemp(date, timeZone).day;
}

export function getTime(date) {
  return date.getTime();
}

export function setMinutes(date, minutes, timeZone) {
  var zoned = _convTemp(date, timeZone);
  const timeinfo = { 
    timeZone, 
    year: zoned.year, 
    month: zoned.month, 
    day: zoned.day, 
    hour: zoned.hour, 
    minute: minutes, 
  };
  zoned = Temporal.ZonedDateTime.from(timeinfo);
  return new Date(zoned.epochMilliseconds);
}

export function setHours(date, hours, timeZone) {
  var zoned = _convTemp(date, timeZone);
  const timeinfo = { 
    timeZone, 
    year: zoned.year, 
    month: zoned.month, 
    day: zoned.day, 
    hour: hours, 
    minute: zoned.minute, 
  };
  zoned = Temporal.ZonedDateTime.from(timeinfo);
  return new Date(zoned.epochMilliseconds);
}

export function setMonth(date, month, timeZone) {
  var zoned = _convTemp(date, timeZone);
  const timeinfo = { 
    timeZone, 
    year: zoned.year, 
    month: month, 
    day: zoned.day, 
    hour: zoned.hour, 
    minute: zoned.minute, 
  };
  zoned = Temporal.ZonedDateTime.from(timeinfo);
  return new Date(zoned.epochMilliseconds);
}

export function setYear(date, year, timeZone) {
  var zoned = _convTemp(date, timeZone);
  const timeinfo = { 
    timeZone, 
    year: year, 
    month: zoned.month, 
    day: zoned.day, 
    hour: zoned.hour, 
    minute: zoned.minute, 
  };
  zoned = Temporal.ZonedDateTime.from(timeinfo);
  return new Date(zoned.epochMilliseconds);
}

export { getQuarter, setQuarter, setSeconds };

export function getWeek(date, timeZone) {
  return _convTemp(date, timeZone).weekOfYear;
}

export function getDayOfWeekCode(day, locale, timeZone) {
  return formatDate(day, "ddd", (locale), timeZone);
}

// *** Start of ***

export function getStartOfDay(date, timeZone) {
  return _startOf(date, (d) => { return d.startOfDay() }, timeZone);
}

function _startOf(date, fn, timeZone) {
  const startDate = fn(date);
  const timeinfo = { 
    timeZone, 
    year: startDate.getFullYear(), 
    month: startDate.getMonth()+1, 
    day: startDate.getDate(), 
    hour: startDate.getHours(), 
    minute: startDate.getMinutes(), 
  };
  const zoned = Temporal.ZonedDateTime.from(timeinfo);
  return new Date(zoned.epochMilliseconds);
}

export function getStartOfWeek(date, locale, timeZone = 'UTC') {
  let localeObj = locale
    ? getLocaleObject(locale)
    : getLocaleObject(getDefaultLocale());
  const startWeek = startOfWeek(date, { locale: localeObj });
  const timeinfo = { 
    timeZone, 
    year: startWeek.getFullYear(), 
    month: startWeek.getMonth()+1, 
    day: startWeek.getDate(), 
    hour: startWeek.getHours(), 
    minute: startWeek.getMinutes(), 
  };
  const zoned = Temporal.ZonedDateTime.from(timeinfo);
  return new Date(zoned.epochMilliseconds);
}

export function getStartOfMonth(date, timeZone = 'UTC') {
  return _startOf(date, startOfMonth, timeZone);
}

export function getStartOfYear(date, timeZone = 'UTC') {
  return _startOf(date, startOfYear, timeZone);
}

export function getStartOfQuarter(date, timeZone = 'UTC') {
  return _startOf(date, startOfQuarter, timeZone);
}

export function getStartOfToday(timeZone = 'UTC') {
  var todayTemporal = _convTemp('today', timeZone);
  return new Date(zonedToday.epochMilliseconds);
}

// *** End of ***

export function getEndOfWeek(date, timeZone = 'UTC') {
  return _startOf(date, endOfWeek, timeZone);
}

export function getEndOfMonth(date) {
  return _startOf(date, endOfMonth, timeZone = 'UTC');
}

// ** Date Math **

// *** Addition ***

export { addMinutes, addDays, addWeeks, addMonths, addYears };

// *** Subtraction ***

export { addHours, subMinutes, subHours, subDays, subWeeks, subMonths, subYears };

// ** Date Comparison **

export { isBefore, isAfter };

export function isSameYear(date1, date2) {
  if (date1 && date2) {
    return dfIsSameYear(date1, date2);
  } else {
    return !date1 && !date2;
  }
}

export function isSameMonth(date1, date2) {
  if (date1 && date2) {
    return dfIsSameMonth(date1, date2);
  } else {
    return !date1 && !date2;
  }
}

export function isSameQuarter(date1, date2) {
  if (date1 && date2) {
    return dfIsSameQuarter(date1, date2);
  } else {
    return !date1 && !date2;
  }
}

export function isSameDay(date1, date2) {
  if (date1 && date2) {
    return dfIsSameDay(date1, date2);
  } else {
    return !date1 && !date2;
  }
}

export function isEqual(date1, date2) {
  if (date1 && date2) {
    return dfIsEqual(date1, date2);
  } else {
    return !date1 && !date2;
  }
}

export function isDayInRange(day, startDate, endDate) {
  let valid;
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  try {
    valid = isWithinInterval(day, { start, end });
  } catch (err) {
    valid = false;
  }
  return valid;
}

// *** Diffing ***

export function getDaysDiff(date1, date2) {
  return differenceInCalendarDays(date1, date2);
}

// ** Date Localization **

export function registerLocale(localeName, localeData) {
  const scope = typeof window !== "undefined" ? window : global;

  if (!scope.__localeData__) {
    scope.__localeData__ = {};
  }
  scope.__localeData__[localeName] = localeData;
}

export function setDefaultLocale(localeName) {
  const scope = typeof window !== "undefined" ? window : global;

  scope.__localeId__ = localeName;
}

export function getDefaultLocale() {
  const scope = typeof window !== "undefined" ? window : global;

  return scope.__localeId__;
}

export function getLocaleObject(localeSpec) {
  if (typeof localeSpec === "string") {
    // Treat it as a locale name registered by registerLocale
    const scope = typeof window !== "undefined" ? window : global;
    return scope.__localeData__ ? scope.__localeData__[localeSpec] : null;
  } else {
    // Treat it as a raw date-fns locale object
    return localeSpec;
  }
}

export function getFormattedWeekdayInLocale(date, formatFunc, locale, timeZone) {
  return formatFunc(formatDate(date, "EEEE", locale, timeZone));
}

export function getWeekdayMinInLocale(date, locale, timeZone) {
  return formatDate(date, "EEEEEE", locale, timeZone);
}

export function getWeekdayShortInLocale(date, locale, timeZone) {
  return formatDate(date, "EEE", locale, timeZone);
}

export function getMonthInLocale(month, locale, timeZone) {
  return formatDate(setMonth(newDate(), month), "LLLL", locale, timeZone);
}

export function getMonthShortInLocale(month, locale, timeZone) {
  return formatDate(setMonth(newDate(), month), "LLL", locale, timeZone);
}

export function getQuarterShortInLocale(quarter, locale, timeZone) {
  return formatDate(setQuarter(newDate(), quarter), "QQQ", locale, timeZone);
}

// ** Utils for some components **

export function isDayDisabled(
  day,
  { minDate, maxDate, excludeDates, includeDates, filterDate } = {}
) {
  return (
    isOutOfBounds(day, { minDate, maxDate }) ||
    (excludeDates &&
      excludeDates.some(excludeDate => isSameDay(day, excludeDate))) ||
    (includeDates &&
      !includeDates.some(includeDate => isSameDay(day, includeDate))) ||
    (filterDate && !filterDate(newDate(day))) ||
    false
  );
}

export function isDayExcluded(day, { excludeDates } = {}) {
  return (
    (excludeDates &&
      excludeDates.some(excludeDate => isSameDay(day, excludeDate))) ||
    false
  );
}

export function isMonthDisabled(
  month,
  { minDate, maxDate, excludeDates, includeDates, filterDate } = {}
) {
  return (
    isOutOfBounds(month, { minDate, maxDate }) ||
    (excludeDates &&
      excludeDates.some(excludeDate => isSameMonth(month, excludeDate))) ||
    (includeDates &&
      !includeDates.some(includeDate => isSameMonth(month, includeDate))) ||
    (filterDate && !filterDate(newDate(month))) ||
    false
  );
}

export function isMonthinRange(startDate, endDate, m, day) {
  const startDateYear = getYear(startDate);
  const startDateMonth = getMonth(startDate);
  const endDateYear = getYear(endDate);
  const endDateMonth = getMonth(endDate);
  const dayYear = getYear(day);
  if (startDateYear === endDateYear && startDateYear === dayYear) {
    return startDateMonth <= m && m <= endDateMonth;
  } else if (startDateYear < endDateYear) {
    return (
      (dayYear === startDateYear && startDateMonth <= m) ||
      (dayYear === endDateYear && endDateMonth >= m) ||
      (dayYear < endDateYear && dayYear > startDateYear)
    );
  }
}

export function isQuarterDisabled(
  quarter,
  { minDate, maxDate, excludeDates, includeDates, filterDate } = {}
) {
  return (
    isOutOfBounds(quarter, { minDate, maxDate }) ||
    (excludeDates &&
      excludeDates.some(excludeDate => isSameQuarter(quarter, excludeDate))) ||
    (includeDates &&
      !includeDates.some(includeDate => isSameQuarter(quarter, includeDate))) ||
    (filterDate && !filterDate(newDate(quarter))) ||
    false
  );
}

export function isYearDisabled(year, { minDate, maxDate } = {}) {
  const date = new Date(year, 0, 1);
  return isOutOfBounds(date, { minDate, maxDate }) || false;
}

export function isQuarterInRange(startDate, endDate, q, day) {
  const startDateYear = getYear(startDate);
  const startDateQuarter = getQuarter(startDate);
  const endDateYear = getYear(endDate);
  const endDateQuarter = getQuarter(endDate);
  const dayYear = getYear(day);
  if (startDateYear === endDateYear && startDateYear === dayYear) {
    return startDateQuarter <= q && q <= endDateQuarter;
  } else if (startDateYear < endDateYear) {
    return (
      (dayYear === startDateYear && startDateQuarter <= q) ||
      (dayYear === endDateYear && endDateQuarter >= q) ||
      (dayYear < endDateYear && dayYear > startDateYear)
    );
  }
}

export function isOutOfBounds(day, { minDate, maxDate } = {}) {
  return (
    (minDate && differenceInCalendarDays(day, minDate) < 0) ||
    (maxDate && differenceInCalendarDays(day, maxDate) > 0)
  );
}

export function isTimeInList(time, times) {
  return times.some(listTime => (
    getHours(listTime) === getHours(time) &&
    getMinutes(listTime) === getMinutes(time)
  ));
}

export function isTimeDisabled(time, { excludeTimes, includeTimes, filterTime } = {}) {
  return (
    (excludeTimes && isTimeInList(time, excludeTimes)) ||
    (includeTimes && !isTimeInList(time, includeTimes)) ||
    (filterTime && !filterTime(time)) ||
    false
  );
}

export function isTimeInDisabledRange(time, { minTime, maxTime }) {
  if (!minTime || !maxTime) {
    throw new Error("Both minTime and maxTime props required");
  }
  const base = newDate();
  const baseTime = setHours(setMinutes(base, getMinutes(time)), getHours(time));
  const min = setHours(
    setMinutes(base, getMinutes(minTime)),
    getHours(minTime)
  );
  const max = setHours(
    setMinutes(base, getMinutes(maxTime)),
    getHours(maxTime)
  );

  let valid;
  try {
    valid = !isWithinInterval(baseTime, { start: min, end: max });
  } catch (err) {
    valid = false;
  }
  return valid;
}

export function monthDisabledBefore(day, { minDate, includeDates } = {}) {
  const previousMonth = subMonths(day, 1);
  return (
    (minDate && differenceInCalendarMonths(minDate, previousMonth) > 0) ||
    (includeDates &&
      includeDates.every(
        includeDate =>
          differenceInCalendarMonths(includeDate, previousMonth) > 0
      )) ||
    false
  );
}

export function monthDisabledAfter(day, { maxDate, includeDates } = {}) {
  const nextMonth = addMonths(day, 1);
  return (
    (maxDate && differenceInCalendarMonths(nextMonth, maxDate) > 0) ||
    (includeDates &&
      includeDates.every(
        includeDate => differenceInCalendarMonths(nextMonth, includeDate) > 0
      )) ||
    false
  );
}

export function yearDisabledBefore(day, { minDate, includeDates } = {}) {
  const previousYear = subYears(day, 1);
  return (
    (minDate && differenceInCalendarYears(minDate, previousYear) > 0) ||
    (includeDates &&
      includeDates.every(
        includeDate => differenceInCalendarYears(includeDate, previousYear) > 0
      )) ||
    false
  );
}

export function yearsDisabledBefore(day, { minDate, yearItemNumber = DEFAULT_YEAR_ITEM_NUMBER } = {}) {
  const previousYear = getStartOfYear(subYears(day, yearItemNumber));
  const { endPeriod } = getYearsPeriod(previousYear, yearItemNumber);
  const minDateYear = minDate && getYear(minDate);
  return (minDateYear && minDateYear > endPeriod) || false;
}

export function yearDisabledAfter(day, { maxDate, includeDates } = {}) {
  const nextYear = addYears(day, 1);
  return (
    (maxDate && differenceInCalendarYears(nextYear, maxDate) > 0) ||
    (includeDates &&
      includeDates.every(
        includeDate => differenceInCalendarYears(nextYear, includeDate) > 0
      )) ||
    false
  );
}

export function yearsDisabledAfter(day, { maxDate, yearItemNumber = DEFAULT_YEAR_ITEM_NUMBER } = {}) {
  const nextYear = addYears(day, yearItemNumber);
  const { startPeriod } = getYearsPeriod(nextYear, yearItemNumber);
  const maxDateYear = maxDate && getYear(maxDate);
  return (maxDateYear && maxDateYear < startPeriod) || false;
}

export function getEffectiveMinDate({ minDate, includeDates }) {
  if (includeDates && minDate) {
    let minDates = includeDates.filter(
      includeDate => differenceInCalendarDays(includeDate, minDate) >= 0
    );
    return min(minDates);
  } else if (includeDates) {
    return min(includeDates);
  } else {
    return minDate;
  }
}

export function getEffectiveMaxDate({ maxDate, includeDates }) {
  if (includeDates && maxDate) {
    let maxDates = includeDates.filter(
      includeDate => differenceInCalendarDays(includeDate, maxDate) <= 0
    );
    return max(maxDates);
  } else if (includeDates) {
    return max(includeDates);
  } else {
    return maxDate;
  } 
}

export function getHightLightDaysMap(
  highlightDates = [],
  defaultClassName = "react-datepicker__day--highlighted",
  timeZone
) {
  const dateClasses = new Map();
  for (let i = 0, len = highlightDates.length; i < len; i++) {
    const obj = highlightDates[i];
    if (isDate(obj)) {
      const key = formatDate(obj, "MM.dd.yyyy", 'en', timeZone);
      const classNamesArr = dateClasses.get(key) || [];
      if (!classNamesArr.includes(defaultClassName)) {
        classNamesArr.push(defaultClassName);
        dateClasses.set(key, classNamesArr);
      }
    } else if (typeof obj === "object") {
      const keys = Object.keys(obj);
      const className = keys[0];
      const arrOfDates = obj[keys[0]];
      if (typeof className === "string" && arrOfDates.constructor === Array) {
        for (let k = 0, len = arrOfDates.length; k < len; k++) {
          const key = formatDate(arrOfDates[k], "MM.dd.yyyy", 'en', timeZone);
          const classNamesArr = dateClasses.get(key) || [];
          if (!classNamesArr.includes(className)) {
            classNamesArr.push(className);
            dateClasses.set(key, classNamesArr);
          }
        }
      }
    }
  }

  return dateClasses;
}

export function timesToInjectAfter(
  startOfDay,
  currentTime,
  currentMultiplier,
  intervals,
  injectedTimes
) {
  const l = injectedTimes.length;
  const times = [];
  for (let i = 0; i < l; i++) {
    const injectedTime = addMinutes(
      addHours(startOfDay, getHours(injectedTimes[i])),
      getMinutes(injectedTimes[i])
    );
    const nextTime = addMinutes(
      startOfDay,
      (currentMultiplier + 1) * intervals
    );

    if (
      isAfter(injectedTime, currentTime) &&
      isBefore(injectedTime, nextTime)
    ) {
      times.push(injectedTimes[i]);
    }
  }

  return times;
}

export function addZero(i) {
  return i < 10 ? `0${i}` : `${i}`;
}

export function getYearsPeriod(date, yearItemNumber = DEFAULT_YEAR_ITEM_NUMBER) {
  const endPeriod = Math.ceil(getYear(date) / yearItemNumber) * yearItemNumber;
  const startPeriod = endPeriod - (yearItemNumber - 1);
  return { startPeriod, endPeriod };
}
