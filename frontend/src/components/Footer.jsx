import React from "react";
import { useSelector } from "react-redux";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { user } = useSelector((state) => state);

  return (
    <>
      {user && (
        <div
          className=" w-full pt-3 z-10 h-12 border-t "
          style={{
            backgroundColor: "oklch(1 0 0)",
            borderColor: "oklch(0.823 0.003 48.717)",
          }}
        >
          <div
            className="text-sm gap-2 text-center"
            style={{ color: "oklch(0.423 0.003 48.717)" }}
          >
            © {currentYear} TimeX |{" "}
            <a href="https://enyard.in" target="_blank">
              ENYARD.
            </a>{" "}
            | All rights reserved.
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
