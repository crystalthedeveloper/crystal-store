"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./Services.module.css";

export function Services({ as: _Component = _Builtin.Block }) {
  return (
    <_Component
      className={_utils.cx(
        _styles,
        "box",
        "w-node-_35d97185-2ebc-7dea-4a3c-5cfcc7798244-c7798244"
      )}
      id={_utils.cx(_styles, "core-services")}
      tag="section"
    >
      <_Builtin.Block
        className={_utils.cx(_styles, "header-wrap")}
        id={_utils.cx(
          _styles,
          "w-node-_35d97185-2ebc-7dea-4a3c-5cfcc7798245-c7798244"
        )}
        tag="div"
      >
        <_Builtin.Heading
          id={_utils.cx(
            _styles,
            "w-node-_35d97185-2ebc-7dea-4a3c-5cfcc7798246-c7798244"
          )}
          tag="h2"
        >
          {"Core Services"}
        </_Builtin.Heading>
        <_Builtin.Block className={_utils.cx(_styles, "hr")} tag="div" />
        <_Builtin.Paragraph>
          {"Everything you need to launch, scale, and own your website."}
        </_Builtin.Paragraph>
      </_Builtin.Block>
      <_Builtin.Block
        className={_utils.cx(_styles, "content-wrap")}
        id={_utils.cx(
          _styles,
          "w-node-_7a56bca7-fcae-b437-2a00-f23c3a698ef8-c7798244"
        )}
        tag="div"
      >
        <_Builtin.NotSupported _atom="DynamoWrapper" />
      </_Builtin.Block>
    </_Component>
  );
}
