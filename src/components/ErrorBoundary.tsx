import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
	fallback: ReactNode;
	children: ReactNode;
}

interface State {
	hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
	state: State = { hasError: false };

	static getDerivedStateFromError(): State {
		return { hasError: true };
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		import("@sentry/react").then((Sentry) => {
			Sentry.captureException(error, {
				extra: { componentStack: info.componentStack },
			});
		});
	}

	render() {
		if (this.state.hasError) return this.props.fallback;
		return this.props.children;
	}
}
