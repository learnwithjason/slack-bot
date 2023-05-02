export const getRandomNumber = (upperCount) => {
  return Math.floor(Math.random() * upperCount);
};

export const getItalizedString = (string) => {
  return "_" + string.split("\n").join("_\n_") + "_";
};
