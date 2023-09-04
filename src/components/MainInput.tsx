import React, { useState, forwardRef, useImperativeHandle } from "react";
import styled from "styled-components";

const InputComp = styled.input`
  width: 100%;
  border: 1px solid #ffffff;
  background: rgba(0, 0, 0, 0.7);
  padding: 10px 20px;
  margin: 12px 0;
  outline: none;
`;

type Props = {
  name: string;
  placeholder?: string;
  max?: number;
  min?: number;
  changeEventHandle?: <Params extends any[]>(...args: Params) => void;
};

export interface MainInputHandle {
  name: string;
  getText: () => string;
}

const MAX_DEFAULT = 100;
const MainInput = forwardRef<MainInputHandle, Props>((props, ref) => {
  const { name, placeholder, changeEventHandle, max } = props;
  const [text, setText] = useState("");

  useImperativeHandle(ref, () => ({
    name,
    getText: () => {
      return text;
    },
  }));

  return (
    <InputComp
      name={name}
      placeholder={placeholder}
      value={text}
      onChange={(e) => {
        const text = e.target.value;
        const size = max ? max : MAX_DEFAULT;
        if (text.length > size) setText(text.slice(0, size));
        else setText(e.target.value);
        if (changeEventHandle) changeEventHandle(e.target.value, size);
      }}
    />
  );
});

export default MainInput;
