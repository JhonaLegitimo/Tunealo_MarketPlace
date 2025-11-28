import { gql } from "@apollo/client";

export const CREATE_REVIEW = gql`
  mutation CreateReview($createReviewInput: CreateReviewInput!) {
    createReview(createReviewInput: $createReviewInput) {
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
`;

export const UPDATE_REVIEW = gql`
  mutation UpdateReview($updateReviewInput: UpdateReviewInput!) {
    updateReview(updateReviewInput: $updateReviewInput) {
      id
      content
      rating
      isAnonymous
      updatedAt
    }
  }
`;
