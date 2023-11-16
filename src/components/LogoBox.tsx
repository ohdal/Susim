import styled from "styled-components";
import logo_1 from "../assets/images/logo_1.png";
import logo_2 from "../assets/images/logo_2.png";
import logo_3 from "../assets/images/logo_3.png";

const Container = styled.div`
  width: fit-content;
  height: 100%;

  img {
    float: left;
    height: 100%;

    &:not(:last-child) {
      margin-right: 10px;
    }
  }
`;

type Props = {
  position: string;
};

const positonStyle: { [index: string]: object } = {
  left: { float: "left" },
  center: { margin: "0 auto" },
  right: { float: "right" },
};
const imgList = [logo_1, logo_2, logo_3];
export default function LogoBox(Props: Props) {
  const { position } = Props;

  return (
    <Container className="pl-4 pr-4" style={positonStyle[position]}>
      {imgList.map((v) => {
        return <img src={v} />;
      })}
    </Container>
  );
}
