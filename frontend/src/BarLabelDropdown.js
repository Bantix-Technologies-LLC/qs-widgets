import DropdownButton from "react-bootstrap/DropdownButton";
import { Dropdown } from "react-bootstrap";
import "./BarLabelDropdown.css";
// import "./EventConGraph.css";

const BarLabelDropdown = (props) => {
  return (
    <div
      style={{
        flex: props.width < 280 ? "0" : "0 0 70px",
        // maxWidth: "500px",
        minWidth: "0",
        width: "10px",
        // height: "15px",
        // paddingLeft: "2px",
        marginLeft: "auto",
        justifyContent: "flex-end",
        marginRight: "1%",
        display: "flex",
      }}
    >
      <DropdownButton
        className={`d-flex theme${props.theme} ${
          props.width < 280
            ? "smallDropdownTitle"
            : props.width < 330
            ? "medDropdownTitle"
            : ""
        }`}
        id="dropdown-basic-button"
        title={props.width < 280 ? "Bar Label" : props.barLabelType}
        size="sm"
        align={{ sm: "end" }}
      >
        <Dropdown.Item
          size="sm"
          active={props.barLabelType === "Premium"}
          onClick={() => {
            props.setBarLabelType("Premium");
          }}
        >
          Premium
        </Dropdown.Item>
        <Dropdown.Item
          active={props.barLabelType === "Volume"}
          size="sm"
          onClick={() => {
            props.setBarLabelType("Volume");
          }}
        >
          Volume
        </Dropdown.Item>
        <Dropdown.Item
          active={props.barLabelType === "Probability"}
          size="sm"
          onClick={() => {
            props.setBarLabelType("Probability");
          }}
        >
          Probability
        </Dropdown.Item>
        <Dropdown.Item
          active={props.barLabelType === "Change %"}
          size="sm"
          onClick={() => {
            props.setBarLabelType("Change %");
          }}
        >
          Change %
        </Dropdown.Item>
        <Dropdown.Item
          active={props.barLabelType === "Max Profit"}
          size="sm"
          onClick={() => {
            props.setBarLabelType("Max Profit");
          }}
        >
          Max Profit
        </Dropdown.Item>
      </DropdownButton>
    </div>
  );
};
export default BarLabelDropdown;
