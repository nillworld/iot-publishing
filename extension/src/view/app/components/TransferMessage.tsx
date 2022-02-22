import * as React from "react";
import "./TransferMessage.css";

type Props = {
  downloadedPercent: string | undefined;
};
function TransferMessage(props: Props) {
  return (
    <div className="progress-div">
      <div className="mainText">파일 전송</div>
      {props.downloadedPercent === "none" ? (
        ""
      ) : props.downloadedPercent === "100%" ? (
        <div className="progressBar">
          <div className="progressBar-ing" style={{ width: "0%" }}></div>
        </div>
      ) : (
        <div className="progressBar">
          <div className="progressBar-ing" style={{ width: props.downloadedPercent }}></div>
        </div>
      )}
      {props.downloadedPercent === "none" ? "" : props.downloadedPercent}
    </div>
  );
}
export default TransferMessage;
