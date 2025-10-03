import { ALL_BOOKS } from "../queries";
import { useQuery } from "@apollo/client/react";
import { useState } from "react";

const Books = () => {
	const [genres, setGenres] = useState([]);
	const [genre, setGenre] = useState(null);

	const result = useQuery(ALL_BOOKS, {
		variables: {
			genre: genre,
		},
	});

	const books = result.data?.allBooks || [];

	if (result.loading) {
		return <div>loading...</div>;
	}

	const rowStyle = {
		paddingRight: 10,
	};

	const selectStyle = {
		paddingTop: 30,
		fontSize: 20,
	};

	return (
		<div>
			<h2>books</h2>
			{genre ? (
				<p>
					in genre <b>{genre}</b>
				</p>
			) : null}
			<table>
				<tbody>
					<tr>
						<th style={rowStyle}></th>
						<th style={rowStyle}>author</th>
						<th style={rowStyle}>published</th>
					</tr>
					{books.map((b) => {
						if (b.genres) {
							b.genres.map((g) =>
								genres.includes(g) ? g : setGenres(genres.concat(g))
							);
						}

						return (
							<tr key={b.title}>
								<td style={rowStyle}>{b.title}</td>
								<td style={rowStyle}>{b.author.name}</td>
								<td style={rowStyle}>{b.published}</td>
							</tr>
						);
					})}
				</tbody>
			</table>
			<div style={selectStyle}>
				select genre:
				<select
					onChange={({ target }) => setGenre(target.value)}
					defaultValue={genre}
				>
					<option value={null}></option>
					{genres.map((g) => (
						<option key={g} value={g}>
							{g}
						</option>
					))}
				</select>
			</div>
		</div>
	);
};

export default Books;
