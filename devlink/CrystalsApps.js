"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import _styles from "./CrystalsApps.module.css";
import * as _utils from "./utils";

export function CrystalsApps({ as: _Component = _Builtin.Block }) {
	return (
		<_Component className={_utils.cx(_styles, "box")} tag="div" id="crystals-apps">
			<_Builtin.Block
				className={_utils.cx(_styles, "header-wrap", "center")}
				id={_utils.cx(_styles, "w-node-_95e9337c-4730-c118-36bf-04235d035c1d-5d035c1c")}
				tag="div"
			>
				<_Builtin.Heading tag="h2">{"Crystal's Apps"}</_Builtin.Heading>
				<_Builtin.Block className={_utils.cx(_styles, "hr")} tag="div" />
				<_Builtin.Paragraph>
					<_Builtin.Strong>{"Webflow apps "}</_Builtin.Strong>
					{
						"Explore custom tools built to enhance your Webflow projects — from theme toggles to advanced integrations. Each app is designed to save you time, improve user experience, and require zero coding. "
					}
					<br />
					<_Builtin.Strong>{"More coming soon!"}</_Builtin.Strong>
				</_Builtin.Paragraph>
			</_Builtin.Block>
			<_Builtin.Block
				className={_utils.cx(_styles, "content-wrap")}
				id={_utils.cx(_styles, "w-node-_95e9337c-4730-c118-36bf-04235d035c28-5d035c1c")}
				tag="div"
			>
				<_Builtin.NotSupported _atom="DynamoWrapper" />
			</_Builtin.Block>
		</_Component>
	);
}
