import Reset from "../components/Reset";

const Sell = props => (
  <div>
    <p>Reset Your Password</p>
    <Reset resetToken={props.query.token} />
  </div>
);

export default Sell;
