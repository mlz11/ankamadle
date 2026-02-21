import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./components/App";

export async function prerender() {
	const html = renderToString(
		<StrictMode>
			<App />
		</StrictMode>,
	);
	return { html };
}
