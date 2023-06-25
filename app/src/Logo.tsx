import { FC } from "react";
import logo from "./logo.png";
const Logo: FC<{ className: string }> = ({ className = "h-8 w-8" }) => {
  return (
    <div className={className}>
      <img src={logo} alt="State Change Logo" />
    </div>
  );
};
export default Logo;
