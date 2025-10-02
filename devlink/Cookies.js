"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import _styles from "./Cookies.module.css";
import * as _utils from "./utils";

export function Cookies({ as: _Component = _Builtin.Block }) {
	return (
		<_Component
			className={_utils.cx(_styles, "set-all-components-to-display-none-and-use-this-div-to-create-a-symbol")}
			tag="div"
		>
			<_Builtin.Block className={_utils.cx(_styles, "fs-cc-banner2_component")} tag="div" fs-cc="banner">
				<_Builtin.Block className={_utils.cx(_styles, "fs-cc-banner2_container")} tag="div">
					<_Builtin.Block className={_utils.cx(_styles, "fs-cc-banner2_text")} tag="div">
						{
							"By clicking “Accept”, you agree to the storing of cookies on your device to enhance site navigation, analyze site usage, and assist in our marketing efforts. View our "
						}
						<_Builtin.Link
							className={_utils.cx(_styles, "brand-link", "white")}
							button={false}
							block=""
							options={{
								href: "#",
							}}
						>
							{"Privacy Policy"}
						</_Builtin.Link>
						{" for more information."}
					</_Builtin.Block>
					<_Builtin.Block className={_utils.cx(_styles, "fs-cc-banner2_buttons-wrapper")} tag="div">
						<_Builtin.Link
							className={_utils.cx(_styles, "fs-cc-banner2_button", "fs-cc-button-alt")}
							button={true}
							fs-cc="deny"
							block=""
							options={{
								href: "#",
							}}
						>
							{"Deny"}
						</_Builtin.Link>
						<_Builtin.Link
							className={_utils.cx(_styles, "fs-cc-banner2_button")}
							button={true}
							fs-cc="allow"
							block=""
							options={{
								href: "#",
							}}
						>
							{"Accept"}
						</_Builtin.Link>
					</_Builtin.Block>
				</_Builtin.Block>
			</_Builtin.Block>
			<_Builtin.Block className={_utils.cx(_styles, "fs-cc-manager2_component")} tag="div" fs-cc="manager">
				<_Builtin.HtmlEmbed
					className={_utils.cx(_styles, "fs-cc-manager2_button")}
					role="button"
					tabIndex="0"
					title="Cookie Preferences"
					aria-label="Cookie Preferences"
					fs-cc="open-preferences"
					value="%3Csvg%20viewbox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cpath%20d%3D%22M9%208L9%208.01%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%3Cpath%20d%3D%22M16%2015L16%2015.01%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%3Cpath%20d%3D%22M10%2017L10%2017.01%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%3Cpath%20d%3D%22M11%2013L11%2013.01%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%3Cpath%20d%3D%22M6%2012L6%2012.01%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%3Cpath%20d%3D%22M12%2021C16.9706%2021%2021%2016.9706%2021%2012C21%2011.4402%2020.9489%2010.8924%2020.8511%2010.361C20.3413%2010.7613%2019.6985%2011%2019%2011C18.4536%2011%2017.9413%2010.8539%2017.5%2010.5987C17.0587%2010.8539%2016.5464%2011%2016%2011C14.3431%2011%2013%209.65685%2013%208C13%207.60975%2013.0745%207.23691%2013.2101%206.89492C11.9365%206.54821%2011%205.38347%2011%204C11%203.66387%2011.0553%203.34065%2011.1572%203.03894C6.58185%203.46383%203%207.31362%203%2012C3%2016.9706%207.02944%2021%2012%2021Z%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%3C%2Fsvg%3E"
				/>
			</_Builtin.Block>
			<_Builtin.Block
				className={_utils.cx(_styles, "fs-cc-prefs2_component")}
				tag="div"
				fs-cc="preferences"
				fs-cc-scroll="disable"
			>
				<_Builtin.FormWrapper className={_utils.cx(_styles, "fs-cc-prefs2_form-wrapper")}>
					<_Builtin.FormForm
						className={_utils.cx(_styles, "fs-cc-prefs2_form")}
						name="wf-form-Cookie-Preferences"
						data-name="Cookie Preferences"
						method="get"
						id="cookie-preferences"
					>
						<_Builtin.Block className={_utils.cx(_styles, "fs-cc-prefs2_close")} tag="div" fs-cc="close">
							<_Builtin.HtmlEmbed
								className={_utils.cx(_styles, "fs-cc-preferences2_close-icon")}
								value="%3Csvg%20fill%3D%22currentColor%22%20aria-hidden%3D%22true%22%20focusable%3D%22false%22%20viewbox%3D%220%200%2016%2016%22%3E%0A%09%3Cpath%20d%3D%22M9.414%208l4.293-4.293-1.414-1.414L8%206.586%203.707%202.293%202.293%203.707%206.586%208l-4.293%204.293%201.414%201.414L8%209.414l4.293%204.293%201.414-1.414L9.414%208z%22%2F%3E%0A%3C%2Fsvg%3E"
							/>
						</_Builtin.Block>
						<_Builtin.Block className={_utils.cx(_styles, "fs-cc-prefs2_content")} tag="div">
							<_Builtin.Block className={_utils.cx(_styles, "fs-cc-prefs2_space-small")} tag="div">
								<_Builtin.Block className={_utils.cx(_styles, "fs-cc-prefs2_title")} tag="div">
									{"Privacy Preferences"}
								</_Builtin.Block>
							</_Builtin.Block>
							<_Builtin.Block className={_utils.cx(_styles, "fs-cc-prefs2_option")} tag="div">
								<_Builtin.Block className={_utils.cx(_styles, "fs-cc-prefs2_toggle-wrapper")} tag="div">
									<_Builtin.Block className={_utils.cx(_styles, "fs-cc-prefs2_label")} tag="div">
										{"Essential cookies"}
									</_Builtin.Block>
									<_Builtin.Block tag="div">{"Required"}</_Builtin.Block>
								</_Builtin.Block>
							</_Builtin.Block>
							<_Builtin.Block className={_utils.cx(_styles, "fs-cc-prefs2_option")} tag="div">
								<_Builtin.Block className={_utils.cx(_styles, "fs-cc-prefs2_toggle-wrapper")} tag="div">
									<_Builtin.Block className={_utils.cx(_styles, "fs-cc-prefs2_label")} tag="div">
										{"Marketing cookies"}
									</_Builtin.Block>
									<_Builtin.FormCheckboxWrapper className={_utils.cx(_styles, "fs-cc-prefs2_checkbox-field")}>
										<_Builtin.FormCheckboxInput
											className={_utils.cx(_styles, "fs-cc-prefs2_checkbox")}
											type="checkbox"
											name="marketing-2"
											data-name="Marketing 2"
											required={false}
											checked={false}
											fs-cc-checkbox="marketing"
											id="marketing-2"
											form={{
												type: "checkbox-input",
												name: "Marketing 2",
											}}
											inputType="custom"
											customClassName="w-checkbox-input--inputType-custom"
										/>
										<_Builtin.FormInlineLabel
											className={_utils.cx(_styles, "fs-cc-prefs2_checkbox-label")}
											htmlFor="marketing"
										>
											{"Essential"}
										</_Builtin.FormInlineLabel>
									</_Builtin.FormCheckboxWrapper>
								</_Builtin.Block>
							</_Builtin.Block>
							<_Builtin.Block className={_utils.cx(_styles, "fs-cc-prefs2_option")} tag="div">
								<_Builtin.Block className={_utils.cx(_styles, "fs-cc-prefs2_toggle-wrapper")} tag="div">
									<_Builtin.Block className={_utils.cx(_styles, "fs-cc-prefs2_label")} tag="div">
										{"Personalization cookies"}
									</_Builtin.Block>
									<_Builtin.FormCheckboxWrapper className={_utils.cx(_styles, "fs-cc-prefs2_checkbox-field")}>
										<_Builtin.FormCheckboxInput
											className={_utils.cx(_styles, "fs-cc-prefs2_checkbox")}
											type="checkbox"
											name="personalization-2"
											data-name="Personalization 2"
											required={false}
											checked={false}
											fs-cc-checkbox="personalization"
											id="personalization-2"
											form={{
												type: "checkbox-input",
												name: "Personalization 2",
											}}
											inputType="custom"
											customClassName="w-checkbox-input--inputType-custom"
										/>
										<_Builtin.FormInlineLabel
											className={_utils.cx(_styles, "fs-cc-prefs2_checkbox-label")}
											htmlFor="personalization"
										>
											{"Essential"}
										</_Builtin.FormInlineLabel>
									</_Builtin.FormCheckboxWrapper>
								</_Builtin.Block>
							</_Builtin.Block>
							<_Builtin.Block className={_utils.cx(_styles, "fs-cc-prefs2_option")} tag="div">
								<_Builtin.Block className={_utils.cx(_styles, "fs-cc-prefs2_toggle-wrapper")} tag="div">
									<_Builtin.Block className={_utils.cx(_styles, "fs-cc-prefs2_label")} tag="div">
										{"Analytics cookies"}
									</_Builtin.Block>
									<_Builtin.FormCheckboxWrapper className={_utils.cx(_styles, "fs-cc-prefs2_checkbox-field")}>
										<_Builtin.FormCheckboxInput
											className={_utils.cx(_styles, "fs-cc-prefs2_checkbox")}
											type="checkbox"
											name="analytics-2"
											data-name="Analytics 2"
											required={false}
											checked={false}
											fs-cc-checkbox="analytics"
											id="analytics-2"
											form={{
												type: "checkbox-input",
												name: "Analytics 2",
											}}
											inputType="custom"
											customClassName="w-checkbox-input--inputType-custom"
										/>
										<_Builtin.FormInlineLabel
											className={_utils.cx(_styles, "fs-cc-prefs2_checkbox-label")}
											htmlFor="analytics"
										>
											{"Essential"}
										</_Builtin.FormInlineLabel>
									</_Builtin.FormCheckboxWrapper>
								</_Builtin.Block>
							</_Builtin.Block>
							<_Builtin.Block className={_utils.cx(_styles, "fs-cc-prefs2_buttons-wrapper")} tag="div">
								<_Builtin.Link
									className={_utils.cx(_styles, "fs-cc-prefs2_button", "fs-cc-button-alt")}
									button={true}
									fs-cc="deny"
									block=""
									options={{
										href: "#",
									}}
								>
									{"Reject all cookies"}
								</_Builtin.Link>
								<_Builtin.Link
									className={_utils.cx(_styles, "fs-cc-prefs2_button")}
									button={true}
									fs-cc="allow"
									block=""
									options={{
										href: "#",
									}}
								>
									{"Allow all cookies"}
								</_Builtin.Link>
								<_Builtin.Link
									className={_utils.cx(_styles, "fs-cc-prefs2_submit")}
									button={true}
									fs-cc="submit"
									block=""
									options={{
										href: "#",
									}}
								>
									{"Save preferences"}
								</_Builtin.Link>
							</_Builtin.Block>
						</_Builtin.Block>
					</_Builtin.FormForm>
					<_Builtin.FormSuccessMessage />
					<_Builtin.FormErrorMessage />
					<_Builtin.Block className={_utils.cx(_styles, "fs-cc-prefs2_overlay")} tag="div" fs-cc="close" />
				</_Builtin.FormWrapper>
			</_Builtin.Block>
		</_Component>
	);
}
