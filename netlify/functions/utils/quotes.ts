import data from "../data/motivationalQuotes.json";
import { getRandomNumber } from "./utils";

export const getRandomQuote = () => {
  var randomQuote = data[getRandomNumber(data.length)];

  return randomQuote;
};
