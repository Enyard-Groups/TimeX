import React from "react";
import { useSelector } from "react-redux";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { user } = useSelector((state) => state);

  return (
    <>
      {user && (
        <div
          className=" fixed bottom-0 w-full pt-3 z-10 h-12 border-t"
          style={{
            backgroundColor: "oklch(1 0 0)",
            borderColor: "oklch(0.923 0.003 48.717)",
          }}
        >
          <div
            className="text-sm gap-2 flex justify-center"
            style={{ color: "oklch(0.423 0.003 48.717)" }}
          >
            <p className="whitespace-nowrap">© {currentYear} TimeX</p> |
            <a href="https://enyard.in" target="_blank">
              ENYARD
            </a>
            | <p className="whitespace-nowrap">All rights reserved</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
