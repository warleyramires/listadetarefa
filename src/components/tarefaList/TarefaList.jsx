import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Modal from 'react-modal';
import TarefaForm from '../tarefaForm/TarefaForm';
import './TarefaList.css';

Modal.setAppElement('#root');

export default function TarefaList() {
    const [tarefas, setTarefas] = useState([]);
    const [erro, setErro] = useState(null);
    const [modalEditarIsOpen, setModalEditarIsOpen] = useState(false);
    const [modalExcluirIsOpen, setModalExcluirIsOpen] = useState(false);
    const [tarefaParaExcluir, setTarefaParaExcluir] = useState(null);
    const [tarefaParaEditar, setTarefaParaEditar] = useState(null);  // Estado para tarefa a ser editada
    const [formVisivel, setFormVisivel] = useState(false);

    const fetchTarefas = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/tarefas');
            setTarefas(response.data);
        } catch (error) {
            setErro('Erro ao buscar tarefas');
            console.error(error);
        }
    };

    useEffect(() => {
        fetchTarefas();
    }, []);

    const handleSave = (novaTarefa) => {
        setTarefas((prevTarefas) => [...prevTarefas, novaTarefa]);
        setFormVisivel(false); 
    };

    const handleEdit = (tarefa) => {
        setTarefaParaEditar(tarefa);
        setModalEditarIsOpen(true);
    };

    const openModalExcluir = (id) => {
        setTarefaParaExcluir(id);
        setModalExcluirIsOpen(true);
    };

    const confirmDelete = async () => {
        if (tarefaParaExcluir !== null) {
            try {
                await axios.delete(`http://localhost:8080/api/tarefas/${tarefaParaExcluir}`);
                setTarefas(tarefas.filter(tarefa => tarefa.id !== tarefaParaExcluir));
                setModalExcluirIsOpen(false);
                setTarefaParaExcluir(null);
            } catch (error) {
                console.error('Erro ao excluir a tarefa', error);
            }
        }
    };

    const cancelDelete = () => {
        setModalExcluirIsOpen(false);
        setTarefaParaExcluir(null);
    };

    const formatarData = (data) => {
        const novaData = new Date(data);
        return novaData.toISOString().split('T')[0];
    };

    const formatarCusto = (custo) => {
        return `R$ ${custo.toFixed(2).replace('.', ',')}`;
    };

    const toggleForm = () => {
        setFormVisivel(!formVisivel);
    };

    return (
        <div className="lista-tarefas">
            {erro && <p className="erro">{erro}</p>}
            <h2>Tarefas</h2>
            <ul>
                {tarefas
                    .sort((a, b) => a.ordem - b.ordem)
                    .map((tarefa) => (
                        <li 
                            key={tarefa.id} 
                            className={tarefa.custo >= 1000 ? 'tarefa-alta' : 'tarefa-normal'}
                        >
                            <strong>{tarefa.nome}</strong> - Custo: {formatarCusto(tarefa.custo)} - Data Limite: {formatarData(tarefa.dataLimite)}
                            <div>
                                <button style={{ marginRight: '5px' }} onClick={() => handleEdit(tarefa)}>
                                    <FaEdit />
                                </button>
                                <button onClick={() => openModalExcluir(tarefa.id)}>
                                    <FaTrash />
                                </button>
                            </div>
                        </li>
                    ))}
            </ul>

            <button onClick={toggleForm}>
                {formVisivel ? 'Cancelar' : 'Incluir'}
            </button>

            {formVisivel && <TarefaForm onSave={handleSave} />}

            {/* Modal de Edição */}
            <Modal
                isOpen={modalEditarIsOpen}
                onRequestClose={() => setModalEditarIsOpen(false)}
                contentLabel="Editar Tarefa"
                className="modal-content"
                overlayClassName="modal-overlay"
            >
                <h3>Editar Tarefa</h3>
                {tarefaParaEditar && (
                    <TarefaForm
                        tarefa={tarefaParaEditar}
                        onSave={(editada) => {
                            setTarefas(tarefas.map(t => t.id === editada.id ? editada : t));
                            setModalEditarIsOpen(false);
                        }}
                    />
                )}
                <button onClick={() => setModalEditarIsOpen(false)} className="btn-cancelar">Fechar</button>
            </Modal>

            {/* Modal de Exclusão */}
            <Modal
                isOpen={modalExcluirIsOpen}
                onRequestClose={cancelDelete}
                contentLabel="Confirmação de Exclusão"
                className="modal-content"
                overlayClassName="modal-overlay"
            >
                <h3>Tem certeza que deseja excluir esta tarefa?</h3>
                <button onClick={confirmDelete} className="btn-confirmar">Confirmar</button>
                <button onClick={cancelDelete} className="btn-cancelar">Cancelar</button>
            </Modal>
        </div>
    );
}
