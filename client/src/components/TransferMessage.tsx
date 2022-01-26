import React, { useEffect } from "react";
import "./TransferMessage.css";

type Props = {
  downloadedPercent: string | undefined;
  generatorState: string;
};
function TransferMessage(props: Props) {
  return (
    <div className="progress-div">
      <div className="mainText">파일 전송</div>
      <div className="progressBar">
        <div className="progressBar-ing" style={{ width: props.downloadedPercent }}></div>
      </div>
      {props.downloadedPercent}
      <div>{props.generatorState}</div>
    </div>
  );
}
export default TransferMessage;
