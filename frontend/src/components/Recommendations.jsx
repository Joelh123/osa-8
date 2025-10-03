import { ALL_BOOKS } from "../queries";
import { useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";
import { ME } from "../queries";
import { useNavigate } from "react-router-dom";

const Recommendations = ({ token, favoriteGenre, setFavoriteGenre }) => {
	const [books, setBooks] = useState([]);

	const currentUser = useQuery(ME);

	const navigate = useNavigate();

	useEffect(() => {
		if (!token) {
			navigate("/");
		}
		if (!currentUser.loading) {
			setFavoriteGenre(currentUser.data.me.favoriteGenre);
		}
	}, [currentUser, token, navigate]);

	const result = useQuery(ALL_BOOKS, {
		variables: {
			favoriteGenre,
		},
	});

	if (result.loading) {
		return <div>loading...</div>;
	} else if (books.length === 0) {
		setBooks(result.data.allBooks);
	}

	const rowStyle = {
		paddingRight: 10,
	};

	return (
		<div>
			<h2>recommendations</h2>
			<p>
				books in your favorite genre <b>{favoriteGenre}</b>
			</p>
			<table>
				<tbody>
					<tr>
						<th style={rowStyle}></th>
						<th style={rowStyle}>author</th>
						<th style={rowStyle}>published</th>
					</tr>
					{books.map((b) => {
						if (b.genres.includes(favoriteGenre)) {
							return (
								<tr key={b.title}>
									<td style={rowStyle}>{b.title}</td>
									<td style={rowStyle}>{b.author.name}</td>
									<td style={rowStyle}>{b.published}</td>
								</tr>
							);
						}
					})}
				</tbody>
			</table>
		</div>
	);
};

export default Recommendations;
