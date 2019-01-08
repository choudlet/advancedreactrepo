import { mount } from "enzyme";
import toJson from "enzyme-to-json";
import SingleItem, { SINGLE_ITEM_QUERY } from "./SingleItem";
import wait from "waait";
import { MockedProvider } from "react-apollo/test-utils";
import { fakeItem } from "../lib/testUtils";

describe("<SingleItem/>", () => {
  it("renders with proper data", async () => {
    const mocks = [
      {
        request: {
          query: SINGLE_ITEM_QUERY,
          variables: { id: "123" }
        },
        result: {
          data: {
            item: fakeItem()
          }
        }
      }
    ];

    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <SingleItem id="123" />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(toJson(wrapper.find("h2"))).toMatchSnapshot();
    expect(toJson(wrapper.find("img"))).toMatchSnapshot();
    expect(toJson(wrapper.find("p"))).toMatchSnapshot();
  });

  it("Errors with a not found item", async () => {
    const mocks = [
      {
        request: {
          query: SINGLE_ITEM_QUERY,
          variables: { id: "123" }
        },
        result: {
          errors: [{ message: "Item not found" }]
        }
      }
    ];
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <SingleItem id="123" />
      </MockedProvider>
    );

    await wait();
    wrapper.update();
    const item = wrapper.find('[data-test="graphql-error"]');
    expect(item.text()).toContain("Item not found");
    expect(toJson(item)).toMatchSnapshot();
  });
});
