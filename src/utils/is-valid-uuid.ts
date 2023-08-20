export const isValidUUIDv4 = (uuid: string) => {
	// check id is uuid v4
	const regexExp = new RegExp('([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})');
	return regexExp.test(uuid);
};
