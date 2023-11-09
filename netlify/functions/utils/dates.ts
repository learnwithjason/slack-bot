// Convert provided date object into a YYYY-MM-DD format. Note: if no date
// object is passed in, uses todays date as default
export const getFormattedDateYYYYMMDD = (date) => {
  let actualDate = date ? new Date(date) : new Date();
  const offset = actualDate.getTimezoneOffset();
  actualDate = new Date(actualDate.getTime() - offset * 60 * 1000);
  return actualDate.toISOString().split("T")[0];
};

export const convertYYYYMMDDToTimestamp = (date) => {
  if (!date) {
    return getTodaysDateAsTimestamp();
  }

  // input: 2023-04-29
  let dateObj = date.split("-");
  let year = dateObj[0];
  let month = dateObj[1] - 1;
  let day = dateObj[2];

  return new Date(year, month, day).getTime();
};

export const convertTimestampToYYYYMMDD = (timestamp) => {
  var parsedTimestamp = new Date(timestamp);
  return parsedTimestamp.toString().slice(0, 15);
};

export const getTodaysDateAsTimestamp = () => {
  let today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth();
  let day = today.getDate();
  return new Date(year, month, day).getTime();
};

export const getTodaysDateAsYYYYMMDDWithDashes = () => {
  let today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth() + 1;
  let day = today.getDate();
  return `${year}-${month}-${day}`;
};

export const getTodaysDay = () => {
  return new Date().getDay();
};
