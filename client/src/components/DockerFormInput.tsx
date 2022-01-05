import React, { Dispatch, MouseEventHandler, SetStateAction, useEffect, useState } from "react";
import "./DockerFormInput.css";

type Props = {
  lineId: number;
  setLineId: Dispatch<SetStateAction<number>>;
  inputComponents?: number[];
  setInputComponents: Dispatch<SetStateAction<number[] | undefined>>;
  option?: string;
  value?: string;
  dockerfileInputData: any[] | undefined;
  setDockerfileInputData: Dispatch<SetStateAction<any | undefined>>;
};
const options = ["FROM", "WORKDIR", "RUN", "ENTRYPOINT", "CMD", "ADD", "ENV", "ARG", "LABEL", "EXPOSE", "MAINTAINER"];
function DockerFormInput(props: Props) {
  const [inputValue, setInputValue] = useState<string>();

  useEffect(() => {
    setInputValue("");
  }, [props.value]);

  const selectOnChange = (e: any) => {
    let lineValue: string[] = [];
    if (props.dockerfileInputData) {
      lineValue = Object.values(props.dockerfileInputData[props.lineId]);
    }
    props.setDockerfileInputData({
      ...props.dockerfileInputData,
      [props.lineId]: { [e.target.value]: lineValue[0] },
    });
  };

  const deleteThisComponent = (e: any) => {
    props.setDockerfileInputData({ ...props.dockerfileInputData, [e.target.value]: "" });
    props.setInputComponents(
      props.inputComponents
        ? props.inputComponents.filter((inputComponent) => {
            return inputComponent !== e.target.value * 1;
          })
        : []
    );
  };
  const inputOnChange = (e: any) => {
    let lineSelected: string[] = [];
    setInputValue(e.target.value);
    if (props.dockerfileInputData) {
      lineSelected = Object.keys(props.dockerfileInputData[props.lineId]);
    }
    props.setDockerfileInputData({
      ...props.dockerfileInputData,
      [props.lineId]: { [lineSelected[0]]: e.target.value },
    });
  };

  return (
    <div>
      {props.option === "template" ? (
        ""
      ) : (
        <div className="input-component-div">
          <select name="" id="" className="input-component-select" onChange={selectOnChange}>
            {props.option ? (
              <option value={props.option}>{props.option}</option>
            ) : (
              <option value="">-옵션 선택-</option>
            )}
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
            value={inputValue ? inputValue : props.value}
            onChange={inputOnChange}
            name={"env"}
          />
          <button onClick={deleteThisComponent} value={props.lineId}>
            -
          </button>
        </div>
      )}
    </div>
  );
}
export default DockerFormInput;
