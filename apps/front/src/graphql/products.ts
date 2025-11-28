import { gql } from "@apollo/client";

export const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      products {
        id
        title
        description
        price
        images {
          url
        }
        seller {
          name
          avatar
        }
      }
    }
  }
`;
