"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import _styles from "./SCrystalsStore.module.css";
import * as _utils from "./utils";

export function SCrystalsStore({ as: _Component = _Builtin.Block }) {
	return (
		<_Component className={_utils.cx(_styles, "box")} tag="div">
			<_Builtin.Block
				className={_utils.cx(_styles, "header-wrap", "center")}
				id={_utils.cx(_styles, "w-node-a03d6853-617d-f984-0f17-e321beed7839-beed7838")}
				tag="div"
			>
				<_Builtin.Heading tag="h2">{"Crystal's Store"}</_Builtin.Heading>
				<_Builtin.Block className={_utils.cx(_styles, "hr")} tag="div" />
				<_Builtin.Paragraph>
					{"Templates, tools, and merch — all in one place. "}
					<br />
					{
						"Get a Webflow site fast, upgrade it with custom apps, and stay comfy in dev-mode hoodies. Templates transfer straight to your account — no setup needed."
					}
				</_Builtin.Paragraph>
				<_Builtin.Block
					className={_utils.cx(_styles, "buttons-wrap")}
					id={_utils.cx(_styles, "w-node-f4355981-c052-6654-1934-cf7baeb27de6-beed7838")}
					tag="div"
				>
					<_Builtin.Link
						className={_utils.cx(_styles, "button", "secondary")}
						button={true}
						block=""
						options={{
							href: "#",
						}}
					>
						{"🛍️ Happy shopping!"}
					</_Builtin.Link>
				</_Builtin.Block>
			</_Builtin.Block>
			<_Builtin.Block className={_utils.cx(_styles, "content-wrap")} tag="div">
				<_Builtin.Link
					className={_utils.cx(_styles, "store-image-link")}
					button={false}
					block="inline"
					options={{
						href: "#",
					}}
				>
					<_Builtin.Image
						className={_utils.cx(_styles, "crystals-store-image")}
						loading="lazy"
						width="auto"
						height="auto"
						alt=""
						src="https://cdn.prod.website-files.com/627d638bf3227602da3644f3/687a571197ee73d50baac45d_1store.png"
					/>
					<_Builtin.Image
						className={_utils.cx(_styles, "crystals-store-image")}
						loading="lazy"
						width="auto"
						height="auto"
						alt=""
						src="https://cdn.prod.website-files.com/627d638bf3227602da3644f3/687a5711c76980e07bc6e21b_2store.png"
					/>
					<_Builtin.Image
						className={_utils.cx(_styles, "crystals-store-image")}
						id={_utils.cx(_styles, "w-node-_66fe7d55-fd77-cf02-6c9b-4d644872aa48-beed7838")}
						loading="lazy"
						width="auto"
						height="auto"
						alt=""
						src="https://cdn.prod.website-files.com/627d638bf3227602da3644f3/687a5711c72374fc40cd646e_3store.png"
					/>
					<_Builtin.Image
						className={_utils.cx(_styles, "crystals-store-image")}
						id={_utils.cx(_styles, "w-node-b6f38b8b-5e5f-eadf-9403-6cc390f5eb79-beed7838")}
						loading="lazy"
						width="auto"
						height="auto"
						alt=""
						src="https://cdn.prod.website-files.com/627d638bf3227602da3644f3/687a571197ee73d50baac433_4store.png"
					/>
					<_Builtin.Block
						className={_utils.cx(_styles, "alt-text")}
						id={_utils.cx(_styles, "w-node-_09bf0325-68f2-4615-c0e4-ea70c19c39dd-beed7838")}
						tag="div"
					>
						{"Crystal's Store"}
					</_Builtin.Block>
				</_Builtin.Link>
			</_Builtin.Block>
		</_Component>
	);
}
