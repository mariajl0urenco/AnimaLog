import React from 'react';
import { Modal, Button } from 'react-bootstrap';

export default function ModalInfo({ show, onHide }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Sobre a AnimaLog</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          A <strong>AnimaLog</strong> é uma aplicação desenvolvida para facilitar a gestão de animais nos Centro de Recolha Oficial.
          Aqui pode consultar os animais disponíveis para adoção, agendar uma visita e aceder a informações úteis.
        </p>
        <hr />
        <h6>📞 Contactos</h6>
        <p>
          Email: <a href="mailto:info@animalog.pt">info@animalog.pt</a><br />
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
