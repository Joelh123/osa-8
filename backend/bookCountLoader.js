const DataLoader = require("dataloader");
const Book = require("./models/book");

const createBookCountLoader = () =>
	new DataLoader(async (authorIds) => {
		const counts = await Book.aggregate([
			{ $match: { author: { $in: authorIds } } },
			{ $group: { _id: "$author", count: { $sum: 1 } } },
		]);
		const countMap = {};
		counts.forEach((c) => {
			countMap[c._id.toString()] = c.count;
		});
		const result = authorIds.map((id) => countMap[id.toString()] || 0);
		return result;
	});

module.exports = createBookCountLoader;
