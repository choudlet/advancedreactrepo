import SignInReminder from "../components/SignInReminder";
import Order from "../components/Order";

const OrderRoute = props => (
  <div>
    <SignInReminder>
      <Order id={props.query.id} />
    </SignInReminder>
  </div>
);

export default OrderRoute;
