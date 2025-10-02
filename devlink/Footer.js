"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import _styles from "./Footer.module.css";
import * as _interactions from "./interactions";
import { Social } from "./Social";
import { SocialTestimonials } from "./SocialTestimonials";
import * as _utils from "./utils";

const _interactionsData = JSON.parse(
	'{"events":{"e-592":{"id":"e-592","name":"","animationType":"preset","eventTypeId":"SCROLL_INTO_VIEW","action":{"id":"","actionTypeId":"GROW_EFFECT","instant":false,"config":{"actionListId":"growIn","autoStopEventId":"e-593"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"627d638bf32276498d3644f4|d480afc3-bd7b-0451-2eb0-c9d0d1c6584f","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"627d638bf32276498d3644f4|d480afc3-bd7b-0451-2eb0-c9d0d1c6584f","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":0,"scrollOffsetUnit":"%","delay":0,"direction":null,"effectIn":true},"createdOn":1753733927873}},"actionLists":{"growIn":{"id":"growIn","useFirstGroupAsInitialState":true,"actionItemGroups":[{"actionItems":[{"actionTypeId":"STYLE_OPACITY","config":{"delay":0,"duration":0,"target":{"id":"N/A","appliesTo":"TRIGGER_ELEMENT","useEventTarget":true},"value":0}}]},{"actionItems":[{"actionTypeId":"TRANSFORM_SCALE","config":{"delay":0,"duration":0,"target":{"id":"N/A","appliesTo":"TRIGGER_ELEMENT","useEventTarget":true},"xValue":0.7500000000000001,"yValue":0.7500000000000001}}]},{"actionItems":[{"actionTypeId":"TRANSFORM_SCALE","config":{"delay":0,"easing":"outQuart","duration":1000,"target":{"id":"N/A","appliesTo":"TRIGGER_ELEMENT","useEventTarget":true},"xValue":1,"yValue":1}},{"actionTypeId":"STYLE_OPACITY","config":{"delay":0,"easing":"outQuart","duration":1000,"target":{"id":"N/A","appliesTo":"TRIGGER_ELEMENT","useEventTarget":true},"value":1}}]}]}},"site":{"mediaQueries":[{"key":"main","min":992,"max":10000},{"key":"medium","min":768,"max":991},{"key":"small","min":480,"max":767},{"key":"tiny","min":0,"max":479}]}}',
);

