import React, { Dispatch, MouseEventHandler, SetStateAction } from "react";
import "./DockerFormInput.css";

type Props = {
  inputIndex: number;
  setInputIndex: Dispatch<SetStateAction<number>>;
  inputComponents: number[];
  setInputComponents: Dispatch<SetStateAction<number[] | undefined>>;
  option?: string;
  value?: string;
};
const options = ["FROM", "WORKDIR", "RUN", "ENTRYPOINT", "CMD", "ENV", "ARG"];
function DockerFormInput(props: Props) {
  const deleteThisComponent = (e: any) => {
    console.log(e.target.value);
    console.log(props.inputComponents);
    props.setInputComponents(
      props.inputComponents.filter((inputComponent) => {
        console.log(inputComponent, e.target.value);
        return inputComponent !== e.target.value * 1;
      })
    );
  };
  return (
    <div className="input-component-div">
      <select name="" id="" className="input-component-select">
        <option value="">-옵션 선택-</option>
        {options.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
      <input placeholder={props.inputIndex + ""} name={"env"} />
      <button onClick={deleteThisComponent} value={props.inputIndex}>
        -
      </button>
    </div>
  );
}
export default DockerFormInput;
