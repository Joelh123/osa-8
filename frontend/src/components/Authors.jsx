import { useState } from "react";
import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries";
import { useQuery, useMutation } from "@apollo/client/react";

const Authors = () => {
	const [name, setName] = useState("");
	const [born, setBorn] = useState("");

	const result = useQuery(ALL_AUTHORS);

	const [editAuthor] = useMutation(EDIT_AUTHOR);

	const handleSubmit = () => {
		console.log(name);
		console.log(born);
		editAuthor({ variables: { name, setBornTo: born } });

		setBorn("");
		setName("");
	};

	if (result.loading) return <div>loading...</div>;

	const authors = result.data.allAuthors;

	return (
		<div>
			<h2>authors</h2>
			<table>
				<tbody>
					<tr>
						<th></th>
						<th>born</th>
						<th>books</th>
					</tr>
					{authors.map((a) => (
						<tr key={a.name}>
							<td>{a.name}</td>
							<td>{a.born}</td>
							<td>{a.bookCount}</td>
						</tr>
					))}
				</tbody>
			</table>
			<h3>Set birthyear</h3>
			<form onSubmit={handleSubmit}>
				<div>
					name
					<input value={name} onChange={({ target }) => setName(target.value)} />
				</div>
				<div>
					born
					<input
						value={born}
						onChange={({ target }) => setBorn(parseInt(target.value))}
					/>
				</div>
				<button type="submit">update author</button>
			</form>
		</div>
	);
};

export default Authors;
