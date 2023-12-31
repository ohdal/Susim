import { useState, forwardRef, useImperativeHandle, useRef } from "react";
import styled from "styled-components";

const InputComp = styled.input`
  width: 100%;
  border: 1px solid #ffffff;
  border-radius: 30px;
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
  keydownHandle?: (key: string, text: string) => void;
  focusHandle?: () => void;
  mouseEventHandle?: () => void;
  blurEventHandle?: () => void;
};

export interface MainInputHandle {
  name: string;
  getText: () => string;
  focus: () => void;
}

const MAX_DEFAULT = 100;
const MainInput = forwardRef<MainInputHandle, Props>((props, ref) => {
  const {
    name,
    placeholder,
    changeEventHandle,
    blurEventHandle,
    mouseEventHandle,
    focusHandle,
    keydownHandle,
    max,
    visibleCount,
  } = props;
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    name,
    focus: () => {
      if (inputRef.current) inputRef.current.focus();
    },
    getText: () => {
      return text;
    },
  }));

  return (
    <div className="my-3 relative">
      <InputComp
        ref={inputRef}
        name={name}
        placeholder={placeholder}
        value={text}
        onKeyDown={(e) => {
          if (keydownHandle) keydownHandle(e.key, text);
        }}
        onFocus={() => {
          if (focusHandle) focusHandle();
        }}
        onMouseEnter={() => {
          if (mouseEventHandle) mouseEventHandle();
        }}
        onBlur={() => {
          if (blurEventHandle) blurEventHandle();
        }}
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
