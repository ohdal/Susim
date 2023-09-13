import React, { useState, forwardRef, useImperativeHandle } from "react";
import styled from "styled-components";

const InputComp = styled.input`
  width: 100%;
  border: 1px solid #ffffff;
  background: rgba(0, 0, 0, 0.7);
  padding: 10px 120px 10px 20px;
  outline: none;
`;

const TextLengthDiv = styled.div`
  width: 120px;
  position: absolute;
  padding-right: 20px;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  text-align: right;
`;

type Props = {
  name: string;
  placeholder?: string;
  max?: number;
  min?: number;
  visibleCount: boolean;
  changeEventHandle?: <Params extends any[]>(...args: Params) => void;
};

export interface MainInputHandle {
  name: string;
  getText: () => string;
}

const MAX_DEFAULT = 100;
const MainInput = forwardRef<MainInputHandle, Props>((props, ref) => {
  const { name, placeholder, changeEventHandle, max, visibleCount } = props;
  const [text, setText] = useState("");

  useImperativeHandle(ref, () => ({
    name,
    getText: () => {
      return text;
    },
  }));

  return (
    <div className="my-3 relative">
      <InputComp
        name={name}
        placeholder={placeholder}
        value={text}
        onChange={(e) => {
          const text = e.target.value;
          const size = max ? max : MAX_DEFAULT;
          if (text.length > size) setText(text.slice(0, size));
          else setText(e.target.value);
          if (changeEventHandle) changeEventHandle(e.target.value);
        }}
      />
      {visibleCount && <TextLengthDiv>{`${text.length} / ${max ? max : MAX_DEFAULT}`}</TextLengthDiv>}
    </div>
  );
});

export default MainInput;
