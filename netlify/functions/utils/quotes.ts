import data from "../data/motivationalQuotes.json";

export const getRandomQuote = () => {
  console.log(`data: ${JSON.stringify(data)}`);
  console.log(data[1]);

  var randomQuote = data[Math.floor(Math.random() * (data.length - 1))];

  return randomQuote;
};
