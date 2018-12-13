import { Query } from "react-apollo";
import Error from "./ErrorMessage";
import gql from "graphql-tag";
import Table from "./styles/Table";
import SickButton from "./styles/SickButton";
import PropTypes from "prop-types";

const possiblePermissions = [
  "ADMIN",
  "USER",
  "ITEMCREATE",
  "ITEMUPDATE",
  "PERMISSIONUPDATE"
];

const ALL_USERS_QUERY = gql`
  query {
    users {
      id
      name
      permissions
      email
    }
  }
`;

const Permissions = props => (
  <Query query={ALL_USERS_QUERY}>
    {({ data, loading, error }) => {
      return (
        <div>
          <Error error={error} />
          <div>
            <h2>Manage Permissions</h2>
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  {possiblePermissions.map((permission, i) => {
                    return <th key={permission + i}>{permission}</th>;
                  })}
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map(user => {
                  return <UserRow key={user.id} user={user} />;
                })}
              </tbody>
            </Table>
          </div>
        </div>
      );
    }}
  </Query>
);

class UserRow extends React.Component {
  static propTypes = {
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      id: PropTypes.string,
      permissions: PropTypes.array
    }).isRequired
  };

  state = {
    permissions: this.props.user.permissions
  };

  handlePermissionChange = e => {
    const checkbox = e.target;
    let updatedPermissions = [...this.state.permissions];
    if (checkbox.checked) {
      updatedPermissions.push(checkbox.value);
    } else {
      updatedPermissions = updatedPermissions.filter(perm => {
        return perm !== checkbox.value;
      });
    }
    this.setState({
      permissions: updatedPermissions
    });
  };

  render() {
    const user = this.props.user;
    return (
      <tr>
        <td>{user.name}</td>
        <td>{user.email}</td>
        {possiblePermissions.map(permission => {
          return (
            <td key={permission}>
              <label htmlFor={`${user.id}-permission-${permission}`}>
                <input
                  type="checkbox"
                  checked={this.state.permissions.includes(permission)}
                  value={permission}
                  onChange={this.handlePermissionChange}
                />
              </label>
            </td>
          );
        })}
        <td>
          <SickButton>Update</SickButton>
        </td>
      </tr>
    );
  }
}
export default Permissions;
