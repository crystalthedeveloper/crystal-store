// src/lib/utils.ts

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { invariant } from "@/lib/invariant";

export const isDefined = <T>(value: T | null | undefined): value is T =>
	value !== null && value !== undefined;

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const safeJsonParse = (str: string | null | undefined): unknown => {
	if (!str) return null;
	try {
		return JSON.parse(str);
	} catch {
		return null;
	}
};

type PromiseToTupleResult<T> = [Error, null] | [null, Awaited<T>];
export const unpackPromise = async <T extends Promise<unknown>>(
	promise: T,
): Promise<PromiseToTupleResult<T>> => {
	try {
		const result = await promise;
		return [null, result];
	} catch (maybeError) {
		const error = maybeError instanceof Error ? maybeError : new Error(String(maybeError));
		return [error, null];
	}
};

export const stringToInt = (str: string | number | null | undefined): number => {
	if (str == null) return 0;
	if (typeof str === "number") return str;
	const parsed = Number.parseInt(str, 10);
	return Number.isNaN(parsed) ? 0 : parsed;
};

type CardinalWords = Partial<Record<Intl.LDMLPluralRule, string>> & {
	other: string;
};
export const pluralize = (count: number, words: CardinalWords) => {
	const rule = new Intl.PluralRules("en-US").select(count);
	return words[rule] ?? words.other;
};

export const getFieldsByPrefix = <Prefix extends string, Obj extends object>(obj: Obj, prefix: Prefix) => {
	const prefixWithDot = prefix + ".";
	return Object.fromEntries(
		Object.entries(obj)
			.filter(([key]) => key.startsWith(prefixWithDot))
			.map(([key, value]) => [key.slice(prefixWithDot.length), value]),
	) as {
		[K in keyof Obj as K extends `${Prefix}.${infer Key}` ? Key : never]: Obj[K];
	};
};

export const addPrefixToFields = <Prefix extends string, Obj extends object>(obj: Obj, prefix: Prefix) => {
	const prefixWithDot = prefix + ".";
	return Object.fromEntries(Object.entries(obj).map(([key, value]) => [prefixWithDot + key, value])) as {
		[K in keyof Obj as `${Prefix}.${K & string}`]: Obj[K];
	};
};

export const slugify = (text: string) =>
	text
		.toString()
		.normalize("NFKD")
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-")
		.replace(/[^\w-]+/g, "")
		.replace(/_/g, "-")
		.replace(/--+/g, "-")
		.replace(/-$/g, "");

export const capitalize = (str: string): string =>
	str.length > 0 ? str.charAt(0).toUpperCase() + str.slice(1) : "";

export const deslugify = (slug: string) =>
	slug
		.split("-")
		.map((part) => capitalize(part))
		.join(" ");

type VariantInput = string | null | undefined | (string | null | undefined)[];
type VariantMetadata = Record<string, string | undefined> | null | undefined;

const VARIANT_METADATA_KEYWORDS = ["color", "colour", "size", "variant", "style", "option", "name"];
const VARIANT_METADATA_DENY_PATTERNS = [
	/(?:^|_)sku/, // product SKU codes
	/(?:^|[-_])id$/, // ids and identifiers
	/price/,
	/amount/,
	/cost/,
	/image/,
	/url/,
	/slug/,
	/description/,
	/category/,
	/product/,
	/available/,
];

const shouldUseVariantMetadataValue = (key: string, value: string | undefined) => {
	if (!value) return false;
	const trimmed = value.trim();
	if (!trimmed) return false;
	if (!/[a-z]/i.test(trimmed)) return false;

	const normalizedKey = key.toLowerCase();
	if (VARIANT_METADATA_DENY_PATTERNS.some((pattern) => pattern.test(normalizedKey))) {
		return false;
	}

	return VARIANT_METADATA_KEYWORDS.some((keyword) => normalizedKey.includes(keyword));
};

const extractVariantMetadataValues = (metadata: VariantMetadata): string[] => {
	if (!metadata) return [];

	const values: string[] = [];
	for (const [key, rawValue] of Object.entries(metadata)) {
		if (!shouldUseVariantMetadataValue(key, rawValue)) continue;
		const trimmed = rawValue?.trim();
		if (!trimmed) continue;
		values.push(trimmed);
	}

	return values;
};

