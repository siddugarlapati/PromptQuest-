import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameContext';
import { WorldHeader } from './World1_Basics';
import ReactFlow, { Background, Controls, applyNodeChanges, applyEdgeChanges, addEdge, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import toast from 'react-hot-toast';

// Custom Node component with Tailwind-like styling
const ArchitectureNode = ({ data, selected }) => (
    <div style={{
        padding: '12px 16px',
        borderRadius: 8,
        background: data.color || '#fff',
        color: '#fff',
        border: selected ? '2px solid #fff' : '2px solid transparent',
        boxShadow: selected ? '0 0 0 2px #6366f1' : '0 4px 6px rgba(0,0,0,0.1)',
        minWidth: 150,
        textAlign: 'center',
        fontWeight: 700,
        fontSize: '0.85rem'
    }}>
        <Handle type="target" position={Position.Top} style={{ background: '#555', width: 8, height: 8 }} />
        {data.label}
        <Handle type="source" position={Position.Bottom} style={{ background: '#555', width: 8, height: 8 }} />
    </div>
);

import { getBezierPath, BaseEdge } from 'reactflow';

// Custom Animated Edge to simulate data flowing
const AnimatedEdge = ({
    sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd
}) => {
    const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, strokeWidth: 3, stroke: 'rgba(99, 102, 241, 0.4)' }} />
            <circle r="5" fill="#10b981">
                <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
            </circle>
            <circle r="3" fill="#fff">
                <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} begin="1s" />
            </circle>
        </>
    );
};

const edgeTypes = { animatedFlow: AnimatedEdge };
const nodeTypes = { archNode: ArchitectureNode };

const INITIAL_NODES = [
    { id: '1', type: 'archNode', position: { x: 50, y: 50 }, data: { label: '🧩 Tokenization', color: '#0891B2', order: 2 } },
    { id: '2', type: 'archNode', position: { x: 250, y: 50 }, data: { label: '🎯 Self-Attention', color: '#d97706', order: 4 } },
    { id: '3', type: 'archNode', position: { x: 450, y: 50 }, data: { label: '🗺️ Embeddings', color: '#10b981', order: 3 } },
    { id: '4', type: 'archNode', position: { x: 50, y: 150 }, data: { label: '💬 Text Input', color: '#6366f1', order: 1 } },
    { id: '5', type: 'archNode', position: { x: 250, y: 150 }, data: { label: '📊 Softmax (Output)', color: '#C02633', order: 6 } },
    { id: '6', type: 'archNode', position: { x: 450, y: 150 }, data: { label: '🧠 Feed Forward', color: '#7C3AED', order: 5 } },
];