export function Footer({ as: _Component = _Builtin.Section }) {
	_interactions.useInteractions(_interactionsData, _styles);

	return (
		<_Component
			className={_utils.cx(_styles, "section_footer")}
			grid={{
				type: "section",
			}}
			tag="section"
			id="site"
		>
			<_Builtin.Block className={_utils.cx(_styles, "nav-button-wrap")} tag="div">
				<_Builtin.HtmlEmbed value="%3C!--%20%F0%9F%9B%92%20Cart%20Badge%20--%3E%0A%3Cbutton%20class%3D%22cart-badge-wrap%22%20onclick%3D%22document.getElementById('cart-modal').classList.remove('hidden')%22%3E%0A%20%20%F0%9F%9B%92%20%3Cspan%20class%3D%22cart-badge%22%3E0%3C%2Fspan%3E%0A%3C%2Fbutton%3E" />
				<_Builtin.Block className={_utils.cx(_styles, "nav-links-wrap")} tag="div">
					<_Builtin.Link
						className={_utils.cx(_styles, "login-link")}
						button={false}
						id="auth-toggle-btn"
						block=""
						options={{
							href: "#",
						}}
					>
						{"Login"}
					</_Builtin.Link>
					<_Builtin.Block className={_utils.cx(_styles, "nav-space")} tag="div">
						{"/"}
					</_Builtin.Block>
					<_Builtin.Link
						className={_utils.cx(_styles, "footer_links")}
						button={false}
						block="inline"
						options={{
							href: "#05",
						}}
					>
						<_Builtin.HtmlEmbed
							className={_utils.cx(_styles, "icons")}
							value="%3Csvg%20width%3D%2224%22%20class%3D%22custom-icon%22%20%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22%23000%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cpath%20d%3D%22M22%2021V19C22%2017.1362%2020.7252%2015.5701%2019%2015.126M15.5%203.29076C16.9659%203.88415%2018%205.32131%2018%207C18%208.67869%2016.9659%2010.1159%2015.5%2010.7092M17%2021C17%2019.1362%2017%2018.2044%2016.6955%2017.4693C16.2895%2016.4892%2015.5108%2015.7105%2014.5307%2015.3045C13.7956%2015%2012.8638%2015%2011%2015H8C6.13623%2015%205.20435%2015%204.46927%2015.3045C3.48915%2015.7105%202.71046%2016.4892%202.30448%2017.4693C2%2018.2044%202%2019.1362%202%2021M13.5%207C13.5%209.20914%2011.7091%2011%209.5%2011C7.29086%2011%205.5%209.20914%205.5%207C5.5%204.79086%207.29086%203%209.5%203C11.7091%203%2013.5%204.79086%2013.5%207Z%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%3C%2Fsvg%3E"
						/>
						<_Builtin.Block tag="div">{"My Account"}</_Builtin.Block>
					</_Builtin.Link>
					<_Builtin.Block className={_utils.cx(_styles, "nav-space")} tag="div">
						{"/"}
					</_Builtin.Block>
					<_Builtin.Link
						className={_utils.cx(_styles, "footer_links")}
						button={false}
						block="inline"
						options={{
							href: "#05",
						}}
					>
						<_Builtin.HtmlEmbed
							className={_utils.cx(_styles, "icons")}
							value="%3Csvg%20class%3D%22custom-icon%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22%23000%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cpath%20d%3D%22M22%2021V19C22%2017.1362%2020.7252%2015.5701%2019%2015.126M15.5%203.29076C16.9659%203.88415%2018%205.32131%2018%207C18%208.67869%2016.9659%2010.1159%2015.5%2010.7092M17%2021C17%2019.1362%2017%2018.2044%2016.6955%2017.4693C16.2895%2016.4892%2015.5108%2015.7105%2014.5307%2015.3045C13.7956%2015%2012.8638%2015%2011%2015H8C6.13623%2015%205.20435%2015%204.46927%2015.3045C3.48915%2015.7105%202.71046%2016.4892%202.30448%2017.4693C2%2018.2044%202%2019.1362%202%2021M13.5%207C13.5%209.20914%2011.7091%2011%209.5%2011C7.29086%2011%205.5%209.20914%205.5%207C5.5%204.79086%207.29086%203%209.5%203C11.7091%203%2013.5%204.79086%2013.5%207Z%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%3C%2Fsvg%3E"
						/>
						<_Builtin.Block tag="div">{"Sign Up"}</_Builtin.Block>
					</_Builtin.Link>
				</_Builtin.Block>
				<_Builtin.Block className={_utils.cx(_styles, "em")} tag="div">
					{"🔒 Login required to access the game"}
				</_Builtin.Block>
			</_Builtin.Block>
			<_Builtin.Block className={_utils.cx(_styles, "hr", "top")} tag="div" />
			<_Builtin.Block className={_utils.cx(_styles, "container-footer")} tag="div">
				<_Builtin.Block className={_utils.cx(_styles, "footer-wrapper-two")} tag="div">
					<_Builtin.Block className={_utils.cx(_styles, "footer-block-two")} tag="div">
						<_Builtin.Block className={_utils.cx(_styles, "subheading")} tag="div">
							{"Company"}
						</_Builtin.Block>
						<_Builtin.Link
							className={_utils.cx(_styles, "footer_links")}
							button={false}
							block="inline"
							options={{
								href: "#0",
							}}
						>
							<_Builtin.HtmlEmbed
								className={_utils.cx(_styles, "icons")}
								value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20class%3D%22custom-icon%22%20fill%3D%22currentColor%22%20class%3D%22bi%20bi-bank%22%20viewBox%3D%220%200%2016%2016%22%3E%0A%20%20%3Cpath%20d%3D%22m8%200%206.61%203h.89a.5.5%200%200%201%20.5.5v2a.5.5%200%200%201-.5.5H15v7a.5.5%200%200%201%20.485.38l.5%202a.498.498%200%200%201-.485.62H.5a.498.498%200%200%201-.485-.62l.5-2A.5.5%200%200%201%201%2013V6H.5a.5.5%200%200%201-.5-.5v-2A.5.5%200%200%201%20.5%203h.89zM3.777%203h8.447L8%201zM2%206v7h1V6zm2%200v7h2.5V6zm3.5%200v7h1V6zm2%200v7H12V6zM13%206v7h1V6zm2-1V4H1v1zm-.39%209H1.39l-.25%201h13.72z%22%2F%3E%0A%3C%2Fsvg%3E"
							/>
							<_Builtin.Block tag="div">{"Home"}</_Builtin.Block>
						</_Builtin.Link>
						<_Builtin.Link
							className={_utils.cx(_styles, "footer_links")}
							button={false}
							block="inline"
							options={{
								href: "#05",
							}}
						>
							<_Builtin.HtmlEmbed
								className={_utils.cx(_styles, "icons")}
								value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20class%3D%22custom-icon%22%20height%3D%2224px%22%20viewBox%3D%220%20-960%20960%20960%22%20width%3D%2224px%22%20fill%3D%22%23000%22%3E%3Cpath%20d%3D%22M160-160q-33%200-56.5-23.5T80-240v-480q0-33%2023.5-56.5T160-800h640q33%200%2056.5%2023.5T880-720v480q0%2033-23.5%2056.5T800-160H160Zm0-80h640v-400H160v400Zm278-58L296-440l58-58%2084%2084%20168-168%2058%2058-226%20226Zm-278%2058v-480%20480Z%22%2F%3E%3C%2Fsvg%3E"
							/>
							<_Builtin.Block tag="div">{"Core Services"}</_Builtin.Block>
						</_Builtin.Link>
						<_Builtin.Link
							className={_utils.cx(_styles, "footer_links", "important")}
							button={false}
							block="inline"
							options={{
								href: "#05",
							}}
						>
							<_Builtin.HtmlEmbed
								className={_utils.cx(_styles, "icons")}
								value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20class%3D%22custom-icon%22%20height%3D%2224px%22%20viewBox%3D%220%20-960%20960%20960%22%20width%3D%2224px%22%20fill%3D%22%23000%22%3E%3Cpath%20d%3D%22M160-160q-33%200-56.5-23.5T80-240v-480q0-33%2023.5-56.5T160-800h640q33%200%2056.5%2023.5T880-720v480q0%2033-23.5%2056.5T800-160H160Zm0-80h640v-400H160v400Zm278-58L296-440l58-58%2084%2084%20168-168%2058%2058-226%20226Zm-278%2058v-480%20480Z%22%2F%3E%3C%2Fsvg%3E"
							/>
							<_Builtin.Block tag="div">{"Dream to Launch"}</_Builtin.Block>
						</_Builtin.Link>
						<_Builtin.Link
							className={_utils.cx(_styles, "footer_links")}
							button={false}
							block="inline"
							options={{
								href: "#05",
							}}
						>
							<_Builtin.HtmlEmbed
								className={_utils.cx(_styles, "icons")}
								value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20class%3D%22custom-icon%22%20fill%3D%22currentColor%22%20class%3D%22bi%20bi-shop%22%20viewBox%3D%220%200%2016%2016%22%3E%0A%20%20%3Cpath%20d%3D%22M2.97%201.35A1%201%200%200%201%203.73%201h8.54a1%201%200%200%201%20.76.35l2.609%203.044A1.5%201.5%200%200%201%2016%205.37v.255a2.375%202.375%200%200%201-4.25%201.458A2.37%202.37%200%200%201%209.875%208%202.37%202.37%200%200%201%208%207.083%202.37%202.37%200%200%201%206.125%208a2.37%202.37%200%200%201-1.875-.917A2.375%202.375%200%200%201%200%205.625V5.37a1.5%201.5%200%200%201%20.361-.976zm1.78%204.275a1.375%201.375%200%200%200%202.75%200%20.5.5%200%200%201%201%200%201.375%201.375%200%200%200%202.75%200%20.5.5%200%200%201%201%200%201.375%201.375%200%201%200%202.75%200V5.37a.5.5%200%200%200-.12-.325L12.27%202H3.73L1.12%205.045A.5.5%200%200%200%201%205.37v.255a1.375%201.375%200%200%200%202.75%200%20.5.5%200%200%201%201%200M1.5%208.5A.5.5%200%200%201%202%209v6h1v-5a1%201%200%200%201%201-1h3a1%201%200%200%201%201%201v5h6V9a.5.5%200%200%201%201%200v6h.5a.5.5%200%200%201%200%201H.5a.5.5%200%200%201%200-1H1V9a.5.5%200%200%201%20.5-.5M4%2015h3v-5H4zm5-5a1%201%200%200%201%201-1h2a1%201%200%200%201%201%201v3a1%201%200%200%201-1%201h-2a1%201%200%200%201-1-1zm3%200h-2v3h2z%22%2F%3E%0A%3C%2Fsvg%3E"
							/>
							<_Builtin.Block tag="div">{"Crystal's Store"}</_Builtin.Block>
						</_Builtin.Link>
						<_Builtin.Link
							className={_utils.cx(_styles, "footer_links")}
							button={false}
							block="inline"
							options={{
								href: "#05",
							}}
						>
							<_Builtin.HtmlEmbed
								className={_utils.cx(_styles, "icons")}
								value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20class%3D%22custom-icon%22%20fill%3D%22currentColor%22%20class%3D%22bi%20bi-window-stack%22%20viewBox%3D%220%200%2016%2016%22%3E%0A%20%20%3Cpath%20d%3D%22M4.5%206a.5.5%200%201%200%200-1%20.5.5%200%200%200%200%201M6%206a.5.5%200%201%200%200-1%20.5.5%200%200%200%200%201m2-.5a.5.5%200%201%201-1%200%20.5.5%200%200%201%201%200%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M12%201a2%202%200%200%201%202%202%202%202%200%200%201%202%202v8a2%202%200%200%201-2%202H4a2%202%200%200%201-2-2%202%202%200%200%201-2-2V3a2%202%200%200%201%202-2zM2%2012V5a2%202%200%200%201%202-2h9a1%201%200%200%200-1-1H2a1%201%200%200%200-1%201v8a1%201%200%200%200%201%201m1-4v5a1%201%200%200%200%201%201h10a1%201%200%200%200%201-1V8zm12-1V5a1%201%200%200%200-1-1H4a1%201%200%200%200-1%201v2z%22%2F%3E%0A%3C%2Fsvg%3E"
							/>
							<_Builtin.Block tag="div">{"Crystal's Apps"}</_Builtin.Block>
						</_Builtin.Link>
						<_Builtin.Link
							className={_utils.cx(_styles, "footer_links")}
							button={false}
							block="inline"
							options={{
								href: "#05",
							}}
						>
							<_Builtin.HtmlEmbed
								className={_utils.cx(_styles, "icons")}
								value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20class%3D%22custom-icon%22%20width%3D%2224%22%20height%3D%2224%22%20fill%3D%22currentColor%22%20class%3D%22bi%20bi-currency-dollar%22%20viewBox%3D%220%200%2016%2016%22%3E%0A%20%20%3Cpath%20d%3D%22M4%2010.781c.148%201.667%201.513%202.85%203.591%203.003V15h1.043v-1.216c2.27-.179%203.678-1.438%203.678-3.3%200-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11%201.879.714%202.07%201.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27%201.472-3.27%203.156%200%201.454.966%202.483%202.661%202.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616%200-.944.704-1.641%201.8-1.828v3.495l-.2-.05zm1.591%201.872c1.287.323%201.852.859%201.852%201.769%200%201.097-.826%201.828-2.2%201.939V8.73z%22%2F%3E%0A%3C%2Fsvg%3E"
							/>
							<_Builtin.Block tag="div">{"Pricing"}</_Builtin.Block>
						</_Builtin.Link>
						<_Builtin.Link
							className={_utils.cx(_styles, "footer_links")}
							button={false}
							block="inline"
							options={{
								href: "#05",
							}}
						>
							<_Builtin.HtmlEmbed
								className={_utils.cx(_styles, "icons")}
								value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20class%3D%22custom-icon%22%20fill%3D%22currentColor%22%20class%3D%22bi%20bi-person-arms-up%22%20viewBox%3D%220%200%2016%2016%22%3E%0A%20%20%3Cpath%20d%3D%22M8%203a1.5%201.5%200%201%200%200-3%201.5%201.5%200%200%200%200%203%22%2F%3E%0A%20%20%3Cpath%20d%3D%22m5.93%206.704-.846%208.451a.768.768%200%200%200%201.523.203l.81-4.865a.59.59%200%200%201%201.165%200l.81%204.865a.768.768%200%200%200%201.523-.203l-.845-8.451A1.5%201.5%200%200%201%2010.5%205.5L13%202.284a.796.796%200%200%200-1.239-.998L9.634%203.84a.7.7%200%200%201-.33.235c-.23.074-.665.176-1.304.176-.64%200-1.074-.102-1.305-.176a.7.7%200%200%201-.329-.235L4.239%201.286a.796.796%200%200%200-1.24.998l2.5%203.216c.317.316.475.758.43%201.204Z%22%2F%3E%0A%3C%2Fsvg%3E"
							/>
							<_Builtin.Block tag="div">{"Jobs"}</_Builtin.Block>
						</_Builtin.Link>
					</_Builtin.Block>
					<_Builtin.Block className={_utils.cx(_styles, "footer-block-two")} tag="div">
						<_Builtin.Block className={_utils.cx(_styles, "subheading")} tag="div">
							{"Portfolio"}
						</_Builtin.Block>
						<_Builtin.Link
							className={_utils.cx(_styles, "footer_links")}
							button={false}
							block="inline"
							options={{
								href: "#0",
							}}
						>
							<_Builtin.HtmlEmbed
								className={_utils.cx(_styles, "icons", "text-color-primary600")}
								value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20%20class%3D%22custom-icon%22%20viewBox%3D%220%20-960%20960%20960%22%20width%3D%2224px%22%20fill%3D%22%23000%22%3E%3Cpath%20d%3D%22M620-520q25%200%2042.5-17.5T680-580q0-25-17.5-42.5T620-640q-25%200-42.5%2017.5T560-580q0%2025%2017.5%2042.5T620-520Zm-280%200q25%200%2042.5-17.5T400-580q0-25-17.5-42.5T340-640q-25%200-42.5%2017.5T280-580q0%2025%2017.5%2042.5T340-520Zm140%20260q68%200%20123.5-38.5T684-400h-66q-22%2037-58.5%2058.5T480-320q-43%200-79.5-21.5T342-400h-66q25%2063%2080.5%20101.5T480-260Zm0%20180q-83%200-156-31.5T197-197q-54-54-85.5-127T80-480q0-83%2031.5-156T197-763q54-54%20127-85.5T480-880q83%200%20156%2031.5T763-763q54%2054%2085.5%20127T880-480q0%2083-31.5%20156T763-197q-54%2054-127%2085.5T480-80Zm0-400Zm0%20320q134%200%20227-93t93-227q0-134-93-227t-227-93q-134%200-227%2093t-93%20227q0%20134%2093%20227t227%2093Z%22%2F%3E%3C%2Fsvg%3E"
							/>
							<_Builtin.Block tag="div">{"About"}</_Builtin.Block>
						</_Builtin.Link>
						<_Builtin.Link
							className={_utils.cx(_styles, "footer_links")}
							button={false}
							block="inline"
							options={{
								href: "#04",
							}}
						>
							<_Builtin.HtmlEmbed
								className={_utils.cx(_styles, "icons")}
								value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20class%3D%22custom-icon%22%20height%3D%2224px%22%20viewBox%3D%220%20-960%20960%20960%22%20width%3D%2224px%22%20fill%3D%22%23000%22%3E%3Cpath%20d%3D%22M80-160q-33%200-56.5-23.5T0-240h160q-33%200-56.5-23.5T80-320v-440q0-33%2023.5-56.5T160-840h640q33%200%2056.5%2023.5T880-760v440q0%2033-23.5%2056.5T800-240h160q0%2033-23.5%2056.5T880-160H80Zm400-40q17%200%2028.5-11.5T520-240q0-17-11.5-28.5T480-280q-17%200-28.5%2011.5T440-240q0%2017%2011.5%2028.5T480-200ZM160-320h640v-440H160v440Zm0%200v-440%20440Z%22%2F%3E%3C%2Fsvg%3E"
							/>
							<_Builtin.Block tag="div">{"CMS Portfolio"}</_Builtin.Block>
						</_Builtin.Link>
						<_Builtin.Link
							className={_utils.cx(_styles, "footer_links")}
							button={false}
							block="inline"
							options={{
								href: "#03",
							}}
						>
							<_Builtin.HtmlEmbed
								className={_utils.cx(_styles, "icons")}
								value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20class%3D%22custom-icon%22%20height%3D%2224px%22%20width%3D%2224px%22%20viewBox%3D%220%20-960%20960%20960%22%20fill%3D%22%23000%22%3E%3Cpath%20d%3D%22M720-240q25%200%2042.5-17.5T780-300q0-25-17.5-42.5T720-360q-25%200-42.5%2017.5T660-300q0%2025%2017.5%2042.5T720-240Zm0%20120q32%200%2057-14t42-39q-20-16-45.5-23.5T720-204q-28%200-53.5%207.5T621-173q17%2025%2042%2039t57%2014Zm-520%200q-33%200-56.5-23.5T120-200v-560q0-33%2023.5-56.5T200-840h560q33%200%2056.5%2023.5T840-760v268q-19-9-39-15.5t-41-9.5v-243H200v560h242q3%2022%209.5%2042t15.5%2038H200Zm0-120v40-560%20243-3%20280Zm80-40h163q3-21%209.5-41t14.5-39H280v80Zm0-160h244q32-30%2071.5-50t84.5-27v-3H280v80Zm0-160h400v-80H280v80ZM720-40q-83%200-141.5-58.5T520-240q0-83%2058.5-141.5T720-440q83%200%20141.5%2058.5T920-240q0%2083-58.5%20141.5T720-40Z%22%2F%3E%3C%2Fsvg%3E"
							/>
							<_Builtin.Block tag="div">{"Certification"}</_Builtin.Block>
						</_Builtin.Link>
						<_Builtin.Link
							className={_utils.cx(_styles, "footer_links")}
							button={false}
							block="inline"
							options={{
								href: "#05",
							}}
						>
							<_Builtin.HtmlEmbed
								className={_utils.cx(_styles, "icons")}
								value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20class%3D%22custom-icon%22%20width%3D%2224%22%20height%3D%2224%22%20fill%3D%22currentColor%22%20class%3D%22bi%20bi-list-task%22%20viewBox%3D%220%200%2016%2016%22%3E%0A%20%20%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M2%202.5a.5.5%200%200%200-.5.5v1a.5.5%200%200%200%20.5.5h1a.5.5%200%200%200%20.5-.5V3a.5.5%200%200%200-.5-.5zM3%203H2v1h1z%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M5%203.5a.5.5%200%200%201%20.5-.5h9a.5.5%200%200%201%200%201h-9a.5.5%200%200%201-.5-.5M5.5%207a.5.5%200%200%200%200%201h9a.5.5%200%200%200%200-1zm0%204a.5.5%200%200%200%200%201h9a.5.5%200%200%200%200-1z%22%2F%3E%0A%20%20%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M1.5%207a.5.5%200%200%201%20.5-.5h1a.5.5%200%200%201%20.5.5v1a.5.5%200%200%201-.5.5H2a.5.5%200%200%201-.5-.5zM2%207h1v1H2zm0%203.5a.5.5%200%200%200-.5.5v1a.5.5%200%200%200%20.5.5h1a.5.5%200%200%200%20.5-.5v-1a.5.5%200%200%200-.5-.5zm1%20.5H2v1h1z%22%2F%3E%0A%3C%2Fsvg%3E"
							/>
							<_Builtin.Block tag="div">{"Client Tasks"}</_Builtin.Block>
						</_Builtin.Link>
					</_Builtin.Block>
					<_Builtin.Block className={_utils.cx(_styles, "footer-block-two")} tag="div">
						<_Builtin.Block className={_utils.cx(_styles, "subheading")} tag="div">
							{"Watch & Learn"}
						</_Builtin.Block>
						<_Builtin.Link
							className={_utils.cx(_styles, "footer_links")}
							button={false}
							block="inline"
							options={{
								href: "#04",
							}}
						>
							<_Builtin.HtmlEmbed
								className={_utils.cx(_styles, "icons")}
								value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20class%3D%22custom-icon%22%20width%3D%2224%22%20height%3D%2224%22%20fill%3D%22currentColor%22%20class%3D%22bi%20bi-camera-reels%22%20viewBox%3D%220%200%2016%2016%22%3E%0A%20%20%3Cpath%20d%3D%22M6%203a3%203%200%201%201-6%200%203%203%200%200%201%206%200M1%203a2%202%200%201%200%204%200%202%202%200%200%200-4%200%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M9%206h.5a2%202%200%200%201%201.983%201.738l3.11-1.382A1%201%200%200%201%2016%207.269v7.462a1%201%200%200%201-1.406.913l-3.111-1.382A2%202%200%200%201%209.5%2016H2a2%202%200%200%201-2-2V8a2%202%200%200%201%202-2zm6%208.73V7.27l-3.5%201.555v4.35zM1%208v6a1%201%200%200%200%201%201h7.5a1%201%200%200%200%201-1V8a1%201%200%200%200-1-1H2a1%201%200%200%200-1%201%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M9%206a3%203%200%201%200%200-6%203%203%200%200%200%200%206M7%203a2%202%200%201%201%204%200%202%202%200%200%201-4%200%22%2F%3E%0A%3C%2Fsvg%3E"
							/>
							<_Builtin.Block tag="div">{"Blog"}</_Builtin.Block>
						</_Builtin.Link>
						<_Builtin.Link
							className={_utils.cx(_styles, "footer_links", "important")}
							button={false}
							block="inline"
							options={{
								href: "#",
							}}
						>
							<_Builtin.HtmlEmbed
								className={_utils.cx(_styles, "icons")}
								value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20class%3D%22custom-icon%22%20fill%3D%22currentColor%22%20class%3D%22bi%20bi-fire%22%20viewBox%3D%220%200%2016%2016%22%3E%0A%20%20%3Cpath%20d%3D%22M8%2016c3.314%200%206-2%206-5.5%200-1.5-.5-4-2.5-6%20.25%201.5-1.25%202-1.25%202C11%204%209%20.5%206%200c.357%202%20.5%204-2%206-1.25%201-2%202.729-2%204.5C2%2014%204.686%2016%208%2016m0-1c-1.657%200-3-1-3-2.75%200-.75.25-2%201.25-3C6.125%2010%207%2010.5%207%2010.5c-.375-1.25.5-3.25%202-3.5-.179%201-.25%202%201%203%20.625.5%201%201.364%201%202.25C11%2014%209.657%2015%208%2015%22%2F%3E%0A%3C%2Fsvg%3E"
							/>
							<_Builtin.Block tag="div">{"1 Hour Forward"}</_Builtin.Block>
						</_Builtin.Link>
					</_Builtin.Block>
					<_Builtin.Block className={_utils.cx(_styles, "footer-block-two")} tag="div">
						<_Builtin.Block className={_utils.cx(_styles, "subheading")} tag="div">
							{"Game Projects"}
						</_Builtin.Block>
						<_Builtin.Link
							className={_utils.cx(_styles, "footer_links")}
							button={false}
							block="inline"
							options={{
								href: "#05",
							}}
						>
							<_Builtin.HtmlEmbed
								className={_utils.cx(_styles, "icons")}
								value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20class%3D%22custom-icon%22%20fill%3D%22currentColor%22%20class%3D%22bi%20bi-controller%22%20viewBox%3D%220%200%2016%2016%22%3E%0A%20%20%3Cpath%20d%3D%22M11.5%206.027a.5.5%200%201%201-1%200%20.5.5%200%200%201%201%200m-1.5%201.5a.5.5%200%201%200%200-1%20.5.5%200%200%200%200%201m2.5-.5a.5.5%200%201%201-1%200%20.5.5%200%200%201%201%200m-1.5%201.5a.5.5%200%201%200%200-1%20.5.5%200%200%200%200%201m-6.5-3h1v1h1v1h-1v1h-1v-1h-1v-1h1z%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M3.051%203.26a.5.5%200%200%201%20.354-.613l1.932-.518a.5.5%200%200%201%20.62.39c.655-.079%201.35-.117%202.043-.117.72%200%201.443.041%202.12.126a.5.5%200%200%201%20.622-.399l1.932.518a.5.5%200%200%201%20.306.729q.211.136.373.297c.408.408.78%201.05%201.095%201.772.32.733.599%201.591.805%202.466s.34%201.78.364%202.606c.024.816-.059%201.602-.328%202.21a1.42%201.42%200%200%201-1.445.83c-.636-.067-1.115-.394-1.513-.773-.245-.232-.496-.526-.739-.808-.126-.148-.25-.292-.368-.423-.728-.804-1.597-1.527-3.224-1.527s-2.496.723-3.224%201.527c-.119.131-.242.275-.368.423-.243.282-.494.575-.739.808-.398.38-.877.706-1.513.773a1.42%201.42%200%200%201-1.445-.83c-.27-.608-.352-1.395-.329-2.21.024-.826.16-1.73.365-2.606.206-.875.486-1.733.805-2.466.315-.722.687-1.364%201.094-1.772a2.3%202.3%200%200%201%20.433-.335l-.028-.079zm2.036.412c-.877.185-1.469.443-1.733.708-.276.276-.587.783-.885%201.465a14%2014%200%200%200-.748%202.295%2012.4%2012.4%200%200%200-.339%202.406c-.022.755.062%201.368.243%201.776a.42.42%200%200%200%20.426.24c.327-.034.61-.199.929-.502.212-.202.4-.423.615-.674.133-.156.276-.323.44-.504C4.861%209.969%205.978%209.027%208%209.027s3.139.942%203.965%201.855c.164.181.307.348.44.504.214.251.403.472.615.674.318.303.601.468.929.503a.42.42%200%200%200%20.426-.241c.18-.408.265-1.02.243-1.776a12.4%2012.4%200%200%200-.339-2.406%2014%2014%200%200%200-.748-2.295c-.298-.682-.61-1.19-.885-1.465-.264-.265-.856-.523-1.733-.708-.85-.179-1.877-.27-2.913-.27s-2.063.091-2.913.27%22%2F%3E%0A%3C%2Fsvg%3E"
							/>
							<_Builtin.Block tag="div">{"Play Clown Hunt"}</_Builtin.Block>
						</_Builtin.Link>
						<_Builtin.Link
							className={_utils.cx(_styles, "footer_links")}
							button={false}
							block="inline"
							options={{
								href: "#05",
							}}
						>
							<_Builtin.HtmlEmbed
								className={_utils.cx(_styles, "icons")}
								value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20class%3D%22custom-icon%22%20width%3D%2224%22%20height%3D%2224%22%20fill%3D%22currentColor%22%20class%3D%22bi%20bi-list-task%22%20viewBox%3D%220%200%2016%2016%22%3E%0A%20%20%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M2%202.5a.5.5%200%200%200-.5.5v1a.5.5%200%200%200%20.5.5h1a.5.5%200%200%200%20.5-.5V3a.5.5%200%200%200-.5-.5zM3%203H2v1h1z%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M5%203.5a.5.5%200%200%201%20.5-.5h9a.5.5%200%200%201%200%201h-9a.5.5%200%200%201-.5-.5M5.5%207a.5.5%200%200%200%200%201h9a.5.5%200%200%200%200-1zm0%204a.5.5%200%200%200%200%201h9a.5.5%200%200%200%200-1z%22%2F%3E%0A%20%20%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M1.5%207a.5.5%200%200%201%20.5-.5h1a.5.5%200%200%201%20.5.5v1a.5.5%200%200%201-.5.5H2a.5.5%200%200%201-.5-.5zM2%207h1v1H2zm0%203.5a.5.5%200%200%200-.5.5v1a.5.5%200%200%200%20.5.5h1a.5.5%200%200%200%20.5-.5v-1a.5.5%200%200%200-.5-.5zm1%20.5H2v1h1z%22%2F%3E%0A%3C%2Fsvg%3E"
							/>
							<_Builtin.Block tag="div">{"Leaderboard"}</_Builtin.Block>
						</_Builtin.Link>
						<_Builtin.Link
							className={_utils.cx(_styles, "footer_links")}
							button={false}
							block="inline"
							options={{
								href: "#03",
							}}
						>
							<_Builtin.HtmlEmbed
								className={_utils.cx(_styles, "icons")}
								value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20class%3D%22custom-icon%22%20height%3D%2224px%22%20width%3D%2224px%22%20viewBox%3D%220%20-960%20960%20960%22%20fill%3D%22%23000%22%3E%3Cpath%20d%3D%22M720-240q25%200%2042.5-17.5T780-300q0-25-17.5-42.5T720-360q-25%200-42.5%2017.5T660-300q0%2025%2017.5%2042.5T720-240Zm0%20120q32%200%2057-14t42-39q-20-16-45.5-23.5T720-204q-28%200-53.5%207.5T621-173q17%2025%2042%2039t57%2014Zm-520%200q-33%200-56.5-23.5T120-200v-560q0-33%2023.5-56.5T200-840h560q33%200%2056.5%2023.5T840-760v268q-19-9-39-15.5t-41-9.5v-243H200v560h242q3%2022%209.5%2042t15.5%2038H200Zm0-120v40-560%20243-3%20280Zm80-40h163q3-21%209.5-41t14.5-39H280v80Zm0-160h244q32-30%2071.5-50t84.5-27v-3H280v80Zm0-160h400v-80H280v80ZM720-40q-83%200-141.5-58.5T520-240q0-83%2058.5-141.5T720-440q83%200%20141.5%2058.5T920-240q0%2083-58.5%20141.5T720-40Z%22%2F%3E%3C%2Fsvg%3E"
							/>
							<_Builtin.Block tag="div">{"Game Development"}</_Builtin.Block>
						</_Builtin.Link>
					</_Builtin.Block>
					<_Builtin.Block className={_utils.cx(_styles, "footer-block-two")} tag="div">
						<_Builtin.Block className={_utils.cx(_styles, "subheading")} tag="div">
							{"Community"}
						</_Builtin.Block>
						<Social />
						<SocialTestimonials />
					</_Builtin.Block>
					<_Builtin.Block className={_utils.cx(_styles, "footer-block-two")} tag="div">
						<_Builtin.Block className={_utils.cx(_styles, "subheading")} tag="div">
							{"Legal & Account"}
						</_Builtin.Block>
						<_Builtin.NotSupported _atom="DynamoWrapper" />
						<_Builtin.Link
							className={_utils.cx(_styles, "footer_links")}
							button={false}
							id="account"
							block="inline"
							options={{
								href: "#03",
							}}
						>
							<_Builtin.HtmlEmbed
								className={_utils.cx(_styles, "icons")}
								value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20class%3D%22custom-icon%22%20fill%3D%22currentColor%22%20class%3D%22bi%20bi-person%22%20viewBox%3D%220%200%2016%2016%22%3E%0A%20%20%3Cpath%20d%3D%22M8%208a3%203%200%201%200%200-6%203%203%200%200%200%200%206m2-3a2%202%200%201%201-4%200%202%202%200%200%201%204%200m4%208c0%201-1%201-1%201H3s-1%200-1-1%201-4%206-4%206%203%206%204m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516%2010.68%2010.289%2010%208%2010s-3.516.68-4.168%201.332c-.678.678-.83%201.418-.832%201.664z%22%2F%3E%0A%3C%2Fsvg%3E"
							/>
							<_Builtin.Block tag="div">{"Account"}</_Builtin.Block>
						</_Builtin.Link>
						<_Builtin.Link
							className={_utils.cx(_styles, "footer_links", "important")}
							button={false}
							id="email-me"
							block="inline"
							options={{
								href: "#05",
							}}
						>
							<_Builtin.HtmlEmbed
								className={_utils.cx(_styles, "icons")}
								value="%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20class%3D%22custom-icon%22%20fill%3D%22currentColor%22%20class%3D%22bi%20bi-envelope-at-fill%22%20viewBox%3D%220%200%2016%2016%22%3E%0A%20%20%3Cpath%20d%3D%22M2%202A2%202%200%200%200%20.05%203.555L8%208.414l7.95-4.859A2%202%200%200%200%2014%202zm-2%209.8V4.698l5.803%203.546zm6.761-2.97-6.57%204.026A2%202%200%200%200%202%2014h6.256A4.5%204.5%200%200%201%208%2012.5a4.49%204.49%200%200%201%201.606-3.446l-.367-.225L8%209.586zM16%209.671V4.697l-5.803%203.546.338.208A4.5%204.5%200%200%201%2012.5%208c1.414%200%202.675.652%203.5%201.671%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M15.834%2012.244c0%201.168-.577%202.025-1.587%202.025-.503%200-1.002-.228-1.12-.648h-.043c-.118.416-.543.643-1.015.643-.77%200-1.259-.542-1.259-1.434v-.529c0-.844.481-1.4%201.26-1.4.585%200%20.87.333.953.63h.03v-.568h.905v2.19c0%20.272.18.42.411.42.315%200%20.639-.415.639-1.39v-.118c0-1.277-.95-2.326-2.484-2.326h-.04c-1.582%200-2.64%201.067-2.64%202.724v.157c0%201.867%201.237%202.654%202.57%202.654h.045c.507%200%20.935-.07%201.18-.18v.731c-.219.1-.643.175-1.237.175h-.044C10.438%2016%209%2014.82%209%2012.646v-.214C9%2010.36%2010.421%209%2012.485%209h.035c2.12%200%203.314%201.43%203.314%203.034zm-4.04.21v.227c0%20.586.227.8.581.8.31%200%20.564-.17.564-.743v-.367c0-.516-.275-.708-.572-.708-.346%200-.573.245-.573.791%22%2F%3E%0A%3C%2Fsvg%3E"
							/>
							<_Builtin.Block tag="div">{"Email Me"}</_Builtin.Block>
						</_Builtin.Link>
					</_Builtin.Block>
				</_Builtin.Block>
				<_Builtin.Block className={_utils.cx(_styles, "hr", "top")} tag="div" />
				<_Builtin.Block className={_utils.cx(_styles, "footer-bottom")} tag="div">
					<_Builtin.Block
						className={_utils.cx(_styles, "copyright")}
						data-w-id="d480afc3-bd7b-0451-2eb0-c9d0d1c6584f"
						tag="div"
					>
						{"2025 © Crystal The Developer Inc. All rights reserved"}
					</_Builtin.Block>
				</_Builtin.Block>
			</_Builtin.Block>
		</_Component>
	);
}
