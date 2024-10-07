export const formatStringDisplayName = (str: string) => {
	return str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  };