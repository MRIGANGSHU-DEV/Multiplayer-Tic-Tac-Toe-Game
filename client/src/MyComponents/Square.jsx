import React from "react";

const Square = (props) =>{
    return(
        <div onClick={props.onClick} className="container-square" style={{
            padding: "10px",
            border: "1px solid grey",
            height:"100px",
            width:"100px",
            display:"flex",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <h1>{props.value}</h1>
        </div>
    )
};
export default Square;