import React, { Dispatch, MouseEventHandler, SetStateAction } from "react";
import "./DockerFormInput.css";

type Props = {
  index: number;
  setAddAppend: Dispatch<SetStateAction<number[]>>;
  addAppend: number[];
};
function DockerFormInput(props: Props) {
  const deleteThisComponent = () => {
    // console.log(e.);
    console.log(props.index);
    //props.setAddAppend(props.addAppend.splice(props.index, 1))//;
    props.setAddAppend(
      props.addAppend.filter((user) => {
        console.log("user", user, props.index + 1);
        return user !== props.index + 1;
      })
    );
    console.log("props.addAppend", props.addAppend);
  };
  return (
    <div className="input-component-div">
      <input placeholder={props.index + ""} name={"env"} />
      <button onClick={deleteThisComponent} value={props.index}>
        -
      </button>
    </div>
  );
}
export default DockerFormInput;
