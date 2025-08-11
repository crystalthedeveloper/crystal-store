"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./WebflowCms.module.css";

export function WebflowCms({ as: _Component = _Builtin.Block }) {
  return (
    <_Component
      className={_utils.cx(
        _styles,
        "box",
        "store-80",
        "w-node-_4964086f-af86-5426-b1cb-bbc6d615064a-d615064a"
      )}
      id={_utils.cx(_styles, "webflow-cms")}
      tag="div"
    >
      <_Builtin.Block
        className={_utils.cx(_styles, "header-wrap")}
        id={_utils.cx(
          _styles,
          "w-node-_4964086f-af86-5426-b1cb-bbc6d615064b-d615064a"
        )}
        tag="div"
      >
        <_Builtin.Heading tag="h2">{"CMS Portfolio"}</_Builtin.Heading>
        <_Builtin.Block className={_utils.cx(_styles, "hr")} tag="div" />
        <_Builtin.Paragraph>
          {
            "I specialize in building, customizing, and organizing dynamic digital content using Webflow’s powerful CMS—perfect for fast, scalable, and client-friendly websites. "
          }
          <_Builtin.Link
            className={_utils.cx(_styles, "brand-link")}
            button={false}
            block=""
            options={{
              href: "#",
            }}
          >
            <_Builtin.Strong>
              {"Explore other CMS platforms here."}
            </_Builtin.Strong>
          </_Builtin.Link>
          <br />
          <br />
          {"‍"}
          <_Builtin.Strong>{"Note:"}</_Builtin.Strong>
          {" The numbers below reflect years of experience."}
        </_Builtin.Paragraph>
      </_Builtin.Block>
      <_Builtin.Block
        className={_utils.cx(_styles, "content-wrap")}
        id={_utils.cx(
          _styles,
          "w-node-_4964086f-af86-5426-b1cb-bbc6d6150659-d615064a"
        )}
        tag="div"
      >
        <_Builtin.NotSupported _atom="DynamoWrapper" />
        <_Builtin.Block
          className={_utils.cx(_styles, "buttons-wrap")}
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
            {"MORECMS"}
          </_Builtin.Link>
        </_Builtin.Block>
      </_Builtin.Block>
    </_Component>
  );
}
