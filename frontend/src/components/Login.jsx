import { useMutation } from "@apollo/client/react";
import { useState, useEffect } from "react";
import { LOGIN } from "../queries";
import { useNavigate } from "react-router-dom";

const Login = ({ token, setToken }) => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const navigate = useNavigate();

	useEffect(() => {
		if (token) {
			navigate("/books");
		}
	}, [token, navigate]);

	const [login, result] = useMutation(LOGIN, {
		onError: (error) => {
			console.log(error.graphQLErrors[0].message);
		},
	});

	useEffect(() => {
		if (result.data) {
			const token = result.data.login.value;
			setToken(token);
			localStorage.setItem("bookapp-user-token", token);
		}
	}, [result.data]);

	const handleSubmit = (e) => {
		e.preventDefault();

		login({ variables: { username, password } });
	};

	return (
		<>
			<form onSubmit={handleSubmit}>
				<div>
					username
					<input
						type="text"
						value={username}
						onChange={({ target }) => setUsername(target.value)}
					/>
				</div>
				<div>
					password
					<input
						type="password"
						value={password}
						onChange={({ target }) => setPassword(target.value)}
					/>
				</div>
				<button type="submit">login</button>
			</form>
		</>
	);
};

export default Login;
