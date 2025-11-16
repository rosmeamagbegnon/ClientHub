import React from "react";
import {Ticket} from "lucide-react";
import {Link} from "react-router-dom";
const Logo1: React.FC = () => {
  return (
    <div>
        <Link to="/" className="flex items-center space-x-2 text-white font-bold">
            <Ticket size={24} />
            <span className="text-2xl   ">
                TicketsMaster
            </span>
        </Link>
    </div>
  );
};  
export default Logo1;
