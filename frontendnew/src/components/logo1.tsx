import React from "react";
import L2 from "/assets/log2.svg";
import {Link} from "react-router-dom";
const Logo1: React.FC = () => {
  return (
    <div>
        <Link to="/" className="">
            <img src={L2} alt="ClientHub"/>
        </Link>
    </div>
  );
};  
export default Logo1;
