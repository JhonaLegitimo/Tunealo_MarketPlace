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
      reviews {
        id
        content
        rating
        isAnonymous
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
        description
        price
        stock
        published
        images {
          url
        }
        categories {
          id
        }
      }
      totalCount
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($input: UpdateProductInput!) {
    updateProduct(updateProductInput: $input) {
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
