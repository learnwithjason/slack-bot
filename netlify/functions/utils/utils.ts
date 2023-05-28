export const getRandomNumber = (upperCount) => {
  return Math.floor(Math.random() * upperCount);
};

export const getItalizedString = (string) => {
  if (!!string) {
    return "_" + string.split("\n").join("_\n_") + "_";
  } else {
    return "";
  }
};
