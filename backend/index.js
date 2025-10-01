const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { v1: uuid } = require("uuid");
const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const Author = require("./models/author");
const Book = require("./models/book");
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

  type Query {
    bookCount: Int!,
    authorCount: Int!,
    allBooks(author: String, genre: String): [Book!],
    allAuthors: [Author!]
  }

  type Mutation {
    addBook(
      title: String!,
      author: String!,
      published: Int!,
      genres: [String!]
    ): Book!,
    editAuthor(name: String!, setBornTo: Int!): Author
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
	},
	Mutation: {
		addBook: async (root, args) => {
			const existingAuthor = await Author.findOne({ name: args.author });
			let authorId;

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
		editAuthor: async (root, args) => {
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
	},
	Author: {
		bookCount: async (root) => {
			const books = await Book.find({});
			return books.filter((b) => (b.author !== root.name ? null : b)).length;
		},
	},
};

const server = new ApolloServer({
	typeDefs,
	resolvers,
});

startStandaloneServer(server, {
	listen: { port: 4000 },
}).then(({ url }) => {
	console.log(`Server ready at ${url}`);
});
