import { gql } from "@apollo/client";

export const SIGN_IN = gql`
  mutation SignIn($email: String!, $password: String!) {
    signIn(signInInput: { email: $email, password: $password }) {
      accessToken
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const SIGN_UP = gql`
  mutation SignUp($email: String!, $password: String!, $name: String!) {
    signUp(createUserInput: { email: $email, password: $password, name: $name }) {
      accessToken
      user {
        id
        name
        email
        role
      }
    }
  }
`;
