import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Login from "./components/Login";
import { Link, Route, Routes } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import { useApolloClient } from "@apollo/client/react";

const App = () => {
	const [token, setToken] = useState(() =>
		localStorage.getItem("bookapp-user-token")
	);
	const client = useApolloClient();

	const logOut = () => {
		setToken(null);
		localStorage.clear();
		client.resetStore();
	};

	const padding = {
		paddingRight: 5,
	};

	const show = {
		display: token ? "block" : "none",
	};

	return (
		<div>
			<div style={show}>
				<Link style={padding} to="/authors">
					authors
				</Link>
				<Link style={padding} to="/books">
					books
				</Link>
				<Link style={padding} to="/add">
					add book
				</Link>
				<button onClick={() => logOut()}>Log out</button>
			</div>

			<Routes>
				<Route path="/authors" element={<Authors token={token} />} />
				<Route path="/books" element={<Books token={token} />} />
				<Route path="/add" element={<NewBook token={token} />} />
				<Route path="/" element={<Login token={token} setToken={setToken} />} />
			</Routes>
		</div>
	);
};

export default App;
