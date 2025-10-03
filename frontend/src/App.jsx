import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Login from "./components/Login";
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useApolloClient, useQuery } from "@apollo/client/react";
import Recommendations from "./components/Recommendations";

const App = () => {
	const [token, setToken] = useState(() =>
		localStorage.getItem("bookapp-user-token")
	);
	const client = useApolloClient();

	const navigate = useNavigate();

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
