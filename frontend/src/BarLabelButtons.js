import { ButtonGroup } from "react-bootstrap";
import { Button } from "react-bootstrap";
import "./BarLabelButtons.css";

const BarLabelButtons = (props) => {
  return (
    <div
      style={{
        flex: "1",
        maxWidth: "500px",
        minWidth: "0",
        // height: "15px",
        paddingLeft: "2px",
        marginLeft: "auto",
        marginRight: "0.5%",
      }}
    >
      <ButtonGroup size="sm" className={`d-flex theme${props.theme}`}>
        <Button
          checked
          onClick={() => {
            // const url = new URL(window.location);
            // url.searchParams.set("labeltype", "premium");
            // window.location = url;
            props.setBarLabelType("Premium");
          }}
          className={`btn ${
            props.width < 480
              ? " btn10"
              : props.width < 500
              ? " btn105"
              : " btn11"
          } leftbtn btn-block align-items-center text-center ${
            props.barLabelType === "Premium" ? "active" : ""
          }`}
          size="sm"
          color="primary"
          block
          // label={"formElement"}
        >
          Premium
        </Button>
        <Button
          onClick={() => {
            // const url = new URL(window.location);
            // url.searchParams.set("labeltype", "volume");
            // window.location = url;
            props.setBarLabelType("Volume");
          }}
          className={`btn ${
            props.width < 480
              ? " btn10"
              : props.width < 500
              ? " btn105"
              : " btn11"
          } btn-block align-items-center text-center ${
            props.barLabelType === "Volume" ? "active" : ""
          }`}
          // color="primary"
          size="sm"
          block
          // label={"formElement"}
        >
          Volume
        </Button>
        <Button
          onClick={() => {
            // const url = new URL(window.location);
            // url.searchParams.set("labeltype", "probability");
            // window.location = url;
            props.setBarLabelType("Probability");
          }}
          className={`btn ${
            props.width < 480
              ? " btn10"
              : props.width < 500
              ? " btn105"
              : " btn11"
          } btn-block align-items-center text-center ${
            props.barLabelType === "Probability" ? "active" : ""
          }`}
          color="primary"
          size="sm"
          block
          label={"formElement"}
        >
          Probability
        </Button>
        <Button
          onClick={() => {
            // const url = new URL(window.location);
            // url.searchParams.set("labeltype", "%change");
            // window.location = url;
            props.setBarLabelType("Change %");
          }}
          className={`btn ${
            props.width < 480
              ? " btn10"
              : props.width < 500
              ? " btn105"
              : " btn11"
          } btn-block align-items-center text-center ${
            props.barLabelType === "Change %" ? "active" : ""
          }`}
          color="primary"
          size="sm"
          block
          // label={"formElement"}
        >
          Change %
        </Button>
        <Button
          onClick={() => {
            props.setBarLabelType("Max Profit");

            // const url = new URL(window.location);
            // url.searchParams.set("labeltype", "maxprofit");
            // window.location = url;
          }}
          className={`btn ${
            props.width < 480
              ? " btn10"
              : props.width < 500
              ? " btn105"
              : " btn11"
          } rightbtn btn-block align-items-center text-center ${
            props.barLabelType === "Max Profit" ? "active" : ""
          }`}
          color="primary"
          size="sm"
          block
          // label={"formElement"}
        >
          Max Profit
        </Button>
      </ButtonGroup>
    </div>
  );
};
export default BarLabelButtons;
