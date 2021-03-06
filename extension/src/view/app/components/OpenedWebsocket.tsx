import * as React from "react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import "../App.css";
import DockerFormInput from "./DockerFormInput";
import "./OpenedWebsocket.css";
import TransferMessage from "./TransferMessage";

type Props = {
  backWebSocket: WebSocket | undefined;
  setMessageForBack: Dispatch<SetStateAction<Message | undefined>>;
  projectDir: string | undefined;
  saveDir: string | undefined;
  downloadedPercent: string | undefined;
  generatorState: string;
  setGeneratorState: Dispatch<SetStateAction<string>>;
  preGeneratorState: string;
};

type Message = {
  state: string | undefined;
  generatorIP?: {} | undefined;
  dockerFormData?: {} | undefined;
  architecture?: string | undefined;
  dockerName?: string | undefined;
  dockerTag?: string | undefined;
};

function OpenedWebsocket(props: Props) {
  const [selectedFile, setSelectedFile] = useState<string>();
  const [fileSendCheck, setFileSendCheck] = useState<boolean>();
  const [fileReSendCheck, setFileReSendCheck] = useState<boolean>();
  const [lineId, setLineId] = useState<number>(0);
  const [lineOption, setLineOption] = useState<string[]>();
  const [lineValue, setLineValue] = useState<string[]>();
  const [lineInvisibility, setLineInvisibility] = useState<boolean[]>();
  const [optionSelect, setOptionSelect] = useState<string>();
  const [inputComponents, setInputComponents] = useState<number[]>();
  const [dockerFormData, setDockerFormData] = useState<any>({});
  const [selectedArchitecture, setSelectedArchitecture] = useState<string>("linux/arm64");
  const [dockerImgName, setDockerImgName] = useState<string>("tobesoft");
  const [dockerImgTag, setDockerImgTag] = useState<string>("0.1");
  const [selectedSaveDir, setSelectedSaveDir] = useState<string>();

  const templateForms = [
    {
      0: { template: "-Template-" },
    },
    {
      0: { template: "Java 11 and Node 16" },
      1: { FROM: "node:16" },
      2: {
        RUN: "apt-get update && apt-get -y install default-jre vim nano net-tools openssh-server",
        invisibility: true,
      },
      3: { WORKDIR: "/app" },
      4: { COPY: "./project /app" },
    },
    {
      0: { template: "Node 16" },
      1: { FROM: "node:16" },
      2: { RUN: "apt-get update && apt-get install -y vim nano net-tools openssh-server" },
      3: { WORKDIR: "/app" },
      4: { COPY: "package*.json /app" },
      5: { COPY: "./project /app" },
    },
    {
      0: { template: "Node 14" },
      1: { FROM: "node:14-alpine", invisibility: true },
      2: { WORKDIR: "/app", invisibility: true },
      3: { COPY: "package*.json /app", invisibility: true },
      4: { RUN: "npm install", invisibility: true },
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

  const architectureOptions = [
    "linux/arm64",
    "linux/amd64",
    "linux/riscv64",
    "linux/ppc64le",
    "linux/s390x",
    "linux/386",
    "linux/arm/v7",
    "linux/arm/v6",
  ];

  useEffect(() => {
    props.setMessageForBack({ state: "SETTING_DOCKER_FORM", dockerFormData: dockerFormData });
  }, [dockerFormData]);

  useEffect(() => {
    setSelectedFile(props.projectDir);
  }, [props.projectDir]);

  useEffect(() => {
    setSelectedSaveDir(props.saveDir);
  }, [props.saveDir]);

  useEffect(() => {
    if (
      props.generatorState.indexOf("Docker demon Error") >= 0 ||
      props.preGeneratorState.indexOf("Docker demon Error")
    ) {
      setFileReSendCheck(false);
    }
  }, [props.generatorState]);

  useEffect(() => {
    props.setMessageForBack({ state: "SETTING_DOCKER_ARCHITECTURE", architecture: selectedArchitecture });
  }, [selectedArchitecture]);

  useEffect(() => {
    props.setMessageForBack({ state: "SETTING_DOCKER_IMAGE_NAME", dockerName: dockerImgName });
  }, [dockerImgName]);

  useEffect(() => {
    props.setMessageForBack({ state: "SETTING_DOCKER_IMAGE_TAG", dockerTag: dockerImgTag });
  }, [dockerImgTag]);

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
    let templateValuesVisible: Array<any> = [];
    jsonTemplateValues.map((templateLineData) => {
      templateKeys.push(Object.keys(templateLineData)[0]);
      templateValues.push(Object.values(templateLineData)[0]);
      templateValuesVisible.push(Object.values(templateLineData)[1]);
    });

    setDockerFormData(jsonTemplate);
    setInputComponents(jsonTemplateKeysToInt);
    setLineId(jsonTemplateKeysToInt.length);
    setLineOption(templateKeys);
    setLineValue(templateValues);
    setLineInvisibility(templateValuesVisible);
  };

  const onClickFileSelect = () => {
    onChangeFileSelect();
  };

  const onChangeFileSelect = () => {
    props.setMessageForBack({ state: "SET_PROJECT_FILES" });
  };

  const onChangeArchitecture = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedArchitecture(e.target.value);
  };

  const onChangeDockerImgName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDockerImgName(e.target.value);
  };

  const onChangeDockerImgTag = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDockerImgTag(e.target.value);
  };
  const onClickDockerTarSaveDir = () => {
    onChangeDockerTarSaveDir();
  };
  const onChangeDockerTarSaveDir = () => {
    props.setMessageForBack({ state: "SET_DOCKER_TAR_SAVE_DIR" });
  };

  const dockerBuild = () => {
    props.setMessageForBack({
      state: "SET_DOCKER_FORM",
      dockerFormData: dockerFormData,
      architecture: selectedArchitecture,
      dockerName: dockerImgName,
      dockerTag: dockerImgTag,
    });
    setFileSendCheck(true);
  };
  const dockerRebuild = () => {
    setFileReSendCheck(true);
    dockerBuild();
  };

  const dockerFormResetting = () => {
    setFileSendCheck(false);
    props.setGeneratorState("");
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
    <div>
      <div className="generator-state-div">
        <div>{props.preGeneratorState}</div>
        <div>{props.generatorState}</div>
        {props.generatorState.indexOf("Docker demon Error") >= 0 ||
        props.preGeneratorState.indexOf("Docker demon Error") >= 0 ? (
          <button className="dockerform-btn" onClick={dockerRebuild} disabled={fileReSendCheck}>
            ?????? ?????????
          </button>
        ) : props.generatorState.indexOf("Docker build Error") >= 0 ? (
          <button className="dockerform-btn" onClick={dockerFormResetting} disabled={!fileSendCheck}>
            ?????? ?????? ?????? ?????????
          </button>
        ) : (
          ""
        )}
      </div>
      {props.downloadedPercent === "100%" ? "" : <TransferMessage downloadedPercent={props.downloadedPercent} />}
    </div>
  ) : (
    <div className="form-div">
      <select className="template-select" onChange={setTemplateForm} value={optionSelect}>
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
                invisibility={lineInvisibility ? lineInvisibility[lineId] : true}
                dockerFormData={dockerFormData}
                setDockerFormData={setDockerFormData}
              />
            ))
          : ""}
        <button className="add-btn" onClick={appendInput}>
          ADD Instruction
        </button>
        <div className="clear-div">
          <button onClick={clearValue}>?????????</button>
        </div>
      </div>
      <div className="filebtn-div">
        <label className="filebtn">
          ???????????? ??????
          <input type="button" name={"file"} onClick={onClickFileSelect} onChange={onChangeFileSelect} />
        </label>
        <div className="fileName-div">{selectedFile ? selectedFile : "???????????? ?????? ??????"}</div>
      </div>
      <div className="setting-context-div">
        <div className="setting-line-div">
          <div className="setting-txt">???????????? ??????:</div>
          <select
            className="setting-architecture-select"
            name=""
            id=""
            onChange={onChangeArchitecture}
            value={selectedArchitecture}
          >
            {architectureOptions.map((architectureOption, index) => (
              <option value={architectureOption} key={index}>
                {architectureOption}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="setting-context-div">
        <div className="setting-line-div">
          <div className="setting-txt">?????? ????????? ??????: </div>
          <input type="text" onChange={onChangeDockerImgName} value={dockerImgName} />
        </div>
        <div className="setting-line-div">
          <div className="setting-txt">?????? ????????? ??????: </div>
          <input type="text" onChange={onChangeDockerImgTag} value={dockerImgTag} />
        </div>
        <div className="setting-line-div">
          <div className="setting-txt">?????? ?????? ??????: </div>
          <input
            className="save-dir"
            type="text"
            onClick={onClickDockerTarSaveDir}
            onChange={onChangeDockerTarSaveDir}
            value={selectedSaveDir ? selectedSaveDir : ""}
            placeholder={selectedSaveDir ? selectedSaveDir : "?????? ????????? ?????? ????????? ??????"}
          />
        </div>
      </div>

      <div className="buildBtn-div">
        <button className="dockerform-btn" onClick={dockerBuild} disabled={fileSendCheck}>
          ????????? ????????????
        </button>
      </div>
      {/* <div>{JSON.stringify(dockerFormData)}</div> */}
    </div>
  );
}
export default OpenedWebsocket;
