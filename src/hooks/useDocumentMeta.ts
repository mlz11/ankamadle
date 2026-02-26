import { useEffect } from "react";

interface DocumentMeta {
	title: string;
	description: string;
	canonicalUrl: string;
	ogTitle?: string;
	ogDescription?: string;
}

export function useDocumentMeta(meta: DocumentMeta) {
	useEffect(() => {
		document.title = meta.title;

		const ogTitle = meta.ogTitle ?? meta.title;
		const ogDescription = meta.ogDescription ?? meta.description;

		setMetaContent("description", meta.description);
		setMetaProperty("og:title", ogTitle);
		setMetaProperty("og:description", ogDescription);
		setMetaProperty("og:url", meta.canonicalUrl);
		setMetaContent("twitter:title", ogTitle);
		setMetaContent("twitter:description", ogDescription);
		setLinkHref("canonical", meta.canonicalUrl);
	}, [
		meta.title,
		meta.description,
		meta.canonicalUrl,
		meta.ogTitle,
		meta.ogDescription,
	]);
}

function setMetaContent(name: string, content: string) {
	const el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
	if (el) el.content = content;
}

function setMetaProperty(property: string, content: string) {
	const el = document.querySelector<HTMLMetaElement>(
		`meta[property="${property}"]`,
	);
	if (el) el.content = content;
}

function setLinkHref(rel: string, href: string) {
	const el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
	if (el) el.href = href;
}