const normalizeVariantPart = (part: string) => {
	const trimmed = part.trim();
	if (!trimmed) return "";

	const hyphenNormalized = trimmed.replace(/_/g, "-");
	if (hyphenNormalized.includes("-")) {
		const slug = hyphenNormalized
			.split("-")
			.map((piece) => piece.trim())
			.filter(Boolean)
			.join("-")
			.toLowerCase();
		return deslugify(slug);
	}

	if (/^[a-z]+$/i.test(trimmed)) {
		if (trimmed.length <= 3) {
			return trimmed.toUpperCase();
		}
		if (trimmed === trimmed.toLowerCase()) {
			return capitalize(trimmed);
		}
	}

	return trimmed;
};

const mergeVariantParts = (variant?: VariantInput): string[] => {
	if (!variant) return [];

	const parts = (Array.isArray(variant) ? variant : [variant])
		.flatMap((entry) => (entry ?? "").split("/"))
		.map((entry) => entry.trim())
		.filter(Boolean)
		.map(normalizeVariantPart)
		.filter((entry): entry is string => Boolean(entry));

	const seen = new Set<string>();
	const unique: string[] = [];
	for (const part of parts) {
		const key = part.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		unique.push(part);
	}

	return unique;
};

const mergeUniqueVariantParts = (existing: string[], additional: string[]): string[] => {
	if (additional.length === 0) return existing;

	const seen = new Set(existing.map((part) => part.toLowerCase()));
	const merged = [...existing];

	for (const part of additional) {
		const key = part.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		merged.push(part);
	}

	return merged;
};

export const collectVariantDisplayParts = ({
	variant,
	metadata,
	additional,
}: {
	variant?: VariantInput;
	metadata?: VariantMetadata;
	additional?: VariantInput;
} = {}) => {
	const parts: (string | null | undefined)[] = [];

	if (additional !== undefined) {
		const entries = Array.isArray(additional) ? additional : [additional];
		parts.push(...entries);
	}

	if (variant !== undefined) {
		const entries = Array.isArray(variant) ? variant : [variant];
		parts.push(...entries);
	}

	if (metadata) {
		parts.push(...extractVariantMetadataValues(metadata));
	}

	return mergeVariantParts(parts);
};

export const formatProductName = (name: string, variant?: VariantInput) => {
	const trimmedName = name.trim();
	const variantParts = mergeVariantParts(variant);
	if (variantParts.length === 0) {
		return trimmedName;
	}

	const trailingVariantMatch = trimmedName.match(/^(.*?)(?:\s*\(([^()]+)\))$/);
	if (!trailingVariantMatch) {
		return `${trimmedName} (${variantParts.join(" / ")})`;
	}

	const baseNameRaw = trailingVariantMatch[1];
	const baseName = typeof baseNameRaw === "string" && baseNameRaw.trim() ? baseNameRaw.trim() : trimmedName;
	const existingVariantRaw = trailingVariantMatch[2];
	const existingParts = mergeVariantParts(existingVariantRaw);
	const mergedParts = mergeUniqueVariantParts(existingParts, variantParts);

	if (mergedParts.length === 0) {
		return baseName;
	}

	return `${baseName} (${mergedParts.join(" / ")})`;
};

export const assertInteger = (value: number) =>
	invariant(Number.isInteger(value), "Value must be an integer");

const getDecimalsForStripe = (currency: string) => {
	invariant(currency.length === 3, "currency needs to be a 3-letter code");
	return stripeCurrencies[currency.toUpperCase()] ?? 2;
};

type Money = { amount: number; currency: string };

export const getStripeAmountFromDecimal = ({ amount: major, currency }: Money) => {
	const decimals = getDecimalsForStripe(currency);
	const multiplier = 10 ** decimals;
	return Number.parseInt((major * multiplier).toFixed(0), 10);
};

export const getDecimalFromStripeAmount = ({ amount: minor, currency }: Money) => {
	assertInteger(minor);
	const decimals = getDecimalsForStripe(currency);
	const multiplier = 10 ** decimals;
	return Number.parseFloat((minor / multiplier).toFixed(decimals));
};

export const formatMoney = ({ amount: minor, currency, locale = "en-US" }: Money & { locale?: string }) => {
	const amount = getDecimalFromStripeAmount({ amount: minor, currency });
	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency,
	}).format(amount);
};

export { invariant };

// https://docs.stripe.com/development-resources/currency-codes
const stripeCurrencies: Record<string, number> = {
	BIF: 0,
	CLP: 0,
	DJF: 0,
	GNF: 0,
	JPY: 0,
	KMF: 0,
	KRW: 0,
	MGA: 0,
	PYG: 0,
	RWF: 0,
	UGX: 0,
	VND: 0,
	VUV: 0,
	XAF: 0,
	XOF: 0,
	XPF: 0,

	BHD: 3,
	JOD: 3,
	KWD: 3,
	OMR: 3,
	TND: 3,
};
