import React, { Dispatch, MouseEventHandler, SetStateAction } from "react";

type Props = {
  index: number;
  setAddAppend: Dispatch<SetStateAction<number[]>>;
  addAppend: number[];
};
function DockerFormInput(props: Props) {
  const deleteThisComponent = () => {
    // console.log(e.);
    console.log(props.index);
    //왜 다 날라가지..
    props.setAddAppend(props.addAppend.slice(props.index, 1));
  };
  return (
    <div>
      <input placeholder="env 입력~" name={"env"} />
      <button onClick={deleteThisComponent} value={props.index}>
        -
      </button>
    </div>
  );
}
export default DockerFormInput;
