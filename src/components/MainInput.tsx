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
};

export interface MainInputHandle {
  name: string;
  getText: () => string;
}

const MainInput = forwardRef<MainInputHandle, Props>((props, ref) => {
  const { name, placeholder } = props;
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
      onChange={(e) => {
        setText(e.target.value);
      }}
    />
  );
});

export default MainInput;
