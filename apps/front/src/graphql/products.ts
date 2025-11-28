import { gql } from "@apollo/client";

export const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      products {
        id
        title
        description
        price
        avgRating
        images {
          url
        }
        seller {
          name
        }
      }
    }
  }
`;

export const GET_PRODUCT_DETAILS = gql`
  query GetProductDetails($id: Int!) {
    product(id: $id) {
      id
      title
      description
      price
      stock
      avgRating
      images {
        url
      }
      seller {
        id
        name
        email
      }
      categories {
        name
      }
      Reviews {
        id
        content
        rating
        createdAt
        author {
          name
        }
      }
    }
  }
`;

export const GET_TAGS = gql`
  query GetTags {
    tags {
      id
      name
    }
  }
`;

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(createProductInput: $input) {
      id
      title
      slug
      price
      stock
      published
      seller {
        name
      }
    }
  }
`;

export const GET_MY_PRODUCTS = gql`
  query GetMyProducts($sellerId: Int!, $take: Int) {
    products(sellerId: $sellerId, take: $take) {
      products {
        id
        title
        price
        stock
        published
        images {
          url
        }
      }
      totalCount
    }
  }
`;
