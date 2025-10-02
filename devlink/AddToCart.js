"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import _styles from "./AddToCart.module.css";
import * as _utils from "./utils";

export function AddToCart({ as: _Component = _Builtin.HtmlEmbed }) {
	return (
		<_Component
			className={_utils.cx(_styles, "add-to-cart-nav")}
			value="%3C!--%20%F0%9F%9B%92%20Cart%20Modal%20--%3E%0A%3Cdiv%20id%3D%22cart-modal%22%20class%3D%22cart-modal%20hidden%22%3E%0A%20%20%3Cdiv%20class%3D%22cart-content%22%3E%0A%20%20%20%20%3Cdiv%20class%3D%22cart-header%22%3E%0A%20%20%20%20%20%20%3Ch3%3EYour%20Cart%3C%2Fh3%3E%0A%20%20%20%20%20%20%3Cbutton%20class%3D%22close-cart%22%20onclick%3D%22document.getElementById('cart-modal').classList.add('hidden')%22%3E%E2%9C%95%3C%2Fbutton%3E%0A%20%20%20%20%3C%2Fdiv%3E%0A%20%20%20%20%3Cdiv%20class%3D%22cart-items%22%3E%3C%2Fdiv%3E%0A%20%20%20%20%3Cdiv%20class%3D%22cart-footer%22%3E%0A%20%20%20%20%20%20%3Cdiv%20class%3D%22cart-total-row%22%3E%0A%20%20%20%20%20%20%20%20%3Cstrong%20class%3D%22cart-total-row-text%22%3ETotal%3A%3C%2Fstrong%3E%0A%20%20%20%20%20%20%20%20%3Cspan%20class%3D%22cart-total%22%3E%240.00%20CAD%3C%2Fspan%3E%0A%20%20%20%20%20%20%3C%2Fdiv%3E%0A%20%20%20%20%20%20%3Cbutton%20id%3D%22checkout-button%22%20class%3D%22checkout-button%22%3ECheckout%3C%2Fbutton%3E%0A%20%20%20%20%3C%2Fdiv%3E%0A%20%20%3C%2Fdiv%3E%0A%3C%2Fdiv%3E"
		/>
	);
}
