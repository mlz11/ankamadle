import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import App from "./components/App";

export async function prerender(data: { url: string }) {
	const url = data.url || "/";

	const html = renderToString(
		<StrictMode>
			<StaticRouter location={url}>
				<App />
			</StaticRouter>
		</StrictMode>,
	);

	return {
		html,
		links: new Set(["/", "/classique", "/silhouette"]),
	};
}
