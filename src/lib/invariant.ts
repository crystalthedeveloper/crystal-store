export class InvariantError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "InvariantError";
	}
}

type InvariantMessage = string | (() => string);

const resolveInvariantMessage = (message: InvariantMessage): string =>
	typeof message === "function" ? message() : message;

export function invariant(condition: unknown, message: InvariantMessage): asserts condition {
	if (condition) return;

	throw new InvariantError(resolveInvariantMessage(message));
}
