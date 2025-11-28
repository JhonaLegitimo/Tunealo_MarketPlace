import { gql } from "@apollo/client";

export const GET_MY_ORDERS = gql`
  query GetMyOrders {
    myOrders {
      id
      total
      status
      createdAt
      items {
        id
        quantity
        unitPrice
        product {
          id
          title
          images {
            url
          }
        }
      }
    }
  }
`;
