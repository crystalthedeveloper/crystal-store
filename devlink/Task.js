"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import _styles from "./Task.module.css";
import * as _utils from "./utils";

export function Task({ as: _Component = _Builtin.Block }) {
	return (
		<_Component className={_utils.cx(_styles, "box")} tag="div" id="tasks">
			<_Builtin.Block className={_utils.cx(_styles, "header-wrap")} tag="div">
				<_Builtin.Heading tag="h1">{"Client Tasks"}</_Builtin.Heading>
				<_Builtin.Block className={_utils.cx(_styles, "hr")} tag="div" />
				<_Builtin.Paragraph>
					{
						"Client specific tasks may vary based on the type of website (e.g., e-commerce, cms, portfolio) and the technologies you choose to use."
					}
				</_Builtin.Paragraph>
			</_Builtin.Block>
			<_Builtin.Block className={_utils.cx(_styles, "content-wrap")} tag="div">
				<_Builtin.NotSupported _atom="DynamoWrapper" />
			</_Builtin.Block>
		</_Component>
	);
}
