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
export const UPDATE_CART_ITEM = gql`
  mutation updateCartItem($updateCartItemInput: UpdateCartItemInput!) {
    updateCartItem(updateCartItemInput: $updateCartItemInput) {
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
export const CLEAR_CART = gql`
  mutation clearCart {
    clearCart {
      id
      items {
        id
      }
    }
  }
`;
