const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const Author = require("./models/author");
const Book = require("./models/book");
const User = require("./models/user");
const { GraphQLError } = require("graphql");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log("connecting to", MONGODB_URI);

mongoose
	.connect(MONGODB_URI)
	.then(() => {
		console.log("connected to MongoDB");
	})
	.catch((error) => {
		console.log("error connecting to MongoDB:", error.message);
	});

const typeDefs = `
  type Author {
    name: String!,
    born: Int,
    bookCount: Int!
    id: ID!
  }

  type Book {
    title: String!,
    published: Int!,
    author: Author!,
    genres: [String!],
    id: ID!
  }

  type User {
    username: String!,
    favoriteGenre:String!,
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!,
    authorCount: Int!,
    allBooks(author: String, genre: String): [Book!],
    allAuthors: [Author!],
    me: User
  }

  type Mutation {
    addBook(
      title: String!,
      author: String!,
      published: Int!,
      genres: [String!]
    ): Book!,
    editAuthor(name: String!, setBornTo: Int!): Author,
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
    username: String!
    password: String!
    ): Token
  }
`;

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
			const books = await Book.find({});
			const author = await Author.findOne({ name: args.author });

			let newBooks = author
				? books.filter((b) => b.author.equals(author._id))
				: books;
			return args.genre
				? newBooks.filter((b) => b.genres.includes(args.genre))
				: newBooks;
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
		bookCount: async (root) => {
			const books = await Book.find({});
			return books.filter((b) => (b.author._id.toString() !== root.id ? null : b))
				.length;
		},
	},
	Book: {
		author: async (root) => {
			const author = await Author.findOne({ _id: root.author._id.toString() });
			return author;
		},
	},
};

const server = new ApolloServer({
	typeDefs,
	resolvers,
});

startStandaloneServer(server, {
	listen: { port: 4000 },
	context: async ({ req, res }) => {
		const auth = req ? req.headers.authorization : null;
		if (auth && auth.startsWith("Bearer ")) {
			const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET);
			const currentUser = await User.findById(decodedToken.id);
			return { currentUser };
		}
	},
}).then(({ url }) => {
	console.log(`Server ready at ${url}`);
});
