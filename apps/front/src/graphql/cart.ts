import { gql } from "@apollo/client";

export const GET_CART = gql`
  query GetCart {
    myCart {
      id
      items {
        id
        quantity
        product {
          id
          title
          price
        }
      }
    }
  }
`;
