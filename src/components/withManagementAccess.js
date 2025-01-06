import React from "react";

const withManagementAccess = (Component) => {
  return class WithManagementAccess extends React.Component {
    render() {
      const token = localStorage.getItem("token");
      const user = token ? JSON.parse(atob(token.split(".")[1])) : null;

      if (user && user.role === "management") {
        return <Component {...this.props} />;
      } else {
        return <div className="access-forbidden">Access forbidden</div>;
      }
    }
  };
};

export default withManagementAccess;
