import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  Button,
  Row,
  Col
} from 'react-bootstrap';

import { getMe, deleteBook } from '../utils/API';
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';
import { useQuery, useMutation } from "@apollo/client";
import { QUERY_ME } from "../utils/queries";
import { REMOVE_BOOK } from "../utils/mutations";

const SavedBooks = () => {
  const { data, loading } = useQuery(QUERY_ME);
  let userData = data?.me || {};
  const [removeBook] = useMutation(REMOVE_BOOK);

  async function handleDeleteBook(bookId) {
    try {
      await removeBook({
        variables: {bookId: bookId}
      });
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  }

  // if data isn't here yet, say so
  if (!loading) {
    return <h2>LOADING...</h2>;
  }

  return (
    <>
      <div fluid className='text-light bg-dark p-5'>
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks.map((book) => {
            return (
              <Col md="4">
                <Card key={book.bookId} border='dark'>
                {book.image ? (
                  <Card.Link href={book.link} target="_blank" rel="noreferrer">
                    <Card.Img
                      src={book.image}
                      alt={`The cover for ${book.title}`}
                      variant="top"
                    />
                  </Card.Link>
                ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                      Delete this Book!
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
