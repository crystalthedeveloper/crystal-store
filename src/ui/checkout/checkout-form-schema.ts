// src/ui/checkout/checkout-form-schema.ts
import { object, string, type TypeOf } from "zod";

export const getAddressSchema = (tr: {
	nameRequired: string;
	emailRequired: string;
	cityRequired: string;
	countryRequired: string;
	line1Required: string;
	postalCodeRequired: string;
}) => {
	return object({
		name: string().min(1, tr.nameRequired),
		email: string().min(1, tr.emailRequired).email(tr.emailRequired), // ✅ proper email validation
		city: string().min(1, tr.cityRequired),
		country: string().min(1, tr.countryRequired),
		line1: string().min(1, tr.line1Required),
		line2: string().optional(), // no need for nullable+default, cleaner
		postalCode: string().min(1, tr.postalCodeRequired),
		state: string().optional(),
		phone: string().optional(),
		taxId: string().optional(),
	});
};

export type AddressSchema = TypeOf<ReturnType<typeof getAddressSchema>>;
