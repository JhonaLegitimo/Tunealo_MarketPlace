import { gql } from "@apollo/client/core";

export const ADD_TO_CART = gql`
  mutation AddToCart($productId: Int!, $quantity: Int!) {
    addToCart(addToCartInput: { productId: $productId, quantity: $quantity }) {
      id
      totalItems
      subtotal
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
