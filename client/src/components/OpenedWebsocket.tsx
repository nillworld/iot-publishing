import * as React from "react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import "../App.css";
import DockerFormInput from "./DockerFormInput";
import "./OpenedWebsocket.css";
import TransferMessage from "./TransferMessage";

type Props = {
  backWebSocket: WebSocket | undefined;
  setMessageForBack: Dispatch<SetStateAction<Message | undefined>>;
  downloadedPercent: string | undefined;
  generatorState: string;
};

type Message = {
  state: string | undefined;
  generatorIP?: {} | undefined;
  dockerFormData?: {} | undefined;
  projectDir?: string;
};

function OpenedWebsocket(props: Props) {
  const [selectedFile, setSelectedFile] = useState<File>();
  const [fileSendCheck, setFileSendCheck] = useState<boolean>();
  const [lineId, setLineId] = useState<number>(0);
  const [lineOption, setLineOption] = useState<string[]>();
  const [lineValue, setLineValue] = useState<string[]>();
  const [optionSelect, setOptionSelect] = useState<string>();
  const [inputComponents, setInputComponents] = useState<number[]>();
  const [dockerFormData, setDockerFormData] = useState<any>({});

  const templateForms = [
    {
      0: { template: "-Template-" },
    },
    {
      0: { template: "Node 16" },
      1: { FROM: "node:16-alpine3.11" },
      2: { WORKDIR: "/app" },
      3: { COPY: "package*.json /app" },
      4: { RUN: "npm install" },
      5: { COPY: "./project /app" },
      6: { CMD: '[ "node", "server.js" ]' },
    },
    {
      0: { template: "Node 14" },
      1: { FROM: "node:14-alpine" },
      2: { WORKDIR: "/app" },
      3: { COPY: "package*.json /app" },
      4: { RUN: "npm install" },
      5: { COPY: "./project /app" },
      6: { CMD: '[ "node", "server.js" ]' },
    },
    {
      0: { template: "Python 3.9" },
      1: { FROM: "python:3.9-alpine" },
      2: { WORKDIR: "/app" },
      3: { COPY: "./project /app" },
    },
    // https://docs.docker.com/language/java/build-images/
    {
      0: { template: "Java 16" },
      1: { FROM: "openjdk:16-alpine" },
      2: { WORKDIR: "/app" },
      3: { COPY: "./project /app" },
      4: { RUN: "javac Test.java" },
      5: { CMD: '["java", "Test"]' },
    },
  ];

  useEffect(() => {
    props.setMessageForBack({ state: "SETTING_DOCKER_FORM", dockerFormData: dockerFormData });
  }, [dockerFormData]);

  const setTemplateForm = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOptionSelect(e.target.value);
    const jsonTemplate = JSON.parse(e.target.value);
    const jsonTemplateKeys: string[] = Object.keys(jsonTemplate);
    const jsonTemplateValues: string[] = Object.values(jsonTemplate);

    let jsonTemplateKeysToInt: number[] = [];
    jsonTemplateKeys.map((key) => {
      jsonTemplateKeysToInt.push(parseInt(key));
    });
    let templateKeys: Array<string> = [];
    let templateValues: Array<string> = [];
    jsonTemplateValues.map((templateLineData) => {
      templateKeys.push(Object.keys(templateLineData)[0]);
      templateValues.push(Object.values(templateLineData)[0]);
    });
    setDockerFormData(jsonTemplate);
    setInputComponents(jsonTemplateKeysToInt);
    setLineId(jsonTemplateKeysToInt.length);
    setLineOption(templateKeys);
    setLineValue(templateValues);
    if (templateValues) {
    }
  };

  const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const dockerBuild = () => {
    props.setMessageForBack({ state: "SET_DOCKER_FORM", dockerFormData: dockerFormData });
    setFileSendCheck(true);
  };

  const appendInput = () => {
    if (inputComponents) {
      setInputComponents([...inputComponents, lineId === 0 ? lineId + 1 : lineId]);
    } else {
      setInputComponents([lineId === 0 ? lineId + 1 : lineId]);
    }
    setDockerFormData({ ...dockerFormData, [lineId === 0 ? lineId + 1 : lineId]: "" });
    setLineId(lineId === 0 ? lineId + 2 : lineId + 1);
  };

  const clearValue = () => {
    setOptionSelect("");
    setInputComponents([]);
    setDockerFormData({});
  };

  return fileSendCheck ? (
    <TransferMessage downloadedPercent={props.downloadedPercent} generatorState={props.generatorState} />
  ) : (
    <div className="App">
      <header className="App-header">
        <div className="form-div">
          <select onChange={setTemplateForm} value={optionSelect}>
            {templateForms.map((templateForm, index) => (
              <option value={JSON.stringify(templateForm)} key={index}>
                {templateForm[0]?.template}
              </option>
            ))}
          </select>
          <div>
            {inputComponents
              ? inputComponents.map((lineId: number) => (
                  <DockerFormInput
                    key={lineId}
                    lineId={lineId}
                    setLineId={setLineId}
                    setInputComponents={setInputComponents}
                    inputComponents={inputComponents}
                    option={lineOption ? lineOption[lineId] : ""}
                    value={lineValue ? lineValue[lineId] : ""}
                    dockerFormData={dockerFormData}
                    setDockerFormData={setDockerFormData}
                  />
                ))
              : ""}
            <button onClick={appendInput}>ADD Instruction</button>
          </div>
          <div className="filebtn-div">
            <label className="filebtn">
              프로젝트 선택
              <input placeholder="arg 입력~" type="file" name={"file"} onChange={onChangeFile} />
            </label>
            <div className="fileName-div">{selectedFile ? selectedFile.name : ".tar파일 선택"}</div>
          </div>

          <div>
            <button className="dockerform-btn" onClick={dockerBuild} disabled={fileSendCheck}>
              도커로 빌드하기
            </button>
            <button onClick={clearValue}>초기화</button>
          </div>
          {/* <div>{JSON.stringify(dockerFormData)}</div> */}
        </div>
      </header>
    </div>
  );
}
export default OpenedWebsocket;
