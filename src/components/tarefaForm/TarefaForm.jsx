import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import './TarefaForm.css';

export default function TarefaForm({ onSave, tarefa }) {
    const [nome, setNome] = useState('');
    const [custo, setCusto] = useState('');
    const [dataLimite, setDataLimite] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (tarefa) {
            setNome(tarefa.nome);
            setCusto(tarefa.custo);
            setDataLimite(tarefa.dataLimite);
        }
    }, [tarefa]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        const tarefaSalva = { nome, custo: parseFloat(custo), dataLimite };

        try {
            let response;
            if (tarefa) {
                // Se a tarefa existe, atualiza
                response = await axios.put(`http://localhost:8080/api/tarefas/${tarefa.id}`, tarefaSalva);
            } else {
                // Se não existe, cria nova
                response = await axios.post('http://localhost:8080/api/tarefas', tarefaSalva);
            }
            onSave(response.data);
            setNome('');
            setCusto('');
            setDataLimite('');
        } catch (error) {
            if (error.response && error.response.status === 409) {
                setErrorMessage('Tarefa já existe na lista');
            } else {
                console.error('Erro ao salvar tarefa', error);
            }
        }
    };

    return (
        <div className="formulario">
            <form onSubmit={handleSubmit}>
                <label>
                    Nome:
                    <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Custo:
                    <input
                        type="number"
                        value={custo}
                        onChange={(e) => setCusto(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Data Limite:
                    <input
                        type="date"
                        value={dataLimite}
                        onChange={(e) => setDataLimite(e.target.value)}
                        required
                    />
                </label>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <button type="submit">Salvar</button>
            </form>
        </div>
    );
}

TarefaForm.propTypes = {
    onSave: PropTypes.func.isRequired,
    tarefa: PropTypes.object, 
};

TarefaForm.defaultProps = {
    tarefa: null,
};
