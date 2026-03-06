import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div
      className="relative py-4 bottom-0 h-14 px-4 md:px-14 border-t"
      style={{
        backgroundColor: "oklch(1 0 0)",
        borderColor: "oklch(0.823 0.003 48.717)",
      }}
    >
      <div
        className="text-md flex justify-center items-center gap-2"
        style={{ color: "oklch(0.423 0.003 48.717)" }}
      >
        © {currentYear} TimeX |{" "}
        <a href="https://enyard.in" className="underline" target="_blank">
          ENYARD.
        </a>{" "}
        | All rights reserved.
      </div>
    </div>
  );
};

export default Footer;
