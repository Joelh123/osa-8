import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import { Link, Route, Routes } from "react-router-dom";

const App = () => {
	const padding = {
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
				<Link style={padding} to="/add">
					add book
				</Link>
			</div>

			<Routes>
				<Route path="/authors" element={<Authors />} />
				<Route path="/books" element={<Books />} />
				<Route path="/add" element={<NewBook />} />
				<Route path="/" element={<Authors />} />
			</Routes>
		</div>
	);
};

export default App;
