import React from "react";
import { useSelector } from "react-redux";

const Footer = ({ rightSidebarOpen}) => {
  const currentYear = new Date().getFullYear();
  const { user } = useSelector((state) => state);
  return (
    <>
      {user && (
        <div
          className={`fixed bottom-0 right-0 left-0 lg:left-64 z-30 lg:z-50 h-12 xl:h-16 border-t flex items-center justify-center transition-all duration-300 ${rightSidebarOpen ? "lg:mr-72" : "mr-0"}`}
          style={{
            backgroundColor: "white",
            borderColor: "oklch(0.923 0.003 48.717)",
          }}
        >
          <div
            className="text-sm xl:text-lg gap-2 flex justify-center items-center"
            style={{ color: "oklch(0.423 0.003 48.717)" }}
          >
            <p className="whitespace-nowrap">© {currentYear} TimeX</p>
            <span className="opacity-30">|</span>
            <a
              href="https://enyard.in"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              ENYARD
            </a>
            <span className="opacity-30">|</span>
            <p className="whitespace-nowrap">All rights reserved</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
