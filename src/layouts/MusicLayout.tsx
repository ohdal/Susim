import { Outlet } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  width: 100%;
  height: calc(100% - 48px);

  > div {
    padding: 20px 10px;
  }

  .footer {
    width: 100%;
    height: 64px;
    position: fixed;
    let: 0;
    bottom: 0;
    padding: 20px;

    button,
    a {
      float: right;
      cursor: pointer;
      background: transparent;
      border: none;
      text-decoration: none;
      font-size: 24px;
      color: #ffffff;
    }
  }
`;


export default function MusicLayout() {
  return (
    <Container>
      <Outlet/>
    </Container>
  );
}
