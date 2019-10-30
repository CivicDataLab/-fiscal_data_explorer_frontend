import React from "react";
import { Link } from "react-router-dom";
import Dropdown from "carbon-components-react/lib/components/Dropdown";

const FDropdown = props => (
  <div className={props.className}>
    <Dropdown
      ariaLabel="Dropdown"
      disabled={false}
      id="f-dropdown"
      invalidText="A valid value is required"
      itemToElement={null}
      items={props.items}
      label={props.label}
      light={false}
      onChange={function noRefCheck() {}}
      titleText={props.titleText}
      type="default"
    />
  </div>
);

FDropdown.defaultProps = {
  //yLabelFormat mnust be an array of 3. each value representing  'prefix', 'suffix' and multiplier
  className: "f-dropdown",
  titleText: "Dropdown Title",
  label: "Dropdown Label",
  items: [
    {
      id: "option-1",
      label: "Option 1"
    },
    {
      id: "option-2",
      label: "Option 2"
    },
    {
      id: "option-3",
      label: "Option 3"
    },
    {
      id: "option-4",
      label: "Option 4"
    }
  ]
};

export default FDropdown;
