import React from 'react'
import Navbar from "../components/Navbar"

const MyAttendance = ({ user }) => {
  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: "oklch(0.97 0.001 106.424)", scrollbarWidth:"none" }}
    >
      <Navbar user={user} />
      <div className='md:ml-64 mt-16 p-6 md:p-10'>Attendance</div>
    </div>
  )
}

export default MyAttendance