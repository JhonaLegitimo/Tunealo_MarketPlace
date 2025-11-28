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
          reviews {
            id
            rating
            content
            isAnonymous
            author {
              id
            }
          }
        }
      }
    }
  }
`;

export const GET_SELLER_ORDERS = gql`
  query GetSellerOrders {
    sellerOrders {
      id
      total
      status
      createdAt
      buyer {
        name
        email
      }
      items {
        id
        quantity
        unitPrice
        product {
          title
          images {
            url
          }
        }
      }
    }
  }
`;

export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($input: UpdateOrderStatusInput!) {
    updateOrderStatus(updateOrderStatusInput: $input) {
      id
      status
    }
  }
`;

export const CONFIRM_ORDER_DELIVERY = gql`
  mutation ConfirmOrderDelivery($orderId: Int!) {
    confirmOrderDelivery(orderId: $orderId) {
      id
      status
    }
  }
`;
