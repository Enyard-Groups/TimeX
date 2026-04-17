import AttendancePunch from "../EmployeeSidebar/AttendancePunch";

const EmployeeDashboard = ({ user }) => {
  return (
    <>
      <div className="mb-8 sm:mt-1 pl-8 mt-10">
        <h1 className="text-xl text-gray-900 font-medium">
          Welcome back,{" "}
          <span className="text-blue-700 font-bold">
            {user.user_name?.charAt(0).toUpperCase() + user.user_name?.slice(1)}
          </span>
        </h1>
        <p className="text-sm text-gray-500">Have a productive day ahead</p>
      </div>

      <AttendancePunch user={user} />
    </>
  );
};

export default EmployeeDashboard;
