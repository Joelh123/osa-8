import { ALL_BOOKS } from "../queries";
import { useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";
import { ME } from "../queries";
import { useNavigate } from "react-router-dom";

const Recommendations = ({ token }) => {
	const [favoriteGenre, setFavoriteGenre] = useState(null);
	const currentUser = useQuery(ME);
	const navigate = useNavigate();

	useEffect(() => {
		if (!token) {
			navigate("/");
		}
		if (!currentUser.loading) {
			setFavoriteGenre(currentUser.data.me.favoriteGenre);
		}
	}, [currentUser.loading, token, navigate]);

	const result = useQuery(ALL_BOOKS, {
		variables: {
			genre: favoriteGenre,
		},
		skip: !favoriteGenre,
	});

	const books = result.data?.allBooks || [];

	if (result.loading || currentUser.loading) {
		return <div>loading...</div>;
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
		</div>
	);
};

export default Recommendations;
