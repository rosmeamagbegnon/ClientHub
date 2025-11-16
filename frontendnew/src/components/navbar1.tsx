import React from "react";
import Logo from "./logo";

const Navbar1: React.FC = () => {
  return (
    <div className="w-full flex justify-center bg-blue-100 py-4 fixed top-0 left-0 right-0">
      <Logo/>
    </div>
  );
};  
export default Navbar1;
