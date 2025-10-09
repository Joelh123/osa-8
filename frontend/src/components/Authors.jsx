import { useState } from "react";
import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries";
import { useQuery, useMutation } from "@apollo/client/react";

const Authors = ({ token }) => {
	const [name, setName] = useState("");
	const [born, setBorn] = useState("");

	const result = useQuery(ALL_AUTHORS);

	const [editAuthor] = useMutation(EDIT_AUTHOR);

	const handleSubmit = (event) => {
		event.preventDefault();

		editAuthor({ variables: { name, setBornTo: born } });

		setBorn("");
		setName("");
	};

	const authors = result.data?.allAuthors || [];

	if (result.loading) {
		return <div>loading...</div>;
	}

	const show = {
		display: token ? "" : "none",
	};

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
			<div style={show}>
				<h3>Set birthyear</h3>
				<form onSubmit={handleSubmit}>
					<div>
						name
						<select value={name} onChange={({ target }) => setName(target.value)}>
							<option></option>
							{authors.map((a) => (
								<option key={a.name}>{a.name}</option>
							))}
						</select>
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
		</div>
	);
};

export default Authors;
