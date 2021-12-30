import React, { Dispatch, MouseEventHandler, SetStateAction } from "react";
import "./DockerFormInput.css";

type Props = {
  inputIndex: number;
  setInputIndex: Dispatch<SetStateAction<number>>;
  inputComponents: number[];
  setInputComponents: Dispatch<SetStateAction<number[]>>;
};
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
        <option value="FROM">FROM</option>
        <option value="WORKDIR">WORKDIR</option>
        <option value="RUN">RUN</option>
        <option value="ENTRYPOINT">ENTRYPOINT</option>
        <option value="CMD">CMD</option>
        <option value="ENV">ENV</option>
        <option value="ARG">ARG</option>
      </select>
      <input placeholder={props.inputIndex + ""} name={"env"} />
      <button onClick={deleteThisComponent} value={props.inputIndex}>
        -
      </button>
    </div>
  );
}
export default DockerFormInput;
