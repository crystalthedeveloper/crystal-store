// src/app/login/page.tsx

import { CodeIcon, LaptopIcon, ShirtIcon } from "lucide-react";
import Link from "next/link";
import { LoginForm } from "@/ui/login-form";

export default function LoginPage() {
	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-neutral-50 p-6 md:p-10">
			<div className="flex w-full max-w-sm flex-col gap-6">
				<div className="flex items-center gap-2 self-center font-medium">
					{/* Webflow category */}
					<Link
						href="https://www.crystalthedeveloper.ca/store/category/webflow"
						className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground"
					>
						<LaptopIcon className="size-4" />
					</Link>

					{/* Homepage */}
					<Link
						href="https://www.crystalthedeveloper.ca/"
						className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground"
					>
						<CodeIcon className="size-4" />
					</Link>

					{/* Apparel category */}
					<Link
						href="https://www.crystalthedeveloper.ca/store/category/apparel"
						className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground"
					>
						<ShirtIcon className="size-4" />
					</Link>

					<span className="ml-2">Crystal The Developer Inc.</span>
				</div>

				<LoginForm />
			</div>
		</div>
	);
}
