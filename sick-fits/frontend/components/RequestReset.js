import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Form from "./styles/Form";
import Error from "./ErrorMessage";
import { CURRENT_USER_QUERY } from "./User";

const REQUEST_RESET_MUTATION = gql`
  mutation requestReset($email: String!) {
    requestReset(email: $email) {
      message
    }
  }
`;

export default class SignIn extends Component {
  state = {
    email: ""
  };

  saveToState = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  render() {
    return (
      <Mutation mutation={REQUEST_RESET_MUTATION} variables={this.state}>
        {(resetRequest, { error, loading, called }) => (
          <Form
            method="post"
            data-test="reset-test"
            onSubmit={async e => {
              e.preventDefault();
              await resetRequest();
              this.setState({
                email: ""
              });
            }}
          >
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Request Password Reset</h2>
              <Error error={error} />
              {!error && !loading && called && (
                <p>Check your email for a reset link</p>
              )}
              <label htmlFor="email">
                Email
                <input
                  type="email"
                  name="email"
                  placeholder="email"
                  value={this.state.email}
                  onChange={this.saveToState}
                />
              </label>
              <button type="submit">Submit</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

export { REQUEST_RESET_MUTATION };