export default function World12_Architecture() {
    const navigate = useNavigate();
    const { addXP, completeWorld } = useGame();
    const [nodes, setNodes] = useState(INITIAL_NODES);
    const [edges, setEdges] = useState([]);
    const [attempted, setAttempted] = useState(false);
    const [status, setStatus] = useState({ state: 'idle', message: 'Connect the components in the correct order to build a working LLM!' });
    const [showGame, setShowGame] = useState(false);

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );

    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge({ ...params, type: 'default', animated: false, style: { strokeWidth: 2, stroke: '#94a3b8' } }, eds)),
        []
    );

    const checkArchitecture = () => {
        if (edges.length !== 5) {
            toast.error('You must connect all 6 components to make a complete pipeline!');
            return;
        }

        // Validate the path from start to end
        let startNodeId = nodes.find(n => n.data.order === 1).id; // Text Input is expected start
        let currentId = startNodeId;
        let count = 0;
        let currentOrder = 1;
        let isValid = true;
        let errorMsg = '';

        while (count < 5) { // 5 edges for 6 nodes
            const outgoingEdge = edges.find(e => e.source === currentId);
            if (!outgoingEdge) {
                isValid = false;
                errorMsg = `The pipeline is broken after step ${currentOrder}.`;
                break;
            }

            const nextNode = nodes.find(n => n.id === outgoingEdge.target);
            if (nextNode.data.order !== currentOrder + 1) {
                isValid = false;
                errorMsg = `Incorrect sequence! You connected ${nodes.find(n => n.id === currentId).data.label} to ${nextNode.data.label}.`;
                break;
            }

            currentId = nextNode.id;
            currentOrder = nextNode.data.order;
            count++;
        }

        if (isValid) {
            setStatus({ state: 'success', message: 'Perfect! Data flows from Input → Tokens → Embeddings → Attention → Feed Forward → Output Prediction!' });
            setEdges((eds) => eds.map(e => ({ ...e, type: 'animatedFlow', animated: false })));
            toast.success('Architecture Assembled! Data is flowing! +40 XP');
            if (!attempted) {
                addXP(40);
                completeWorld(12, 'ai_explorer');
                setAttempted(true);
            }
        } else {
            setStatus({ state: 'error', message: errorMsg || 'The connections are tangled up. Try again.' });
            toast.error('Architecture failed compilation.', { icon: '💥' });
        }
    };

    const resetGraph = () => {
        setNodes(INITIAL_NODES);
        setEdges([]);
        setStatus({ state: 'idle', message: 'Connect the components in the correct order to build a working LLM!' });
    };

    return (
        <div className="container" style={{ paddingTop: 32, paddingBottom: 48, position: 'relative', zIndex: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <WorldHeader
                emoji="🏗️" title="World 12: Build an LLM"
                subtitle="Drag and drop nodes and connect them in the correct sequence to assemble a working Transformer architecture."
                onBack={() => navigate('/worlds')}
            />

            {!showGame ? (
                <div className="fade-in" style={{ flex: 1 }}>
                    <div className="glass-card" style={{ padding: 32, marginBottom: 24, borderLeft: '4px solid #3b82f6' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6', marginBottom: 16 }}>
                            The Anatomy of a Transformer
                        </h2>
                        <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.7, marginBottom: 16 }}>
                            You've learned about the individual pieces of an AI: Tokens, Embeddings, and Attention. But how do they fit together to create a working Large Language Model like GPT-4?
                        </p>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1A1A2E', marginTop: 24, marginBottom: 12 }}>
                            The Pipeline
                        </h3>
                        <p style={{ fontSize: '1rem', color: '#334155', lineHeight: 1.7, marginBottom: 16 }}>
                            1. <strong>Text Input:</strong> You type a prompt.<br />
                            2. <strong>Tokenization:</strong> The text is sliced into chunks (Words/Sub-words).<br />
                            3. <strong>Embeddings:</strong> Tokens are converted into floating-point coordinates in vector space.<br />
                            4. <strong>Self-Attention:</strong> The model looks at the surrounding words to resolve context (like understanding what "it" refers to).<br />
                            5. <strong>Feed Forward:</strong> The neural network processes this context-rich representation through mathematical layers to find patterns.<br />
                            6. <strong>Softmax (Output):</strong> The final layer turns all the math back into probabilities, picking the most likely next Token.
                        </p>

                        <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 12, border: '1px solid #E2E8F0', marginTop: 24 }}>
                            <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                                💡 The "Transformer"
                            </div>
                            <p style={{ margin: 0, color: '#334155', lineHeight: 1.6, fontSize: '0.95rem' }}>
                                This specific sequence of operations—particularly using Self-Attention—was invented by Google in 2017 in a paper called "Attention Is All You Need". It revolutionized AI because it allowed models to process text in parallel, rather than reading word-by-word.
                            </p>
                        </div>
                    </div>

                    <button className="btn btn-primary btn-lg" style={{ width: '100%', fontSize: '1.1rem', padding: 18, background: '#3b82f6', color: 'white', border: 'none' }} onClick={() => setShowGame(true)}>
                        Let's Play: Assemble the Architecture 🚀
                    </button>
                </div>
            ) : (
                <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

                    <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 24, borderLeft: `3px solid ${status.state === 'success' ? '#10b981' : status.state === 'error' ? '#ef4444' : '#3b82f6'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#555', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase' }}>COMPILATION STATUS</div>
                                <p style={{ fontSize: '0.9rem', color: status.state === 'success' ? '#10b981' : status.state === 'error' ? '#ef4444' : '#555566', fontWeight: status.state !== 'idle' ? 600 : 400 }}>
                                    {status.message}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button className="btn btn-secondary" onClick={resetGraph}>Reset</button>
                                <button className="btn btn-primary" onClick={checkArchitecture}>Compile & Test Flow →</button>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card" style={{ flex: 1, padding: 0, overflow: 'hidden', minHeight: 450 }}>
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            nodeTypes={nodeTypes}
                            edgeTypes={edgeTypes}
                            fitView
                            attributionPosition="bottom-right"
                        >
                            <Background color="#ccc" gap={16} size={1} />
                            <Controls />
                        </ReactFlow>
                    </div>

                    <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 10, padding: '12px 16px', fontSize: '0.85rem', color: '#555566', marginTop: 24 }}>
                        💡 <strong>Hint:</strong> The model reads raw <strong>Text Input</strong>, breaks it into <strong>Tokens</strong>, converts them to math via <strong>Embeddings</strong>, figures out context via <strong>Self-Attention</strong>, processes logic in <strong>Feed Forward</strong>, and finally predicts the answer via <strong>Softmax</strong>.
                    </div>
                </div>
            )}
        </div>
    );
}
