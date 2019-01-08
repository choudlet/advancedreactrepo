import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import wait from "waait";
import { MockedProvider } from "react-apollo/test-utils";
import { fakeItem } from "../lib/testUtils";
import RequestReset, { REQUEST_RESET_MUTATION } from "./RequestReset";

const notSignedInMocks = [
  {
    request: {
      query: REQUEST_RESET_MUTATION,
      variables: { email: "choudlette@gmail.com" }
    },
    result: {
      data: {
        requestReset: {
          message: "success",
          __typename: "Message"
        }
      }
    }
  }
];

describe("<RequestReset />", () => {
  it("renders and matches snapshot", async () => {
    const wrapper = mount(
      <MockedProvider>
        <RequestReset />
      </MockedProvider>
    );
    const form = wrapper.find('form[data-test="reset-test"]');
    expect(toJSON(form)).toMatchSnapshot();
  });

  it("calls the mutation", async () => {
    const wrapper = mount(
      <MockedProvider mocks={notSignedInMocks}>
        <RequestReset />
      </MockedProvider>
    );
    wrapper.find("input").simulate("change", {
      target: { name: "email", value: "choudlette@gmail.com" }
    });
    wrapper.find("form").simulate("submit");
    await wait();
    wrapper.update();
    expect(wrapper.find("p").text()).toContain(
      "Check your email for a reset link"
    );
  });
});
