import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Login from "./components/Login";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useApolloClient, useSubscription } from "@apollo/client/react";
import Recommendations from "./components/Recommendations";
import { BOOK_ADDED, ALL_BOOKS } from "./queries";

export const updateCache = (cache, query, addedBook) => {
	const uniqByTitle = (a) => {
		let seen = new Set();
		return a.filter((item) => {
			let k = item.title;
			return seen.has(k) ? false : seen.add(k);
		});
	};

	cache.updateQuery(query, ({ allBooks }) => {
		return {
			allBooks: uniqByTitle(allBooks.concat(addedBook)),
		};
	});
};

const App = () => {
	const [token, setToken] = useState(() =>
		localStorage.getItem("bookapp-user-token")
	);
	const client = useApolloClient();

	const navigate = useNavigate();

	useSubscription(BOOK_ADDED, {
		onData: ({ data, client }) => {
			const addedBook = data.data.bookAdded;
			window.alert(`${addedBook.title} added`);

			updateCache(
				client.cache,
				{ query: ALL_BOOKS, variables: { genre: null } },
				addedBook
			);
		},
	});

	const logOut = () => {
		setToken(null);
		localStorage.clear();
		client.resetStore();
	};

	const padding = {
		paddingRight: 5,
	};

	const show = {
		display: token ? "" : "none",
		paddingRight: 5,
	};

	return (
		<div>
			<div>
				<Link style={padding} to="/authors">
					authors
				</Link>
				<Link style={padding} to="/books">
					books
				</Link>
				<Link style={show} to="/add">
					add book
				</Link>
				<Link style={show} to="/recommendations">
					recommend
				</Link>
				{token ? (
					<button onClick={() => logOut()}>Log out</button>
				) : (
					<button onClick={() => navigate("/")}>Log in</button>
				)}
			</div>

			<Routes>
				<Route path="/authors" element={<Authors token={token} />} />
				<Route path="/books" element={<Books token={token} />} />
				<Route path="/add" element={<NewBook token={token} />} />
				<Route
					path="/recommendations"
					element={<Recommendations token={token} />}
				/>
				<Route path="/" element={<Login token={token} setToken={setToken} />} />
			</Routes>
		</div>
	);
};

export default App;
