"use client";
import React from "react";
import * as _Builtin from "./_Builtin";
import * as _utils from "./utils";
import _styles from "./CmsPortfolio.module.css";

export function CmsPortfolio({ as: _Component = _Builtin.Block }) {
  return (
    <_Component
      className={_utils.cx(_styles, "box", "store-80")}
      tag="section"
      id="cms"
    >
      <_Builtin.Block
        className={_utils.cx(_styles, "header-wrap")}
        id={_utils.cx(
          _styles,
          "w-node-_2bbb3388-c74c-e0b3-2e35-422c2e89e0b7-2e89e0b6"
        )}
        tag="div"
      >
        <_Builtin.Heading tag="h1">{"CMS Portfolio"}</_Builtin.Heading>
        <_Builtin.Block className={_utils.cx(_styles, "hr")} tag="div" />
        <_Builtin.Paragraph>
          {
            "I specialize in efficiently creating, customizing, and organizing dynamic digital content through powerful content management systems and tailored code solutions."
          }
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
          "w-node-_2bbb3388-c74c-e0b3-2e35-422c2e89e0bd-2e89e0b6"
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
            {"About me"}
          </_Builtin.Link>
          <_Builtin.Link
            className={_utils.cx(_styles, "button", "secondary")}
            button={true}
            block=""
            options={{
              href: "https://cdn.prod.website-files.com/627d638bf3227602da3644f3/6888ac6f6cb0ffc13d22726b_crystal-lewis-resume.pdf",
              target: "_blank",
            }}
          >
            {"My Resume"}
          </_Builtin.Link>
        </_Builtin.Block>
      </_Builtin.Block>
    </_Component>
  );
}
