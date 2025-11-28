import { gql } from "@apollo/client";

export const CREATE_ORDER = gql`
  mutation CreateOrder {
    createOrderFromCart {
      id
      total
      status
      createdAt
    }
  }
`;
