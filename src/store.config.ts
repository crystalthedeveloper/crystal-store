import ApparelImage from "@/images/apparel.jpg";
import MaintenanceImage from "@/images/maintenance.jpg";
import SupportImage from "@/images/support.jpg";
import WebflowImage from "@/images/webflow.jpg";

export const config = {
	categories: [
		{ name: "Webflow", slug: "webflow", image: WebflowImage },
		{ name: "Maintenance", slug: "maintenance", image: MaintenanceImage },
		{ name: "Apparel", slug: "apparel", image: ApparelImage },
		{ name: "Support", slug: "support", image: SupportImage },
	],

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
