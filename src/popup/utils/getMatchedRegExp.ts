const escapeRegExp = (text: string) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

export const getMatchedRegExp = (text: string, indices: [number, number][]) => {
  return new RegExp(
    Array.from(
      new Set(
        indices.map(([start, end]) => {
          return escapeRegExp(text.substring(start, end + 1));
        })
      )
    ).join("|")
  );
};
