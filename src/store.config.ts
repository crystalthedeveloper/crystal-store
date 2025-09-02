// src/store.config.ts
import ApparelImage from "@/images/apparel.webp";
import MaintenanceImage from "@/images/maintenance.webp";
import SupportImage from "@/images/support.webp";
import WebflowImage from "@/images/webflow.webp";

export const config = {
	categories: [
		{ name: "Webflow", slug: "webflow", image: WebflowImage },
		{ name: "Maintenance", slug: "maintenance", image: MaintenanceImage },
		{ name: "Apparel", slug: "apparel", image: ApparelImage },
		{ name: "Support", slug: "support", image: SupportImage },
	],

	// 🚫 disable reviews (prevents @neondatabase/serverless import)
	reviews: false,

	social: {
		x: "https://www.instagram.com/crystalthedeveloper",
		facebook: "https://www.facebook.com/Crystalthedeveloper",
	},

	contact: {
		email: "contact@crystalthedeveloper.ca",
		phone: "+416-452-2203",
		address: "50 absolute avenue mississauga on l4z 0a8",
	},
};

export type StoreConfig = typeof config;
export default config;
