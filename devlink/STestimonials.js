"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import _styles from "./STestimonials.module.css";
import * as _utils from "./utils";

export function STestimonials({ as: _Component = _Builtin.Block }) {
	return (
		<_Component className={_utils.cx(_styles, "box")} tag="section" id="testimonials">
			<_Builtin.Block
				className={_utils.cx(_styles, "header-wrap")}
				id={_utils.cx(_styles, "w-node-_3fd9d283-0be2-db7a-e26b-95cafc7b89d6-fc7b89d5")}
				tag="div"
			>
				<_Builtin.Heading tag="h2">{"Testimonials"}</_Builtin.Heading>
				<_Builtin.Block className={_utils.cx(_styles, "hr")} tag="div" />
				<_Builtin.Paragraph>
					{"Sincere thanks to everyone who has shared their positive experiences."}
				</_Builtin.Paragraph>
			</_Builtin.Block>
			<_Builtin.Block className={_utils.cx(_styles, "content-wrap")} tag="div">
				<_Builtin.NotSupported _atom="DynamoWrapper" />
			</_Builtin.Block>
		</_Component>
	);
}
