const { GraphQLError } = require("graphql");
const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();
const jwt = require("jsonwebtoken");
const Author = require("./models/author");
const Book = require("./models/book");
const User = require("./models/user");

const resolvers = {
	Query: {
		bookCount: async () => {
			const books = await Book.find({});
			return books.length;
		},
		authorCount: async () => {
			const authors = await Author.find({});
			return authors.length;
		},
		allBooks: async (root, args) => {
			const books = await Book.find({}).populate("author");
			const author = await Author.findOne({ name: args.author });

			let newBooks = author
				? books.filter((b) => b.author.equals(author._id))
				: books;

			const result = args.genre
				? newBooks.filter((b) => b.genres.includes(args.genre))
				: newBooks;
			return result;
		},
		allAuthors: async () => await Author.find({}),
		me: (root, args, context) => {
			return context.currentUser;
		},
	},
	Mutation: {
		addBook: async (root, args, context) => {
			const existingAuthor = await Author.findOne({ name: args.author });
			let authorId;

			if (!context.currentUser) {
				throw new GraphQLError("not authenticated", {
					extensions: {
						code: "BAD_USER_INPUT",
					},
				});
			}

			if (!existingAuthor) {
				const newAuthor = new Author({ name: args.author });
				try {
					await newAuthor.save();
				} catch (error) {
					throw new GraphQLError("Saving author failed", {
						extensions: {
							error,
						},
					});
				}
				authorId = newAuthor._id;
			} else {
				authorId = existingAuthor._id;
			}

			const book = new Book({
				...args,
				author: authorId,
			});
			try {
				await book.save();
			} catch (error) {
				throw new GraphQLError("Saving book failed", {
					extensions: {
						code: "BAD_USER_INPUT",
						invalidArgs: args.title,
						error,
					},
				});
			}

			const populatedBook = await Book.findById(book._id).populate("author");
			pubsub.publish("BOOK_ADDED", { bookAdded: populatedBook });

			return Book.findById(book._id).populate("author");
		},
		editAuthor: async (root, args, context) => {
			if (!context.currentUser) {
				throw new GraphQLError("not authenticated", {
					extensions: {
						code: "BAD_USER_INPUT",
					},
				});
			}

			try {
				await Author.updateOne({ name: args.name }, { born: args.setBornTo });
			} catch (error) {
				throw new GraphQLError("Editing author failed", {
					extensions: {
						code: "BAD_USER_INPUT",
						invalidArgs: args.name,
						error,
					},
				});
			}
			const updatedAuthor = await Author.findOne({ name: args.name });
			return updatedAuthor;
		},
		createUser: async (root, args) => {
			const user = new User({
				username: args.username,
				favoriteGenre: args.favoriteGenre,
			});

			return user.save().catch((error) => {
				throw new GraphQLError("Creating the user failed", {
					extensions: {
						code: "BAD_USER_INPUT",
						invalidArgs: args.username,
						error,
					},
				});
			});
		},
		login: async (root, args) => {
			const user = await User.findOne({ username: args.username });

			if (!user || args.password !== "secret") {
				throw new GraphQLError("wrong credentials", {
					extensions: {
						code: "BAD_USER_INPUT",
					},
				});
			}

			const userForToken = {
				username: user.username,
				id: user._id,
			};

			return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
		},
	},
	Author: {
		bookCount: async (root, args, context) => {
			return context.bookCountLoader.load(root._id);
		},
	},
	Subscription: {
		bookAdded: {
			subscribe: () => pubsub.asyncIterableIterator("BOOK_ADDED"),
		},
	},
};

module.exports = resolvers;
