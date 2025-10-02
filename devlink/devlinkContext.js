"use client";
import React from "react";
import { createIX2Engine } from "./devlink";
import { InteractionsProvider } from "./interactions";
export const DevLinkContext = React.createContext({});
export const DevLinkProvider = ({ children, ...context }) =>
	React.createElement(
		DevLinkContext.Provider,
		{ value: context },
		React.createElement(InteractionsProvider, { createEngine: createIX2Engine }, children),
	);
