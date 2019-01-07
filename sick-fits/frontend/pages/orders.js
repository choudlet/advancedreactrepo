import SignInReminder from "../components/SignInReminder";
import Orders from "../components/Orders";

const OrderRoute = props => (
  <div>
    <SignInReminder>
      <Orders />
    </SignInReminder>
  </div>
);

export default OrderRoute;
