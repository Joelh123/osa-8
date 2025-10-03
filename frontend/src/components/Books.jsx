import { ALL_BOOKS } from "../queries";
import { useQuery } from "@apollo/client/react";
import { useState } from "react";

const Books = () => {
	const [books, setBooks] = useState([]);

	const result = useQuery(ALL_BOOKS);

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
