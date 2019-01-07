import React, { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import Error from "./ErrorMessage";
import formatMoney from "../lib/formatMoney";
import styled from "styled-components";
import Link from "next/link";

const StyledList = styled.ul`
  > li {
    list-style: none;
  }
  > li > span {
    margin: 2px;
  }
`;

const USER_ORDERS_QUERY = gql`
  query {
    orders {
      id
      total
      charge
      createdAt
      updatedAt
    }
  }
`;

class Orders extends Component {
  render() {
    return (
      <Query query={USER_ORDERS_QUERY}>
        {({ error, loading, data }) => {
          if (loading) return "doing my thing!";
          if (error) return <Error error={error} />;

          return (
            <>
              <h1>You have {data.orders.length} Orders</h1>
              <StyledList>
                {data.orders.map(order => (
                  <li key={order.id}>
                    <span>Id: {order.id}</span>
                    <span>Total: {formatMoney(order.total)}</span>
                    <Link href={`/order?id=${order.id}`}>
                      <a>Check Order</a>
                    </Link>
                  </li>
                ))}
              </StyledList>
            </>
          );
        }}
      </Query>
    );
  }
}

export default Orders;
