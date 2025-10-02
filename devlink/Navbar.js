"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _interactions from "./interactions";
import _styles from "./Navbar.module.css";
import * as _utils from "./utils";

const _interactionsData = JSON.parse(
	'{"events":{"e-427":{"id":"e-427","name":"","animationType":"custom","eventTypeId":"NAVBAR_OPEN","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-42","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-428"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"30251603-4a6e-6761-e5e0-1340e8109ecf","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"30251603-4a6e-6761-e5e0-1340e8109ecf","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1640005099190},"e-428":{"id":"e-428","name":"","animationType":"custom","eventTypeId":"NAVBAR_CLOSE","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-43","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-38"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"30251603-4a6e-6761-e5e0-1340e8109ecf","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"30251603-4a6e-6761-e5e0-1340e8109ecf","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1640005099190}},"actionLists":{"a-42":{"id":"a-42","title":"Navbar menu -> OPEN","actionItemGroups":[{"actionItems":[{"id":"a-42-n","actionTypeId":"STYLE_SIZE","config":{"delay":0,"easing":"inOutQuint","duration":200,"target":{},"widthValue":0,"widthUnit":"px","heightUnit":"PX","locked":false}},{"id":"a-42-n-2","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"inOutQuint","duration":400,"target":{},"yValue":-8,"xUnit":"PX","yUnit":"px","zUnit":"PX"}},{"id":"a-42-n-3","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"inOutQuint","duration":400,"target":{},"yValue":8,"xUnit":"PX","yUnit":"px","zUnit":"PX"}},{"id":"a-42-n-4","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"inOutQuint","duration":600,"target":{},"zValue":-45,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}},{"id":"a-42-n-5","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"inOutQuint","duration":600,"target":{},"zValue":45,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}}]}],"useFirstGroupAsInitialState":false,"createdOn":1626168378054},"a-43":{"id":"a-43","title":"Navbar menu -> CLOSE","actionItemGroups":[{"actionItems":[{"id":"a-43-n","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"inOutQuint","duration":600,"target":{},"yValue":0,"xUnit":"PX","yUnit":"px","zUnit":"PX"}},{"id":"a-43-n-2","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"inOutQuint","duration":600,"target":{},"yValue":0,"xUnit":"PX","yUnit":"px","zUnit":"PX"}},{"id":"a-43-n-3","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"inOutQuint","duration":400,"target":{},"zValue":0,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}},{"id":"a-43-n-4","actionTypeId":"TRANSFORM_ROTATE","config":{"delay":0,"easing":"inOutQuint","duration":400,"target":{},"zValue":0,"xUnit":"DEG","yUnit":"DEG","zUnit":"deg"}},{"id":"a-43-n-5","actionTypeId":"STYLE_SIZE","config":{"delay":400,"easing":"inOutQuint","duration":200,"target":{},"widthValue":24,"widthUnit":"px","heightUnit":"PX","locked":false}}]}],"useFirstGroupAsInitialState":false,"createdOn":1626168766736}},"site":{"mediaQueries":[{"key":"main","min":992,"max":10000},{"key":"medium","min":768,"max":991},{"key":"small","min":480,"max":767},{"key":"tiny","min":0,"max":479}]}}',
);

export function Navbar({ as: _Component = _Builtin.NavbarWrapper }) {
	_interactions.useInteractions(_interactionsData, _styles);

	return (
		<_Component
			className={_utils.cx(_styles, "navbar")}
			data-w-id="30251603-4a6e-6761-e5e0-1340e8109ecf"
			tag="div"
			config={{
				animation: "default",
				collapse: "none",
				docHeight: false,
				duration: 400,
				easing: "ease",
				easing2: "ease",
				noScroll: true,
			}}
		>
			<_Builtin.NavbarContainer className={_utils.cx(_styles, "navbar_container")} tag="div">
				<_Builtin.Link
					className={_utils.cx(_styles, "home-link")}
					id={_utils.cx(_styles, "w-node-_009bee89-22f0-79b0-ee0e-84b77559ae49-e8109ecf")}
					button={false}
					block="inline"
					options={{
						href: "#",
					}}
				>
					<_Builtin.Image
						className={_utils.cx(_styles, "crystal-the-developer-inc")}
						loading="lazy"
						width="auto"
						height="auto"
						alt="Crystal The Developer Inc. Logo – Home"
						src="https://cdn.prod.website-files.com/627d638bf3227602da3644f3/6895e3634b67480ff5d834de_crystalthedeveloper-logo.webp"
					/>
					<_Builtin.Block className={_utils.cx(_styles, "crystal-the-developer-inc-text")} tag="div">
						{"Crystal The Developer Inc."}
					</_Builtin.Block>
				</_Builtin.Link>
				<_Builtin.Block className={_utils.cx(_styles, "last-button-wrap")} tag="div">
					<_Builtin.Link
						className={_utils.cx(_styles, "button", "email")}
						button={true}
						block=""
						options={{
							href: "#",
						}}
					>
						{"Contact Crystal"}
					</_Builtin.Link>
				</_Builtin.Block>
			</_Builtin.NavbarContainer>
			<_Builtin.HtmlEmbed value="%3C!--%20%F0%9F%9B%92%20Cart%20Badge%20--%3E%0A%3Cbutton%20class%3D%22cart-badge-wrap%22%20onclick%3D%22document.getElementById('cart-modal').classList.remove('hidden')%22%3E%0A%20%20%F0%9F%9B%92%20%3Cspan%20class%3D%22cart-badge%22%3E0%3C%2Fspan%3E%0A%3C%2Fbutton%3E" />
		</_Component>
	);
}
