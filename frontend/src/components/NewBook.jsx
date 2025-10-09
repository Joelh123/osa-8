import { useState } from "react";
import { ALL_BOOKS, CREATE_BOOK } from "../queries";
import { useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { updateCache } from "../App";

const NewBook = ({ token }) => {
	const [title, setTitle] = useState("");
	const [author, setAuthor] = useState("");
	const [published, setPublished] = useState("");
	const [genre, setGenre] = useState("");
	const [genres, setGenres] = useState([]);

	const navigate = useNavigate();

	useEffect(() => {
		if (!token) {
			navigate("/");
		}
	}, [token, navigate]);

	const [createBook] = useMutation(CREATE_BOOK, {
		onError: (error) => {
			console.log(error.graphQLErrors.map((e) => e.message).join("\n"));
		},
		update: (cache, response) => {
			updateCache(cache, { query: ALL_BOOKS }, response.data.addBook);
		},
	});

	const submit = async (event) => {
		event.preventDefault();

		createBook({
			variables: {
				title,
				author,
				published,
				genres: genres.length > 0 ? genres : null,
			},
		});

		setTitle("");
		setPublished("");
		setAuthor("");
		setGenres([]);
		setGenre("");
	};

	const addGenre = () => {
		setGenres(genres.concat(genre));
		setGenre("");
	};

	return (
		<div>
			<form onSubmit={submit}>
				<div>
					title
					<input value={title} onChange={({ target }) => setTitle(target.value)} />
				</div>
				<div>
					author
					<input value={author} onChange={({ target }) => setAuthor(target.value)} />
				</div>
				<div>
					published
					<input
						type="number"
						value={published}
						onChange={({ target }) => setPublished(parseInt(target.value))}
					/>
				</div>
				<div>
					<input value={genre} onChange={({ target }) => setGenre(target.value)} />
					<button onClick={addGenre} type="button">
						add genre
					</button>
				</div>
				<div>genres: {genres.join(" ")}</div>
				<button type="submit">create book</button>
			</form>
		</div>
	);
};

export default NewBook;
