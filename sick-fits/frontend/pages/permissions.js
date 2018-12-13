import CreateItem from "../components/CreateItem";
import SignInReminder from "../components/SignInReminder";
import Permissions from "../components/Permissions";

const Permission = props => (
  <div>
    <SignInReminder>
      <Permissions />
    </SignInReminder>
  </div>
);

export default Permission;
