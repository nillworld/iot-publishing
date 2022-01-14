import React, { Dispatch, MouseEventHandler, SetStateAction, useEffect, useState } from "react";
import "./DockerFormInput.css";

type Props = {
  lineId: number;
  setLineId: Dispatch<SetStateAction<number>>;
  inputComponents?: number[];
  setInputComponents: Dispatch<SetStateAction<number[] | undefined>>;
  option?: string;
  value?: string;
  dockerFormData: any[] | undefined;
  setDockerFormData: Dispatch<SetStateAction<any | undefined>>;
};
const options = ["FROM", "WORKDIR", "RUN", "ENTRYPOINT", "CMD", "ADD", "ENV", "ARG", "LABEL", "EXPOSE", "MAINTAINER"];
function DockerFormInput(props: Props) {
  const [inputValue, setInputValue] = useState<string>();

  useEffect(() => {
    setInputValue("");
  }, [props.value]);

  const selectOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    let lineValue: string[] = [];
    if (props.dockerFormData) {
      lineValue = Object.values(props.dockerFormData[props.lineId]);
    }
    props.setDockerFormData({
      ...props.dockerFormData,
      [props.lineId]: { [e.target.value]: lineValue[0] },
    });
  };

  const deleteThisComponent = (e: any) => {
    let tempdockerFormData = { ...props.dockerFormData };
    delete tempdockerFormData[e.target.value];
    props.setDockerFormData(tempdockerFormData);
    props.setInputComponents(
      props.inputComponents
        ? props.inputComponents.filter((inputComponent) => {
            return inputComponent !== e.target.value * 1;
          })
        : []
    );
  };

  const optionOnChange = (e: React.ChangeEvent<HTMLOptionElement>) => {
    let dockerFormDataValues: string[] = [];
    if (props.dockerFormData) {
      dockerFormDataValues = Object.values(props.dockerFormData[props.lineId]);
    }
    props.setDockerFormData({ ...props.dockerFormData, [props.lineId]: { [e.target.value]: dockerFormDataValues[0] } });
  };
  const inputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(props.dockerFormData);
    let dockerFormDataKeys: string[] = [];
    setInputValue(e.target.value);
    if (props.dockerFormData) {
      dockerFormDataKeys = Object.keys(props.dockerFormData[props.lineId]);
    }
    props.setDockerFormData({
      ...props.dockerFormData,
      [props.lineId]: { [dockerFormDataKeys[0]]: e.target.value },
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
              <option value={option} key={option} onChange={optionOnChange}>
                {option}
              </option>
            ))}
          </select>
          <input
            placeholder={props.value ? props.value : "argument 입력"}
            value={inputValue ? inputValue : props.value || ""}
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
