import { ALL_BOOKS } from "../queries";
import { useQuery } from "@apollo/client/react";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Books = ({ token }) => {
	const [books, setBooks] = useState([]);

	const navigate = useNavigate();

	useEffect(() => {
		if (!token) {
			navigate("/");
		}
	}, [token, navigate]);

	const result = useQuery(ALL_BOOKS);

	console.log(result);

	if (result.loading) {
		return <div>loading...</div>;
	} else if (books.length === 0) {
		setBooks(result.data.allBooks);
	}

	return (
		<div>
			<h2>books</h2>

			<table>
				<tbody>
					<tr>
						<th></th>
						<th>author</th>
						<th>published</th>
					</tr>
					{books.map((a) => (
						<tr key={a.title}>
							<td>{a.title}</td>
							<td>{a.author.name}</td>
							<td>{a.published}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default Books;
