import React, { Dispatch, MouseEventHandler, SetStateAction } from "react";
import "./DockerFormInput.css";

type Props = {
  lineId: number;
  setLineId: Dispatch<SetStateAction<number>>;
  inputComponents?: number[];
  setInputComponents: Dispatch<SetStateAction<number[] | undefined>>;
  option?: string;
  value?: string;
};
const options = ["FROM", "WORKDIR", "RUN", "ENTRYPOINT", "CMD", "ENV", "ARG"];
function DockerFormInput(props: Props) {
  const deleteThisComponent = (e: any) => {
    props.setInputComponents(
      props.inputComponents
        ? props.inputComponents.filter((inputComponent) => {
            return inputComponent !== e.target.value * 1;
          })
        : []
    );
  };
  const inputOnChange = () => {};
  return (
    <div className="input-component-div">
      <select name="" id="" className="input-component-select">
        {props.option ? <option value={props.option}>{props.option}</option> : <option value="">-옵션 선택-</option>}
        <option value="" disabled>
          =============
        </option>
        {options.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
      <input
        placeholder={props.value ? props.value : "argument 입력"}
        value={props.value ? props.value : ""}
        onChange={inputOnChange}
        name={"env"}
      />
      <button onClick={deleteThisComponent} value={props.lineId}>
        -
      </button>
    </div>
  );
}
export default DockerFormInput;
