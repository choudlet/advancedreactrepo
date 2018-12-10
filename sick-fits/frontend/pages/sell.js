import CreateItem from "../components/CreateItem";
import SignInReminder from "../components/SignInReminder";
import SignIn from "../components/RequestReset";

const Sell = props => (
  <div>
    <SignInReminder>
      <CreateItem />
    </SignInReminder>
  </div>
);

export default Sell;
