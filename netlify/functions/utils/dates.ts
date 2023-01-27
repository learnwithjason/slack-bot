// Convert provided date object into a YYYY-MM-DD format. Note: if no date
// object is passed in, uses todays date as default
export const getFormattedDateYYYYMMDD = (date) => {
  let actualDate = date ? new Date(date) : new Date();
  const offset = actualDate.getTimezoneOffset();
  actualDate = new Date(actualDate.getTime() - offset * 60 * 1000);
  return actualDate.toISOString().split("T")[0];
};

export const convertYYYYMMDDToTimestamp = (date) => {
  return new Date(date).getTime();
};

export const convertTimestampToYYYYMMDD = (timestamp) => {
  var parsedTimestamp = new Date(timestamp);
  return parsedTimestamp.toString().slice(0, 15);
};

export const getTodaysDateAsTimestamp = () => {
  return new Date().getTime();
};
