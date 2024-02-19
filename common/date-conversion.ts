// eslint-disable-next-line import/named
import moment, {Moment} from 'moment';
import {assert, assertIsDefined} from '~/common/assertions';

export const ISO_DATE_FORMAT: string = 'YYYY-MM-DD';
export const ISO_TIME_FORMAT: string = 'HH:mm:ss';
export const HHMM_TIME_FORMAT: string = 'HH:mm';

export function dateToISOString(date: Moment): string {
  assert(date.isValid());
  return date.format(ISO_DATE_FORMAT);
}

export function isoStringToDate(isoString: string): Moment {
  const date = moment(isoString, [ISO_DATE_FORMAT], true);
  assert(date.isValid());
  return date;
}

export function timeToTimeString(time: Moment, timeFormat: string = ISO_TIME_FORMAT): string {
  assert(time.isValid());
  return time.format(timeFormat);
}

export function timeToISOString(time: Moment): string {
  return timeToTimeString(time, ISO_TIME_FORMAT);
}

export function isoStringToTime(isoString: string): Moment {
  const time = moment(isoString, [ISO_TIME_FORMAT], true);
  assert(time.isValid());
  return time;
}

export function dateTimeToIsoString(dateTime: Moment): string {
  assert(dateTime.isValid());
  return dateTime.toISOString();
}

const DATE_TIME_WITHOUT_TZ_ISO_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

export function dateTimeWithoutTZToIsoString(dateTime: Moment): string {
  assert(dateTime.isValid());
  return dateTime.format(DATE_TIME_WITHOUT_TZ_ISO_FORMAT);
}

export function isoStringToDateTime(isoString: string): Moment {
  const datetime = moment(isoString, moment.ISO_8601, true);
  assert(datetime.isValid());
  return datetime;
}

export function isoStringToDateTimeWithoutTZ(isoString: string): Moment {
  let sliceEndPos = isoString.indexOf('Z');
  if (sliceEndPos < 0) {
    sliceEndPos = isoString.indexOf('+');
    if (sliceEndPos < 0) {
      sliceEndPos = isoString.indexOf('-');
    }
  }
  const stringWithoutTZ = sliceEndPos < 0 ? isoString : isoString.slice(0, sliceEndPos);
  const datetime = moment(stringWithoutTZ, moment.ISO_8601, true);
  assert(datetime.isValid());
  return datetime;
}

export const LONG_DATE_FORMAT: string = 'DD.MM.YYYY';
export const SHORT_DATE_FORMAT: string = 'DD.MM.YY';

export function tryDateStringToDate(dateString: string): Moment | undefined {
  const date = moment(dateString, [LONG_DATE_FORMAT, SHORT_DATE_FORMAT], true);
  if (date.isValid()) {
    return date;
  }
}

export function dateStringToDate(dateString: string): Moment {
  const date = tryDateStringToDate(dateString);
  assertIsDefined(date);
  return date;
}

const DATE_TIME_FORMAT = 'DD.MM.YYYY HH:mm:ss';

function convertToISOFormat(dateTimeString: string) {
  const normDateTimeString = dateTimeString.trim().replace(/  +/g, ' ');
  const dtStringElemsArray = normDateTimeString.split(' ');
  const dateElemsArray = dtStringElemsArray[0].split('.');
  if (dateElemsArray.length !== 3) {
    return normDateTimeString;
  }
  const isoDate = `${dateElemsArray[2]}-${dateElemsArray[1]}-${dateElemsArray[0]}`;
  if (dtStringElemsArray.length < 2 || dtStringElemsArray[1] === '') {
    return isoDate;
  }
  return `${isoDate}T${dtStringElemsArray[1]}`;
}

export function tryDateTimeStringToDTime(dateTimeString: string): Moment | undefined {
  const dateTime = moment(convertToISOFormat(dateTimeString), moment.ISO_8601, true);
  if (dateTime.isValid()) {
    return dateTime;
  }
}

export function dateTimeStringToDTime(dateTimeString: string): Moment {
  const dateTime = tryDateTimeStringToDTime(dateTimeString);
  assertIsDefined(dateTime, `Неверный формат даты-времени, ожидается "${DATE_TIME_FORMAT}"`);
  return dateTime;
}

export function dateTimeToDateTimeString(dateTime: Moment): string {
  assert(dateTime.isValid());
  return dateTime.format(DATE_TIME_FORMAT);
}

export function dateToDateString(date: Moment): string {
  assert(date.isValid());
  return date.format(LONG_DATE_FORMAT);
}

export function tryTimeStringToTime(timeString: string, timeFormat: string = ISO_TIME_FORMAT): Moment | undefined {
  const time = moment(timeString, timeFormat, true);
  if (time.isValid()) {
    return time;
  }
}

export function timeStringToTime(timeString: string, timeFormat: string = ISO_TIME_FORMAT): Moment {
  const time = tryTimeStringToTime(timeString, timeFormat);
  assertIsDefined(time, `Неверный формат времени, ожидается "${timeFormat}"`);
  return time;
}

export function nowDateTime(): Moment {
  return moment();
}
