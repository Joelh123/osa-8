import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter as Router } from "react-router-dom";
import { ApolloProvider } from "@apollo/client/react";
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

// import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client/react";

const httpLink = new HttpLink({
	uri: "http://localhost:4000",
});

const cache = new InMemoryCache();

const client = new ApolloClient({
	cache: cache,
	link: httpLink,
});

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<ApolloProvider client={client}>
			<Router>
				<App />
			</Router>
		</ApolloProvider>
	</React.StrictMode>
);
