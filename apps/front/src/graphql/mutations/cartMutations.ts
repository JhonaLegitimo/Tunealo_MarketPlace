import { gql } from "@apollo/client";

export const ADD_TO_CART = gql`
  mutation addToCart($addToCartInput: AddToCartInput!) {
    addToCart(addToCartInput: $addToCartInput) {
      id
      items {
        id
        product {
          id
          title
          price
        }
        quantity
      }
    }
  }
`;
