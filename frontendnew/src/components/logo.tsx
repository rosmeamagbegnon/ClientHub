import React from "react";
import L1 from "/assets/log1.svg";
import {Link} from "react-router-dom";
const Logo: React.FC = () => {
  return (
    <div >
        <Link to="/" className="">
            <img src={L1} alt="ClientHub"/>
        </Link>
    </div>
  );
};  
export default Logo;
