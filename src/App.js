import React, { useState, useEffect } from "react";

const NQueens = () => {
    const [boardSize, setBoardSize] = useState(4);
    const [board, setBoard] = useState(
        Array(boardSize).fill(Array(boardSize).fill(" "))
    );
    const [resultStack, setResultStack] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);

    const isSafe = (y, x) => {
        for (let [row, col] of resultStack) {
            if (
                row === y ||
                col === x ||
                Math.abs(row - y) === Math.abs(col - x)
            ) {
                return false;
            }
        }
        return true;
    };

    const updateBoard = (y, x, value) => {
        setBoard((prevBoard) => {
            const newBoard = prevBoard.map((row, rowIndex) =>
                row.map((col, colIndex) =>
                    rowIndex === y && colIndex === x ? value : col
                )
            );
            return newBoard;
        });
    };

    const backTracking = async (depth) => {
        if (depth === boardSize) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            return;
        }

        for (let i = 0; i < boardSize; i++) {
            if (isSafe(depth, i)) {
                resultStack.push([depth, i]);
                updateBoard(depth, i, "Q");

                await new Promise((resolve) => setTimeout(resolve, 500)); // 시각적 효과

                await backTracking(depth + 1);

                resultStack.pop();
                updateBoard(depth, i, ".");
            }
        }
    };

    const startSimulation = () => {
        setIsPlaying(true);
        backTracking(0);
    };

    const renderBoard = () => {
        return board.map((row, rowIndex) => (
            <div key={rowIndex} style={{ display: "flex" }}>
                {row.map((col, colIndex) => (
                    <div
                        key={colIndex}
                        style={{
                            width: "50px",
                            height: "50px",
                            border: "1px solid black",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor:
                                (rowIndex + colIndex) % 2 === 0
                                    ? "white"
                                    : "gray",
                        }}
                    >
                        {col}
                    </div>
                ))}
            </div>
        ));
    };

    return (
        <div>
            <h1>n-Queens 문제</h1>
            <div>{renderBoard()}</div>
            <button onClick={startSimulation} disabled={isPlaying}>
                시뮬레이션 시작
            </button>
        </div>
    );
};

export default NQueens;
