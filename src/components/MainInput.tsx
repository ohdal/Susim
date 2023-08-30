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

const MAX_SIZE = 150;
const MIN_SIZE = 10;
const MainInput = forwardRef<MainInputHandle, Props>((props, ref) => {
  const { name, placeholder, changeEventHandle, min, max } = props;
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
      min={min || MIN_SIZE}
      max={max || MAX_SIZE}
      onChange={(e) => {
        setText(e.target.value);
        if (changeEventHandle) changeEventHandle(e.target.value, max ? max : MAX_SIZE);
      }}
    />
  );
});

export default MainInput;
