export const capitalizeFirstLetterOfEachWord = (str: string | undefined) => {
    return str?.replace(/\b\w/g, function (char) {
      return char.toUpperCase();
    });
  }